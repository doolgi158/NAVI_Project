import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Userlogin } from "../api/naviApi";

const initState = {
    username:'',
    token:'',
};

export const loginAsync = createAsyncThunk('loginAsync', (param) => {
    return Userlogin(param);
});

const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: initState,
  reducers: {
    login: (state, action) => {
        const data = action.payload;
        
        return {username: data.id};
    },
    logout: (state, action) => {
        return {username:''};
    }
  },
    extraReducers: (builder) => {
    builder.addCase(loginAsync.pending, (state, action) => {
        // 로그인 요청이 시작될 때 상태 업데이트 (예: 로딩 상태)
        })
      .addCase(loginAsync.fulfilled, (state, action) => {
        // 로그인 요청이 성공했을 때 상태 업데이트
        const data = action.payload;
        console.log(data);
        return {username: data.id, token: data.accessToken};
      })
      .addCase(loginAsync.rejected, (state, action) => {
        // 로그인 요청이 실패했을 때 상태 업데이트
      });
    }
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;