import { Form, Input, Button, Card, message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "../../hooks/useLogin.jsx";
import SocialLoginButton from "./SocialLogin";
import { Link } from "react-router-dom";

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();
  const { login } = useLogin();

  const handleSubmit = async (values) => {
    const result = await login(values);

    if (result.success) {
      message.success(result.message);
      form.resetFields();
      onClose();
    } else {
      message.error(result.message);
      form.resetFields(["password"]);
    }
  };

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
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card
              className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white relative"
              bordered={false}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label="아이디"
                  name="username"
                  rules={[{ required: true, message: "아이디를 입력하세요" }]}
                >
                  <Input placeholder="아이디 입력" size="large" />
                </Form.Item>

                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
                >
                  <Input.Password placeholder="비밀번호 입력" size="large" />
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