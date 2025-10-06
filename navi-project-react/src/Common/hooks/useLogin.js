// src/hooks/useLogin.js
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAsync } from "./../slice/loginSlice";
import { useModal } from "../components/Login/ModalProvider";

const host = "http://localhost:8080";

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showModal, closeModal } = useModal();
  
  // 로그인 시도 함수
  const login = async (values) => {
    try {
      // 1️⃣ 로그인 시도
      const data = await dispatch(loginAsync(values)).unwrap();

      // 2️⃣ 성공 시
      const ip = await getUserIP();
      await axios.post(`${host}/api/login-try/success/${data.no}?ip=${ip}`);
      closeModal();

      if (data.id === "naviadmin") navigate("/adm/dashboard", { replace: true });
      else navigate("/", { replace: true });

      return true;
    } catch (err) {
      // 3️⃣ 실패 시
      const ip = await getUserIP();
      await axios.post(`${host}/api/login-try/fail/0?ip=${ip}`);
      showModal("login");
      return false;
    }
  };

  // IP 조회 함수
  const getUserIP = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "127.0.0.1";
    }
  };

  return { login };
};
