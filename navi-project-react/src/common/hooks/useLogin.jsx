import axios from "axios";
import { useDispatch } from "react-redux";
import { setlogin } from "../slice/loginSlice";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import { API_SERVER_HOST } from "../api/naviApi";

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

      const response = await axios.post(`${API_SERVER_HOST}/api/users/login`, params, {
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
        dispatch(setlogin({ username: username, accessToken: accessToken, refreshToken: refreshToken, role: roles, ip: ip }));

        await new Promise((resolve) => setTimeout(resolve, 100));

        // 리디렉션 처리
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");

        // 관리자 전용 페이지 분기
        if (Array.isArray(roles) && roles.includes("ADMIN")) {
          navigate("/adm/dashboard");
        } else {
          navigate(redirectPath);
        }
        console.log(response);
        return { success: true, message: "로그인 성공" };
      }

      if (response.status === 403) {
        const state = response.data.data; // "sleep" or "delete"
        const messageText = response.data.message || "5회 이상 실패로 10분간 로그인 차단되었습니다.";

        if (state === "sleep") {
          // 휴면계정 → 복구 의사 확인 모달
          Modal.confirm({
            title: "휴면 계정 안내",
            content: "이 계정은 휴면 상태입니다. 복구하시겠습니까?",
            okText: "복구하기",
            cancelText: "취소",
            centered: true,
            onOk: async () => {
              try {
                const wakeResponse = await axios.post(`${API_SERVER_HOST}/api/users/reactivate`, { username: values.username });
                if (wakeResponse.status === 200) {
                  message.success("계정이 복구되었습니다. 다시 로그인해주세요.");
                } else {
                  message.error("계정 복구에 실패했습니다.");
                }
              } catch {
                message.error("복구 요청 중 오류가 발생했습니다.");
              }
            },
            onCancel: () => {
              message.info("로그인이 취소되었습니다.");
            },
          });
          return { success: false, message: "휴면 계정입니다." };
        }

        if (state === "delete") {
          // 탈퇴 계정 → 단순 차단 메시지
          return message.error("이미 탈퇴한 계정입니다. 새로운 계정으로 회원가입해주세요.");
        }

        // 그 외 403 케이스 (ex. 로그인 시도 5회 초과 등)
        return { success: false, message: messageText };
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