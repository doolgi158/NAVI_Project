import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout as logoutSlice } from "../../store/authSlice"; // 사용중인 slice 이름에 맞게
import { host } from "../../api/naviApi";

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
      await fetch(`${host}/api/users/logout/on-close`, {
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
        navigator.sendBeacon?.(`${host}/api/users/logout/on-close`, blob);
      } catch {}
    } finally {
      clientCleanup();
    }
  };

  useEffect(() => {
    // 다양한 종료/백그라운드 시그널 커버
    const onBeforeUnload = () => { sendLogout("beforeunload"); };
    const onPageHide = () => { sendLogout("pagehide"); }; // 모바일 Safari용
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendLogout("visibility_hidden");
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
