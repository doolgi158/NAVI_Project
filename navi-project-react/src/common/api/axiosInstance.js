import axios from "axios";
import { API_SERVER_HOST } from "./naviApi";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_SERVER_HOST,
  withCredentials: true,
});

// 초기 AccessToken 헤더 설정
let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");
if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

// 토큰 세팅 함수 (로그인 직후 등에서 사용)
export const setAuthTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  api.defaults.headers.common.Authorization = `Bearer ${access}`;
};

// 요청 인터셉터 (항상 헤더에 accessToken 추가)
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log("인터셉트");
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (401이면 refresh 시도)
let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

function addSubscriber(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    console.log("🧩 401 발생 시점 accessToken:", localStorage.getItem("accessToken"));
    console.log("🧩 401 발생 시점 refreshToken:", localStorage.getItem("refreshToken"));
    const isRefreshCall = originalRequest?.url?.includes("/api/users/refresh");

    console.log("리프레시 시작");
    // refresh 자체 요청 실패는 무시
    if (isRefreshCall) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      console.log("🚨 AccessToken 만료 감지, refresh 시도 중...");
      if (isRefreshing) {
        // 이미 refresh 중이면 큐에 추가
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
        const rt = localStorage.getItem("refreshToken");
        if (!rt) throw new Error("RefreshToken이 없습니다.");

        const res = await axios.post(
          `${API_SERVER_HOST}/api/users/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${rt}` },
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("새 AccessToken이 없습니다.");

        // 토큰 갱신 및 재시도
        setAuthTokens(newAccessToken, rt);
        isRefreshing = false;
        onAccessTokenFetched(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ 리프레시 실패:", refreshError);
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history.push("/");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
