import { createContext, useContext, useState } from "react";
import LoginModal from "./LoginModal.jsx";
// import SignupModal from "./SignupModal.jsx";
// import ForgotModal from "./ForgotModal.jsx";

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);

  const showModal = (name) => setOpenModal(name);
  const closeModal = () => setOpenModal(false);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {/* 로그인 모달 */}
      <LoginModal open={openModal === "login"} onClose={() => closeModal(false)}/>

      {/* 앞으로 다른 모달도 이런 식으로 */}
      {/* <SignupModal open={openModal === "signup"} onClose={closeModal} /> */}
      {/* <ForgotModal open={openModal === "forgot"} onClose={closeModal} /> */}
    </ModalContext.Provider>
  );
};