import { useNavigate } from "react-router-dom";
import { socialLogin } from "../api/authApi";

export const useSocialLogin = () => {
  const navigate = useNavigate();

  const handleRedirect = async (provider, code) => {
    try {
      const res = await socialLogin(provider, code);
      const { data } = res;

      // JWT 저장 (accessToken만 로컬스토리지에 저장)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      alert(`${provider} 로그인 성공!`);
      navigate("/"); // 홈으로 이동
    } catch (err) {
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return { handleRedirect };
};
