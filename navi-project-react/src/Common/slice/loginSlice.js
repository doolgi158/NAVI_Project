import { createSlice } from "@reduxjs/toolkit";
import { getCookie, removeCookie, setCookie } from "../util/cookie";

const initState = {
  username: "",
  token: "",
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
      state.username = action.payload.username;
      state.token = action.payload.token || "";
      
      // 에러가 없을 때만 쿠키 저장
      if(!action.payload.error){
        setCookie("userCookie", JSON.stringify(action.payload), 1);
      }
    },
    logout: (state) => {
      state.username = "";
      state.token = "";
      removeCookie("userCookie");
    },
  },
});

export const { setlogin, logout } = loginSlice.actions;
export default loginSlice.reducer;