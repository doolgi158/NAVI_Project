/** 토큰 저장 */
export const setAuthTokens = (access, refresh) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
};

/** 토큰 제거 */
export const clearAuthTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

/** JWT 디코딩 */
export const parseJwt = (token) => {
    if (!token) return null;
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(base64);
    } catch {
        return null;
    }
};