import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setlogout } from "../slice/loginSlice";
import api, { API_SERVER_HOST } from "../api/naviApi";

/**
 * useAuthState
 * - 로그인 상태 감지 (Redux + localStorage)
 * - /api/users/me 요청 (api 인스턴스 기반)
 * - 프로필 변경 이벤트(profile-updated, profile-deleted) 감지
 */
export const useAuthState = () => {
    const dispatch = useDispatch();
    const loginState = useSelector((state) => state.login) || {};

    const [user, setUser] = useState(null);
    const [profileUrl, setProfileUrl] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // 로그인 상태 판별
    useEffect(() => {
        const token = loginState?.accessToken || localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, [loginState]);

    // 프로필 & 사용자 정보 불러오기
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            const res = await api.get("/users/me");
            const data = res.data?.data;
            if (data) {
                setUser(data);
                if (data.profile) {
                    setProfileUrl(`${API_SERVER_HOST}${data.profile}`);
                }
            }
        } catch (err) {
            console.warn("프로필 불러오기 실패:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // 로그인 여부 감지 후 프로필 자동 로드
    useEffect(() => {
        if (isLoggedIn) fetchUserProfile();
        else {
            setUser(null);
            setProfileUrl(null);
            setLoading(false);
        }
    }, [isLoggedIn, fetchUserProfile]);

    // 이벤트 리스너 등록 (프로필 변경/삭제)
    useEffect(() => {
        const handleProfileUpdated = (e) => {
            if (e.detail?.newProfile) {
                setProfileUrl(`${API_SERVER_HOST}${e.detail.newProfile}?t=${Date.now()}`);
            }
        };
        const handleProfileDeleted = () => setProfileUrl(null);

        window.addEventListener("profile-updated", handleProfileUpdated);
        window.addEventListener("profile-deleted", handleProfileDeleted);

        return () => {
            window.removeEventListener("profile-updated", handleProfileUpdated);
            window.removeEventListener("profile-deleted", handleProfileDeleted);
        };
    }, []);

    // 로그아웃 처리
    const handleLogout = useCallback(() => {
        dispatch(setlogout());
        setUser(null);
        setProfileUrl(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
    }, [dispatch]);

    return {
        user,
        profileUrl,
        setProfileUrl,
        isLoggedIn,
        loading,
        handleLogout,
        refetch: fetchUserProfile,
    };
};