import axios from "axios";
import { clearAuthTokens, setAuthTokens } from "./tokenUtil";

export const API_SERVER_HOST = "http://localhost:8080";

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: `${API_SERVER_HOST}/api`,
    withCredentials: true,
});

// 요청 인터셉터 (AccessToken 자동 첨부)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 (401 → 자동 토큰 재발급)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 처리 (AccessToken 만료)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                clearAuthTokens();
                window.dispatchEvent(new Event("auth-expired"));
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_SERVER_HOST}/api/users/refresh`, {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                const { accessToken, refreshToken } = res.data;
                setAuthTokens(accessToken, refreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                clearAuthTokens();
                window.dispatchEvent(new Event("auth-expired"));
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;