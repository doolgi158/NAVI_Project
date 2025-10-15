import { createSlice } from "@reduxjs/toolkit";
import { getCookie, removeCookie, setCookie } from "../util/cookie";
import { API_SERVER_HOST } from "../api/naviApi";
import axios from "axios";
import { setAuthTokens } from "../api/axiosInstance";

const initState = {
  username: "",
  accessToken: "",
  refreshToken: "",
  role:"",
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
      
      const { username, accessToken, refreshToken, role, ip } = action.payload;
      // roles 배열이면 첫 번째만 사용
      let roleValue = "";
      if (Array.isArray(role)) {
        roleValue = role[0];
      } else {
        roleValue = role;
      }   
      
      state.username = username;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = roleValue;
      state.ip = ip;

      // axiosInstance에도 등록
      setAuthTokens(accessToken, refreshToken);

      // 쿠키/로컬 저장
      setCookie("userCookie", JSON.stringify(action.payload), 1);

      // 에러가 없을 때만 쿠키 저장
      if(!action.payload.error){
        setCookie("userCookie", JSON.stringify(action.payload), 1);
      }
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
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
            "X-Refresh-Token": refreshToken,
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
      state.accessToken = "";
      state.refreshToken = "";
      state.token = "";
      state.ip = "";
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});

export const { setlogin, setlogout } = loginSlice.actions;
export default loginSlice.reducer;