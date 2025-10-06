import { createSlice } from "@reduxjs/toolkit";

const initState = {
  username: "",
  token: "",
};

const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: initState,
  reducers: {
    login: (state, action) => {
      state.username = action.payload.username;
    },
    logout: (state) => {
      state.username = "";
      state.token = "";
    },
  },
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;