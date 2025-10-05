import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./slice/loginslice";

export default configureStore({
  reducer: {
    "loginSlice": loginSlice
  }
});