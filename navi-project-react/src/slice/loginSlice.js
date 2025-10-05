import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Userlogin } from "../api/UserApi";

const initState = {
    userid:'',
    userpw:'',
    usertoken:'',
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
        
        return {userid: data.userid};
    },
    logout: (state, action) => {
        return {userid:''};
    }
  },
    extraReducers: (builder) => {
    builder.addCase(loginAsync.pending, (state, action) => {
        // 로그인 요청이 시작될 때 상태 업데이트 (예: 로딩 상태)
        console.log('로그인 요청 중...');
        })
      .addCase(loginAsync.fulfilled, (state, action) => {
        // 로그인 요청이 성공했을 때 상태 업데이트
        console.log('로그인 성공:');
        const payload = action.payload;
        return payload;

      })
      .addCase(loginAsync.rejected, (state, action) => {
        // 로그인 요청이 실패했을 때 상태 업데이트
        console.error('로그인 실패:');
      });
    }
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;