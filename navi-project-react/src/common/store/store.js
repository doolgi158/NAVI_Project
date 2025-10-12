import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../slice/loginSlice";

const store = configureStore({
  reducer: {
    login: loginReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
