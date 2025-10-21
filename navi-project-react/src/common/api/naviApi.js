import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

const api = axios.create({
  baseURL: "/api",
});

// ✅ JWT 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 토큰 만료 자동 처리 (refresh 로직 포함)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // ❗ refresh 로직 조건
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        console.log("🔄 accessToken 만료 — refresh 시도");

        try {
          // refreshToken으로 새 토큰 요청
          const res = await axios.get(
            `${API_SERVER_HOST}/api/users/refresh?refreshToken=${refreshToken}`
          );

          const newAccessToken = res.data.accessToken;

          // localStorage 갱신
          localStorage.setItem("accessToken", newAccessToken);

          // 헤더에 새 토큰 설정 후 재요청
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          console.warn("❌ refreshToken 만료 — 로그인 필요");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        console.warn("⚠️ refreshToken 없음 — 로그인 필요");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export const getOne = async (domain, id) => {
  const prefix = `/${domain}`;
  const res = await api.get(`${prefix}/${id}`);
  return res.data;
};

export const getList = async (domain, pageParam) => {
  const { page, size } = pageParam;
  const prefix = `/${domain}`;
  const res = await api.get(`${prefix}`, { params: { page, size } });
  return res.data;
};

export const searchFlights = async (flightParam) => {
  const res = await api.post(`/flight/detail`, flightParam, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const socialLogin = async (provider, code) => {
  const res = await api.get(`/auth/oauth/${provider}?code=${code}`);
  return res.data;
};

export const getKakaoMapConfig = async () => {
  const res = await api.get(`/config/kakao`);
  return res.data;
};

export const signup = async (userData) => {
  const res = await api.post(`/users/signup`, userData, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// JWT 토큰 getter
export const getAccessToken = () =>
  localStorage.getItem("ACCESS_TOKEN") ||
  localStorage.getItem("accessToken") ||
  null;

// JWT decode
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default api;
