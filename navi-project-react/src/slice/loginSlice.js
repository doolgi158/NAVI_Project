import { createSlice } from "@reduxjs/toolkit";

const initState = {
    userid:'',
    userpw:'',
    usertokken:'',
};

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
    }
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;