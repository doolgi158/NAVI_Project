import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setlogout as logoutSlice } from "../slice/loginSlice";
import { API_SERVER_HOST } from "../api/naviApi";

export default function LogoutOnClose() {
  const dispatch = useDispatch();

  // 토큰 읽기 유틸 (프로젝트 구조에 맞게 수정)
  const getAccessToken = () => localStorage.getItem("accessToken");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  const clientCleanup = () => {
    dispatch(logoutSlice());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // 쿠키에 access/refresh를 쓰지 않는다면 위로 충분
    // httpOnly refresh-cookie를 쓰는 경우, 서버가 Set-Cookie; Max-Age=0로 지워줘야 함
  };

  const sendLogout = async (reason = "tab_close") => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    const payload = JSON.stringify({
      reason,
      at: new Date().toISOString(),
      accessToken: access || null,   // sendBeacon은 헤더 못 세팅할 수 있어 body로도 같이 보냄(백엔드 처리)
      refreshToken: refresh || null,
    });

    // 1순위: fetch keepalive (헤더 가능)
    try {
      await fetch(`${API_SERVER_HOST}/api/users/logout/on-close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: payload,
        keepalive: true, // 언로드 중에도 전송 시도
      });
    } catch (_) {
      // 2순위: navigator.sendBeacon (가장 안정적, 헤더 불가 → body에 토큰 포함)
      try {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon?.(`${API_SERVER_HOST}/api/users/logout/on-close`, blob);
      } catch {}
    } finally {
      clientCleanup();
    }
  };

    useEffect(() => {
        const sendLogout = () => {
        const username = localStorage.getItem("username");
        const accessToken = localStorage.getItem("accessToken");
        if (!username && !accessToken) return;

        const payload = JSON.stringify({
            reason: "visibility_hidden",
            at: new Date().toISOString(),
            username,
            accessToken,
        });
        
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${API_SERVER_HOST}/api/users/logout/on-close`, blob);
    };

        window.addEventListener("beforeunload", sendLogout);
        window.addEventListener("pagehide", sendLogout);
    return () => {
        window.removeEventListener("beforeunload", sendLogout);
        window.removeEventListener("pagehide", sendLogout);
    };
    }, []);

  return null;
}
