import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../slice/loginSlice";
import accReducer from "../slice/accSlice";

const store = configureStore({
  reducer: {
    // 각 slice를 하나의 store에 결합
    login: loginReducer,
    acc: accReducer,
  },
  // [ NOTE ]: 개발 환경일 때만 Redux DevTools 활성화 (Redux 상태를 편하게 추적 가능)
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
