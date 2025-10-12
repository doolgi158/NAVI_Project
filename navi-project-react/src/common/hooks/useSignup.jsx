import { useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { signup } from "../api/naviApi";
import { useModal } from "../components/login/ModalProvider";

export const useSignupForm = (form) => {
  const { showModal } = useModal();

  // ✅ 상태값
  const [idChecked, setIdChecked] = useState(false);
  const [idStatus, setIdStatus] = useState("");
  const [idMessage, setIdMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailCodeStatus, setEmailCodeStatus] = useState("");
  const [emailCodeMessage, setEmailCodeMessage] = useState("");

  // ✅ 아이디 중복 검사
  const handleCheckId = async () => {
    const idValue = form.getFieldValue("id");

    if (!idValue) {
      message.warning("아이디를 입력하세요.");
      setIdStatus("error");
      setIdMessage("아이디를 입력하세요.");
      setIdChecked(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/users/check-id`, {
        params: { id: idValue },
      });

      if (res.data.available === true) {
        message.success("사용 가능한 아이디입니다!");
        setIdStatus("success");
        setIdMessage("✅ 사용 가능한 아이디입니다!");
        setIdChecked(true);
      } else {
        message.warning("이미 사용 중인 아이디입니다.");
        setIdStatus("error");
        setIdMessage("❌ 이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      }
    } catch (err) {
      console.error("중복 검사 오류:", err);
      message.error("아이디 중복 검사 중 오류가 발생했습니다.");
      setIdStatus("error");
      setIdMessage("서버 오류로 중복 검사를 수행할 수 없습니다.");
      setIdChecked(false);
    }
  };

  // ✅ 회원가입 처리
  const handleSubmit = async (values) => {
    if (!idChecked) {
      message.warning("아이디 중복 검사를 먼저 진행해주세요.");
      setIdStatus("warning");
      setIdMessage("⚠️ 아이디 중복 검사를 먼저 진행해주세요.");
      return;
    }
    if (!emailVerified) {
      message.warning("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      const formattedValues = {
        ...values,
        birth: dayjs(values.birth).format("YYYY-MM-DD"),
        gender: values.gender,
        local: values.local === "local" ? "L" : "F",
      };

      const response = await signup(formattedValues);

      if (response.status === 200) {
        message.success("회원가입이 완료되었습니다!");
        setTimeout(() => {
          showModal("login");
        }, 600);
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      message.error(err.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  // ✅ input 변경 시 상태 초기화
  const resetIdState = () => {
    setIdChecked(false);
    setIdStatus("");
    setIdMessage("");
  };


// ✅ 이메일 인증 코드 발송
const handleSendEmail = async () => {
  const emailValue = form.getFieldValue("email");
  if (!emailValue) {
    message.warning("이메일을 입력하세요.");
    return;
  }

  try {
    setIsSending(true);
    const res = await axios.post(`http://localhost:8080/api/users/send-email`, {
      email: emailValue,
    });

    if (res.status === 200) {
      message.success("인증 코드가 이메일로 발송되었습니다!");
      setEmailStatus("success");
      setEmailMessage("인증 코드를 입력해주세요.");
      setEmailSent(true);
      setEmailCodeStatus("");
      setEmailCodeMessage("");
    }
  } catch (err) {
    console.error("이메일 전송 오류:", err);
    message.error("이메일 발송 중 오류가 발생했습니다.");
    setEmailStatus("error");
    setEmailMessage("메일 전송 실패");
  } finally {
    setIsSending(false);
  }
};

// ✅ 인증 코드 확인
const handleVerifyCode = async () => {
  const emailValue = form.getFieldValue("email");

  if (!emailCode) {
    message.warning("인증 코드를 입력하세요.");
    setEmailCodeStatus("error");
    setEmailCodeMessage("인증 코드를 입력해주세요.");    
    return;
  }

  try {
    setIsVerifying(true);
    const res = await axios.post(`http://localhost:8080/api/users/verify-code`, {
      email: emailValue,
      code: emailCode,
    });

    if (res.data.verified) {
      message.success("이메일 인증이 완료되었습니다!");
      setEmailVerified(true);
      setEmailStatus("success");
      setEmailMessage("✅ 인증 완료");
    }
  } catch (err) {
    console.error("인증 확인 오류:", err);
    message.error("서버 오류로 인증을 확인할 수 없습니다.");
    setEmailCodeStatus("error");
    setEmailCodeMessage("❌ 인증 코드가 올바르지 않습니다.");    
  } finally {
    setIsVerifying(false);
  }
};

  return {
    idChecked, idStatus, idMessage,
    handleCheckId, handleSubmit, resetIdState,
    emailVerified, emailStatus, emailMessage,
    handleSendEmail, handleVerifyCode, setEmailCode,
    isSending, isVerifying, emailCode, emailSent,
    emailCodeStatus, emailCodeMessage
  };
};
