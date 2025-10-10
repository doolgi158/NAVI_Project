import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./common/slice/loginSlice.js";

export default configureStore({
  reducer: {
    login: loginSlice,
  },
});