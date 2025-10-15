import { Form, Input, Button, Card, message, Modal } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "../../hooks/useLogin.jsx";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import SocialLoginButton from "./SocialLogin";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi.js";

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();
  const { login } = useLogin();

  const [clickedInside, setClickedInside] = useState(false);

  // 다음 input 이동을 위한 ref
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);

  const handleSubmit = async (values) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    const result = await login(values);
console.log(result);
    // 정상 로그인
    if (result.success) {
      message.success(result.message);
      form.resetFields();
      onClose();
      return;
    }

    // 휴면 계정
    if (result.sleep) {
      Modal.confirm({
        title: "휴면 계정 안내",
        content: "이 계정은 휴면 상태입니다. 지금 바로 정상 계정으로 전환하시겠습니까?",
        okText: "예, 전환합니다",
        cancelText: "아니오",
        centered: true,
        onOk: async () => {
          try {
            await axios.post(`${API_SERVER_HOST}/api/users/reactivate`, { username: values.username });
            message.success("계정이 정상 상태로 전환되었습니다. 다시 로그인해주세요.");
          } catch (err) {
            message.error("계정 전환 중 오류가 발생했습니다.");
          }
        },
      });
      return;
    }

    // 탈퇴 계정
    if (result.delete) {
      message.error("탈퇴한 계정은 로그인할 수 없습니다.");
      return;
    }

    // 기타 오류
    message.error(result.message);
    form.resetFields(["password"]);
  };

  // 배경 클릭 시 닫기
  const handleBackgroundClick = (e) => {
    // 모달 안 클릭한 적 없거나, 현재 클릭이 배경이라면 닫기
    if (!clickedInside && e.target === e.currentTarget) {
      onClose();
    }
    setClickedInside(false);
  };

  // 모달이 닫힐 때 입력값 초기화
  useEffect(() => {
    if (open) {
      setTimeout(() => usernameRef.current?.focus(), 100);
    }else {
      form.resetFields(); 
    }
  }, [open, form]);

  // 로그인 모달 안에서 소셜 로그인 시작
  const handleSocialLogin = (provider) => {
  const CLIENT_IDS = {
    google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    kakao: import.meta.env.VITE_KAKAO_CLIENT_ID,
    naver: import.meta.env.VITE_NAVER_CLIENT_ID,
  };

  const REDIRECT_URI = "http://localhost:3000/login/oauth2/redirect";

  const AUTH_URLS = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_IDS.google}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`,
    kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_IDS.kakao}&redirect_uri=${REDIRECT_URI}&response_type=code`,
    naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${CLIENT_IDS.naver}&redirect_uri=${REDIRECT_URI}&response_type=code&state=naviState`,
  };

  window.location.href = AUTH_URLS[provider];
};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[2000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            // 배경 클릭 시 모달 외부 클릭으로 인식
            if (e.target === e.currentTarget) {
              setClickedInside(false);
            }
          }}
          onMouseUp={handleBackgroundClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setClickedInside(true);
            }}
          >
            <Card
              className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white relative"
              variant="borderless"
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>

              <Form form={form} layout="vertical" preserve={false} onFinish={handleSubmit} key={open ? "open" : "closed"}>
                <Form.Item
                  label="아이디"
                  name="username"
                  rules={[{ required: true, message: "아이디를 입력하세요" }]}
                >
                  <Input
                    placeholder="아이디 입력"
                    ref={usernameRef}
                    size="large"
                    style={{ imeMode: "disabled" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // 폼 제출 방지
                        passwordRef.current?.focus(); // 다음 input 포커스
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
                >
                  <Input.Password
                    ref={passwordRef}
                    placeholder="비밀번호 입력"
                    size="large"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        form.submit();
                      }
                    }}
                  />
                </Form.Item>

                {/* 소셜 로그인 영역 */}
                <div className="flex flex-col gap-3 my-6">
                  <SocialLoginButton provider="google" onClick={handleSocialLogin} />
                  <SocialLoginButton provider="kakao" onClick={handleSocialLogin} />
                  <SocialLoginButton provider="naver" onClick={handleSocialLogin} />
                </div>

                {/* 아이디/비번 찾기 + 회원가입 */}
                <div className="flex justify-between items-center mt-8">
                  <div className="flex flex-col items-center w-[48%]">
                    <Link to="users/find-id" className="text-sm text-gray-600 mb-2" onClick={onClose}>
                      아이디 찾기
                    </Link>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full h-11 bg-sb-teal hover:bg-sb-gold font-semibold"
                    >
                      로그인
                    </Button>
                  </div>

                  <div className="flex flex-col items-center w-[48%]">
                    <Link to="users/find-password" className="text-sm text-gray-600 mb-2" onClick={onClose}>
                      비밀번호 찾기
                    </Link>
                    <Button
                      type="default"
                      href="/users/signup"
                      className="w-full h-11 border border-gray-300 font-semibold"
                    >
                      회원 가입
                    </Button>
                  </div>
                </div>
              </Form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;