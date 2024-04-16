
import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { fetchAllUser } from '../services/UserService';
import ReactPaginate from 'react-paginate';
import ModalAddNew from "./ModalAddNew";
import ModalEditUser from './ModalEditUser';
import ModalConfirm from './ModalConfirm';
import lodash, { debounce } from 'lodash';
import './TableUser.scss'
import { CSVLink } from "react-csv";
import Papa from "papaparse";
import { toast } from 'react-toastify';

const TableUsers = (prop) => {

  const [listUsers, setListUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isShowModalAddNew, setIsShowModalAddNew] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [dataUserEdit, setDataUserEdit] = useState({});
  const [dataUserDelete, setDataUserDelete] = useState({});
  const [sortBy, setSortBy] = useState("asc");
  const [sortField, setSortField] = useState("id");
  const [dataExport, setDataExport] = useState([]);

  // const [keyword, setKeyword] = useState("");

  const handleClose = () => {
    setIsShowModalAddNew(false);
    setIsShowModalEdit(false);
    setIsShowModalDelete(false);
  }

  //hash code dữ liệu thêm mới(be không hoạt động)
  const handleUpdateTable = (user) => {
    setListUsers([user, ...listUsers]);
  }

  //hash code dữ liệu sau xóa(be không hoạt động)
  const handleEditUserFromModal = (user) => {
    let cloneListUsers = lodash.cloneDeep(listUsers);
    let index = listUsers.findIndex(item => item.id === user.id);
    cloneListUsers[index].first_name = user.first_name;
    setListUsers(cloneListUsers);
  }

  //hash code dữ liệu thay đổi(be không hoạt động)
  const handleDeleteUserFromModal = (user) => {
    let cloneListUsers = lodash.cloneDeep(listUsers);
    cloneListUsers = cloneListUsers.filter(item => item.id !== user.id);
    setListUsers(cloneListUsers);
  }

  //Call hàm getUsers
  useEffect(() => {
    getUsers(1);
  }, [])

  //Call api get all User
  const getUsers = async (page) => {
    let res = await fetchAllUser(page);
    if (res && res.data) {
      setTotalUsers(res.total);
      setTotalPages(res.total_pages);
      setListUsers(res.data);
    }
  }

  // Xử lý dữ liệu các trang
  const handlePageClick = (event) => {
    getUsers(+ event.selected + 1);
  }

  const handleEditUser = (user) => {
    setDataUserEdit(user);
    setIsShowModalEdit(true);
  }

  const handleDeleteUser = (user) => {
    setIsShowModalDelete(true);
    setDataUserDelete(user);
    console.log(user)
  }

  const handleSort = (sortBy, sortField) => {
    setSortBy(sortBy);
    setSortField(sortField);

    let cloneListUsers = lodash.cloneDeep(listUsers);
    cloneListUsers = lodash.orderBy(cloneListUsers, [sortField], [sortBy]);
    setListUsers(cloneListUsers);
  }

  const handleSearch = debounce((event) => {
    console.log(event.target.value);
    let term = event.target.value;
    if (term) {
      let cloneListUsers = lodash.cloneDeep(listUsers);
      cloneListUsers = cloneListUsers.filter(item => item.email.includes(term))
      setListUsers(cloneListUsers);
    } else {
      getUsers(1);
    }
  }, 500)

  // const csvData = [
  //   ["firstname", "lastname", "email"],
  //   ["Ahmed", "Tomi", "ah@smthing.co.com"],
  //   ["Raed", "Labes", "rl@smthing.co.com"],
  //   ["Yezzi", "Min l3b", "ymin@cocococo.com"]
  // ];

  const getUserExport = (event, done) => {
    let result = [];
    if (listUsers && listUsers.length > 0) {
      result.push(["Id", "Email", "First name", "Last name"]);
      listUsers.map((item, index) => {
        let arr = [];
        arr[0] = item.id;
        arr[1] = item.email;
        arr[2] = item.first_name;
        arr[3] = item.last_name;
        result.push(arr);
      })
      setDataExport(result);
      done();
    }
  }

  const handleInportCSV = (event) => {
    if (event.target && event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (file.type !== "text/csv") {
        toast.error("Only accept csv file...")
        return;
      }

      Papa.parse(file, {
        // header: true,
        complete: function (results) {
          let rawCSV = results.data;
          if (rawCSV.length > 0) {
            if (rawCSV[0] && rawCSV[0].length === 3) {
              if (rawCSV[0][0] !== "email" || rawCSV[0][1] !== "first_name" || rawCSV[0][2] !== "last_name") {
                toast.error("Wrong name field")
              } else {
                let result = [];
                rawCSV.map((item, index) => {
                  if (index > 0 && item.length === 3) {
                    let obj = {};
                    obj.email = item[0];
                    obj.first_name = item[1];
                    obj.last_name = item[2];
                    result.push(obj);
                  }
                })
                console.log(result);
                setListUsers(result);
              }
            } else {
              toast.error("Wrong format CSV file")
            }
          } else {
            toast.error("Not found data in CSV")
          }
        }
      });
    }
  }


  return (<>
    <div className="my-3 add-new d-sm-flex">
      <span><b>List User</b></span>
      <div className='group-btns mt-sm-0 mt-2'>
        <label htmlFor="import" className='btn btn-warning'>
          <i className="fa-solid fa-upload"></i> Import</label>
        <input type="file" id='import' hidden
          onChange={(event) => handleInportCSV(event)} />
        <CSVLink
          data={dataExport}
          filename={"user.csv"}
          className="btn btn-primary"
          asyncOnClick={true}
          onClick={getUserExport}>
          <i className="fa-solid fa-download"></i>
          Export
        </CSVLink>
        <button className="btn btn-success"
          onClick={() => setIsShowModalAddNew(true)}>
          <i className="fa-solid fa-circle-plus"></i>
          Add new
        </button>
      </div>

    </div>
    <div className='col-12 col-sm-4 my-3'>
      <input type="text" className='form-control'
        placeholder='Serach by email'
        onChange={(event) => handleSearch(event)} />
    </div>

    <div className='customize-table'>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <div className='sort-header'>
                <span>ID</span>
                <span><i className="fa-solid fa-arrow-down-long"
                  onClick={() => handleSort("desc", "id")}></i>
                  <i className="fa-solid fa-arrow-up-long"
                    onClick={() => handleSort("asc", "id")}></i></span>
              </div>
            </th>
            <th>Email</th>
            <th>
              <div className='sort-header'>
                <span>First name</span>
                <span><i className="fa-solid fa-arrow-down-long"
                  onClick={() => handleSort("desc", "first_name")}></i>
                  <i className="fa-solid fa-arrow-up-long"
                    onClick={() => handleSort("asc", "first_name")}></i></span>
              </div>
            </th>
            <th>Last name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listUsers && listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <tr key={`users-${index}`}>
                  <td>{item.id}</td>
                  <td>{item.email}</td>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>
                    <button className='btn btn-warning mx-3' onClick={() => handleEditUser(item)}>Edit</button>
                    <button className='btn btn-danger' onClick={() => handleDeleteUser(item)}>Delete</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </div>


    <ReactPaginate
      breakLabel="..."
      nextLabel="next >"
      onPageChange={handlePageClick}
      pageRangeDisplayed={5}
      pageCount={totalPages}
      previousLabel="< previous"

      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination"
      activeClassName="active"
    />

    <ModalAddNew
      show={isShowModalAddNew}
      handleClose={handleClose}
      handleUpdateTable={handleUpdateTable}
    />

    <ModalEditUser
      show={isShowModalEdit}
      handleClose={handleClose}
      dataUserEdit={dataUserEdit}
      handleEditUserFromModal={handleEditUserFromModal}
    />

    <ModalConfirm
      show={isShowModalDelete}
      handleClose={handleClose}
      dataUserDelete={dataUserDelete}
      handleDeleteUserFromModal={handleDeleteUserFromModal}
    />
  </>)
}

export default TableUsers;