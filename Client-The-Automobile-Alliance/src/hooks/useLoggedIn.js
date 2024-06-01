import axios from "axios";
import { useDispatch } from "react-redux";
import { authActions } from "../redux/auth";
import jwt_decode from "jwt-decode";
const useLoggedIn = () => {
    const dispatch = useDispatch();

    return async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return;
            }

            const axiosInstance = axios.create({
                baseURL: process.env.REACT_APP_API_URL,
            });

            const { data } = await axiosInstance.get("/users/" + jwt_decode(token)._id);
            console.log('0');
            const payload = jwt_decode(token);
            console.log('1');
            dispatch(authActions.login(payload));
            console.log('2');
            return data;
        } catch (err) {
            console.log('error from useLoggedIn !! ' + err.message);
        }
    };
};

export default useLoggedIn;
