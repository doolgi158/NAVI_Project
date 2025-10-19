import { Form, Input, Button, Card, message, Modal } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "../../hooks/useLogin.jsx";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import SocialLoginButton from "./SocialLogin";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi.js";

const LoginModal = ({ open = false, onClose = () => { } }) => {
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
    // 정상 로그인
    if (result.success) {
      message.success(result.message);
      form.resetFields();
      onClose();
      return;
    }
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
    } else {
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
              className="w-full max-w-2xl p-10 rounded-3xl shadow-2xl bg-white/95 relative border border-gray-200"
              variant="borderless"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl transition-all"
              >
                ✕
              </button>

              {/* 헤더 */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">로그인</h2>
                <p className="text-gray-500 text-base">NAVI 계정으로 로그인하세요</p>
              </div>

              {/* 폼 영역 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Form
                  form={form}
                  layout="vertical"
                  preserve={false}
                  onFinish={handleSubmit}
                  key={open ? 'open' : 'closed'}
                  className="flex flex-col justify-center"
                >
                  <Form.Item
                    label="아이디"
                    name="username"
                    rules={[{ required: true, message: "아이디를 입력하세요" }]}
                  >
                    <Input
                      placeholder="아이디 입력"
                      ref={usernameRef}
                      size="large"
                      className="rounded-lg"
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
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full h-12 mt-2 bg-sb-teal hover:bg-sb-gold font-semibold"
                  >
                    로그인
                  </Button>

                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <Link to="users/find-id" onClick={onClose}>아이디 찾기</Link>
                    <Link to="users/find-password" onClick={onClose}>비밀번호 찾기</Link>
                  </div>
                </Form>

                {/* 소셜 로그인 영역 */}
                <div className="flex flex-col justify-center border-l border-gray-200 pl-8">
                  <p className="text-center text-gray-600 mb-4">소셜 계정으로 간편 로그인</p>
                  <div className="flex flex-col gap-3">
                    <SocialLoginButton provider="google" onClick={handleSocialLogin} />
                    <SocialLoginButton provider="kakao" onClick={handleSocialLogin} />
                    <SocialLoginButton provider="naver" onClick={handleSocialLogin} />
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-2">아직 계정이 없으신가요?</p>
                    <Button
                      type="default"
                      href="/users/signup"
                      className="w-full h-12 font-semibold border-gray-300"
                    >
                      회원 가입
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;