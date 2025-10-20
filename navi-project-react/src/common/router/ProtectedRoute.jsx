import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { accessToken, role } = useSelector((state) => state.login);
  const location = useLocation();

  // 관리자 페이지 접근 시 항상 검사
  const isAdminRoute = location.pathname.startsWith("/adm");

  // Helper: role이 배열이든 문자열이든 "ADMIN" 포함 여부 판별
  const hasAdminRole = Array.isArray(role)
    ? role.includes("ADMIN")
    : role === "ADMIN";

  const hasRequiredRole = requiredRole
    ? Array.isArray(role)
      ? role.includes(requiredRole)
      : role === requiredRole
    : true;

  // 관리자 페이지인데, 관리자 권한이 아닌 경우
  if (isAdminRoute && !hasAdminRole) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  // 로그인하지 않은 경우
  if (!accessToken) return <Navigate to="/" replace />;

  // 명시된 권한(requiredRole)에 해당하지 않고 관리자도 아닐 경우
  if (!hasRequiredRole && !hasAdminRole) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;