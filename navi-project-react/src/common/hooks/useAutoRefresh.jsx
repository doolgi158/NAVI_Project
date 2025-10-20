import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api, { setAuthTokens } from "../api/naviApi";

export default function useAutoRefresh() {
    useEffect(() => {
        const checkAndRefresh = async () => {
            const at = localStorage.getItem("accessToken");
            const rt = localStorage.getItem("refreshToken");
            if (!rt) return;

            try {
                if (!at) {
                    const { data } = await api.post("/api/users/refresh", {}, {
                        headers: { Authorization: `Bearer ${rt}` },
                    });
                    if (data?.accessToken) setAuthTokens(data.accessToken, rt);
                    return;
                }

                const { exp } = jwtDecode(at);
                const now = Date.now() / 1000;
                if (exp - now < 30) {
                    const { data } = await api.post("/api/users/refresh", {}, {
                        headers: { Authorization: `Bearer ${rt}` },
                    });
                    if (data?.accessToken) setAuthTokens(data.accessToken, rt);
                }
            } catch (e) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        };

        const onUserAction = () => void checkAndRefresh();

        window.addEventListener("click", onUserAction);
        window.addEventListener("submit", onUserAction, true);
        window.addEventListener("focus", onUserAction);
        window.addEventListener("popstate", onUserAction);

        checkAndRefresh(); // 최초 1회 실행

        return () => {
            window.removeEventListener("click", onUserAction);
            window.removeEventListener("submit", onUserAction, true);
            window.removeEventListener("focus", onUserAction);
            window.removeEventListener("popstate", onUserAction);
        };
    }, []);
}