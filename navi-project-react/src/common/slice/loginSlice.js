import { createSlice } from "@reduxjs/toolkit";
import { getCookie, removeCookie, setCookie } from "../util/cookie";
import { API_SERVER_HOST } from "../api/naviApi";
import axios from "axios";

const initState = {
  username: "",
  token: "",
  ip: "",
};

// 쿠키에서 사용자 정보 로드
const loadUserCookie = () => {
  const userCookie = getCookie("userCookie");
  
  if(userCookie && userCookie.username) {
    userCookie.username = decodeURIComponent(userCookie.username);
  }
  
  return userCookie;
}

const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: loadUserCookie() || initState,
  reducers: {
    setlogin: (state, action) => {
      const payload = action.payload;

      state.username = action.payload.username;
      state.token = action.payload.token;
      state.ip = action.payload.ip;

      // 에러가 없을 때만 쿠키 저장
      if(!action.payload.error){
        setCookie("userCookie", JSON.stringify(action.payload), 1);
      }
    },
    setlogout: (state) => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // 백엔드에 로그아웃 이력 전송
      axios.post(
        `${API_SERVER_HOST}/api/users/logout`,
        { 
          user: { id: state.username },
          ip: state.ip,
        },
        {  
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      ).catch((err) => {
      });

      // 로컬 저장소 초기화
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      removeCookie("userCookie");

      // Redux 상태 초기화
      state.username = "";
      state.token = "";
      state.ip = "";
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});

export const { setlogin, setlogout } = loginSlice.actions;
export default loginSlice.reducer;