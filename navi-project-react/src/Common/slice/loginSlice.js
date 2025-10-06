import { createSlice } from "@reduxjs/toolkit";

const initState = {
  username: "",
  token: "",
};

const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: initState,
  reducers: {
    setlogin: (state, action) => {
      state.username = action.payload.username;
      state.token = action.payload.token || "";
    },
    logout: (state) => {
      state.username = "";
      state.token = "";
    },
  },
});

export const { setlogin, logout } = loginSlice.actions;
export default loginSlice.reducer;