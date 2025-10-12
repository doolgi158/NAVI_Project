import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setlogin } from "../../../common/slice/loginSlice";

const RedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // ✅ provider 추출 (Google, Kakao, Naver 중 어느 것인지)
    const url = new URL(window.location.href);
    let provider = "kakao";
    
    if (url.href.includes("google")) provider = "google";
    else if (url.href.includes("kakao")) provider = "kakao";
    else if (url.href.includes("navi")) provider = "naver";

    if (!provider) return;
    // ✅ 백엔드 요청
    axios
      .get(`http://localhost:8080/api/auth/oauth/${provider}?code=${code}`)
      .then((res) => {
        dispatch(setlogin({ 
          username: res.data.id,
          token: res.data.accessToken,
          ip: res.data.ip
        }));

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        navigate("/");
      })
      .catch((err) => {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/");
      });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-700">
      <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
      <p className="text-sm text-gray-500">잠시만 기다려주세요 🕐</p>
    </div>
  );
};

export default RedirectPage;
