import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { useModal } from "../components/login/ModalProvider";
import { useEffect } from "react";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { token, role } = useSelector((state) => state.login);
    const { showModal } = useModal();
    const location = useLocation();

    // 관리자 페이지 접근 시 항상 검사
    const isAdminRoute = location.pathname.startsWith("/adm");

    // 관리자 페이지인데, 관리자 권한이 아닌 경우
    if (isAdminRoute && role !== "ADMIN") {
        alert("접근 권한이 없습니다.");
        return <Navigate to="/" replace />;
    }

    // 로그인 안 했을 경우 모달 열기
    useEffect(() => {
        if (!token) {
            showModal("login");
        }
    }, [token, showModal]);

    // 로그인하지 않은 경우
    if (!token) return null;

    // 권한이 부족한 경우
    if (requiredRole && role !== requiredRole && role !== "ADMIN") {
        alert("접근 권한이 없습니다.");
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;