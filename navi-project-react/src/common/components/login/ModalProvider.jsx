import { createContext, useContext, useEffect, useState } from "react";
import LoginModal from "./LoginModal.jsx";
import { useNavigate } from "react-router-dom";

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const showModal = (name) => setOpenModal(name);
  const closeModal = () => setOpenModal(false);

   useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    // provider 판별
    const pathname = url.pathname;
    let provider = null;
    if (pathname.includes("google")) provider = "google";
    else if (pathname.includes("kakao")) provider = "kakao";
    else if (pathname.includes("naver")) provider = "naver";

    // 소셜 로그인 redirect 처리
    if (code && provider) {
      (async () => {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/auth/oauth/${provider}?code=${code}`
          );

          const data = res.data.data;
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          alert(`${provider.toUpperCase()} 로그인 성공!`);
          setOpenModal(false); // 모달 닫기
          navigate("/"); // 홈 이동

          // 🔹 URL 정리 (주소창에서 code 파라미터 제거)
          window.history.replaceState({}, document.title, "/");
        } catch (err) {
          console.error("❌ 소셜 로그인 실패:", err);
          alert("로그인에 실패했습니다. 다시 시도해주세요.");
        }
      })();
    }
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {/* 로그인 모달 */}
      <LoginModal open={openModal === "login"} onClose={() => closeModal(false)}/>
    </ModalContext.Provider>
  );
};