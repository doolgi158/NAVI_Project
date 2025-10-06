import axios from "axios";
import { useDispatch } from "react-redux";
import { login, logout } from "../slices/loginSlice.js";

const BASE_PREFIX = "http://localhost:8080/api";

export const useLogin = () => {
  const dispatch = useDispatch();

  const loginAction = async (values) => {
    const params = new URLSearchParams();
    params.append("username", values.username);
    params.append("password", values.password);

    try {
      const response = await axios.post(`${BASE_PREFIX}/users/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // 성공 시 IP 기록
      const ipRes = await axios.get("https://api.ipify.org?format=json");
      const ip = ipRes.data.ip;
      await axios.post(`${BASE_PREFIX}/login-try/success?ip=${ip}`);

      // Redux 상태 업데이트
      dispatch(login({ username: response.data.id }));

      return true;
    } catch (err) {
      // 실패 시 IP 기록
      try {
        const ipRes = await axios.get("https://api.ipify.org?format=json");
        const ip = ipRes.data.ip;
        const res = await axios.post(`${BASE_PREFIX}/login-try/fail?ip=${ip}`);
        if (res.data.status === "LOCKED") {
          alert(res.data.message);
          return false;
        }
      } catch (ipErr) {
        console.error("IP 전송 실패:", ipErr);
      }

      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      return false;
    }
  };

  const logoutAction = () => dispatch(logout());

  return { loginAction, logoutAction };
};