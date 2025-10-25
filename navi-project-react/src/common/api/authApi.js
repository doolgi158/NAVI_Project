import api, { API_SERVER_HOST } from "./apiClient";
import { setAuthTokens } from "./tokenUtil";

export const loginUser = async (values) => {
    const params = new URLSearchParams();
    params.append("username", values.username);
    params.append("password", values.password);
    params.append("ip", values.ip || "");

    const res = await api.post(`/users/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: () => true,
    });

    if (res.status === 200) {
        const { accessToken, refreshToken, username, roles, userNo } = res.data;
        setAuthTokens(accessToken, refreshToken);
        return { success: true, username, roles, userNo };
    }

    return { success: false, status: res.status, data: res.data };
};

export const logoutUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    await api.post(`/users/logout`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => { });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const signupUser = async (data) => api.post(`/users/signup`, data);

export const socialLogin = async (provider, code) =>
    api.get(`/auth/oauth/${provider}?code=${code}`);

export const reactivateUser = async (username) =>
    api.post(`/users/reactivate`, { username });
