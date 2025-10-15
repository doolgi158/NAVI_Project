import axios from "axios";
import { API_SERVER_HOST } from "./naviApi";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_SERVER_HOST,
  withCredentials: true, // CORS 쿠키 허용 시 필요
});

// Access Token을 메모리에 저장 (Redux 상태와 동기화 가능)
let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");

// Access Token 설정 함수 (로그인 시 호출)
export const setAuthTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
};

// 요청 인터셉터 → Authorization 자동 추가
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 → 401 발생 시 자동 갱신
let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token 만료 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_SERVER_HOST}/api/users/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("새 Access Token이 없습니다.");

        // 메모리 및 로컬 저장소 갱신
        setAuthTokens(newAccessToken, refreshToken);

        isRefreshing = false;
        onAccessTokenFetched(newAccessToken);

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ 리프레시 실패:", refreshError);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // 로그인 만료 → 로그인 페이지로 이동
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;