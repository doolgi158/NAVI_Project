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
  (response) => {
    console.log("✅ 응답 인터셉터 정상 응답 통과");
    return response;
  },
  async (error) => {
    // response 자체가 없으면 네트워크/CORS 문제
    if (!error.response) {
      console.error("🚫 응답 없음 (CORS 또는 네트워크 에러):", error);
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes("/api/users/refresh");

    console.log("🔍 요청 URL:", error.config?.url);
    console.log("🔍 상태 코드:", status);
    console.log("🧩 현재 accessToken:", localStorage.getItem("accessToken"));
    console.log("🧩 현재 refreshToken:", localStorage.getItem("refreshToken"));
    console.log("리프레시 시작");

    console.log("리프레시 시작 전 체크");
    // refresh 자체 요청 실패는 무시
    if (isRefreshCall) {
      console.log("⚠️ refresh 자체 요청에서 오류 → 패스");
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      console.log("🚨 AccessToken 만료 감지, refresh 시도 중...");
      if (isRefreshing) {
        // 이미 refresh 중이면 큐에 추가
        console.log("⏳ 이미 리프레시 중 → 큐에 등록");
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            console.log("✅ 새 토큰으로 재요청 실행");
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = localStorage.getItem("refreshToken");
        console.log("🔑 현재 refreshToken:", rt);
        if (!rt) throw new Error("RefreshToken이 없습니다.");

        console.log("🔄 refresh API 호출 시작...");
        const res = await axios.post(
          `${API_SERVER_HOST}/api/users/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${rt}` },
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.accessToken;
        console.log("✅ refresh 응답 수신, newAccessToken:", newAccessToken);

        if (!newAccessToken) throw new Error("새 AccessToken이 없습니다.");

        // 토큰 갱신 및 재시도
        setAuthTokens(newAccessToken, rt);
        isRefreshing = false;
        onAccessTokenFetched(newAccessToken);

        console.log("🔁 원래 요청 재시도:", originalRequest.url);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ 리프레시 실패:", refreshError);
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        console.log("🚪 토큰 삭제 후 홈으로 이동");
        history.push("/");
        return Promise.reject(refreshError);
      }
    }
    console.log("⚠️ 401 아님 또는 _retry true, 일반 오류:", status);
    return Promise.reject(error);
  }
);

export default api;
