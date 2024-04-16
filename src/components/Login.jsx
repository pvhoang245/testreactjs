import { useEffect, useState } from "react";
import { loginApi } from "../services/UserService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const Login = () => {

    const { loginContext } = useContext(UserContext);

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [loadingApi, setLoadingApi] = useState(false);

    // useEffect(() => {
    //     let token = localStorage.getItem("token");
    //     if(token) {
    //         navigate("/");
    //     }
    // })

    const handleLogin = async () => {
        if(!email || !password) {
            toast.error("Email password is required")
            return;
        }
        setLoadingApi(true);
        let res = await loginApi(email.trim(), password);
        if(res && res.token) {
            loginContext(email, res.token);
            navigate("/");
        } else {
            if(res && res.status === 400) {
                toast.error(res.data.error)
            }
        }
        setLoadingApi(false);
    }

    const handleGoBack = () => {
        navigate("/");
    }

    const handlePressEnter = (event) => {
        if(event && event.key ==="Enter") {
            handleLogin();
        }
    }

    return <>
        <div className="login-container col-12 col-sm-4">
            <div className="title">Login</div>
            <div className="text">Email or Username ( eve.holt@reqres.in )</div>
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)} />
            
            <div className="input-2">
                <input
                type={isShowPassword===true?"text":"password"}
                placeholder="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => handlePressEnter(event)} />
                <i className={isShowPassword===true?"fa-solid fa-eye": "fa-solid fa-eye-slash"}
                onClick={() => setIsShowPassword(!isShowPassword)}></i>
            </div>
            
            <button className={email && password? "active" : ""}
            disabled={email && password ? false : true}
            onClick={() => handleLogin()}>
                {loadingApi && <i className="fa-solid fa-sync fa-spin"></i>}
                &nbsp; Login</button>
            <div className="back">
                <i className="fa-solid fa-angles-left"></i>
                <span onClick={() => handleGoBack()}>&nbsp; Go back</span>
            </div>

        </div>
    </>
}


export default Login;