import axios from "axios";
import { getCookie, setCookie } from "./cookie";
import { BASE_PREFIX } from "../api/naviApi";

const jwtAxios = axios.create({
  baseURL: BASE_PREFIX,
});

// RefreshToken 요청 함수
const refreshJWT = async (refreshToken) => {
  const response = await axios.get(
    `${BASE_PREFIX}/users/refresh?refreshToken=${refreshToken}`
  );
  return response.data;
};

// 요청 인터셉터
jwtAxios.interceptors.request.use(
  (config) => {
    const userCookie = getCookie("userCookie");
    if (!userCookie) {
      return Promise.reject({
        response: { status: 401, message: "No Cookie Found" },
      });
    }

    const { accessToken } = userCookie;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
jwtAxios.interceptors.response.use(
  (response) => response, // 성공 응답 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // accessToken 만료 시 401 처리
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한루프 방지

      const userCookie = getCookie("userCookie");
      if (!userCookie) return Promise.reject(error);

      try {
        // refreshToken으로 새 토큰 발급
        const tokenResponse = await refreshJWT(userCookie.refreshToken);
        const { accessToken, refreshToken } = tokenResponse;

        // 쿠키 갱신
        const newCookie = { ...userCookie, accessToken, refreshToken };
        setCookie("userCookie", JSON.stringify(newCookie), 1);

        // 새 토큰으로 Authorization 헤더 갱신 후 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return jwtAxios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default jwtAxios;