import axios from "axios";
import { useDispatch } from "react-redux";
import { setlogin } from "../slice/loginSlice";
import { useNavigate } from "react-router-dom";
import { API_SERVER_HOST } from "../api/naviApi.js";

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = async (values) => {
    try {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);

      // 로그인 요청
      const params = new URLSearchParams();
      params.append("username", values.username);
      params.append("password", values.password);
      params.append("ip", values.ip);

      const response = await axios.post("/api/users/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: () => true,  // 에러 상태도 직접 처리
      });

      // 상태 코드별 처리
      if (response.status === 200) {
        const { accessToken, refreshToken, username, roles, ip } = response.data;
        
        // JWT 토큰 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", username);

        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Redux 상태 갱신
        dispatch(setlogin({ username: username, token: accessToken , role: roles, ip: ip }));

        // 리디렉션 처리
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");

        // 관리자 전용 페이지 분기
        if (username === "naviadmin") {
          navigate("/adm/dashboard");
        } else {
          navigate(redirectPath);
        }

        return { success: true, message: "로그인 성공" };
      }

      if (response.status === 403) {
        return { success: false, message: "5회 이상 실패로 10분간 로그인 차단되었습니다." };
      }

      if (response.status === 401) {
        return { success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
      }
      return { success: false, message: "서버 응답을 처리할 수 없습니다." };
    } catch (error) {
      return { success: false, message: "서버에 연결할 수 없습니다." };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logout());
  };

  return { login, logoutUser };
};