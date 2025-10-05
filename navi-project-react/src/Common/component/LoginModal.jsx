import { Form, Input, Button, Card } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginAsync } from "../../slice/loginslice";
import { useModal } from "./ModalProvider";
import { useNavigate } from "react-router-dom";

const initstate = {
  username: "",
  password: "",
};

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();
  const [loginData, setLoginData] = useState({ ...initstate });
  const dispatch = useDispatch();
  const { showModal, closeModal } = useModal();
  const navigate = useNavigate();
  
  // 폼 제출 핸들러
  const handleSubmit = (values) => {
    setLoginData(values);
    
    dispatch(loginAsync(values))
      .unwrap()
      .then((data) => {
        // 모달 닫기
        closeModal();
        if(data.id === 'naviadmin') {
          navigate("/adm/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        // 실패 메시지 알림
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");

        // 모달 다시 열기 (필요 시)
        showModal("login");

        // 폼 비우기
        form.resetFields();
      });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[2000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // 배경 클릭 시 닫힘
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} // 카드 내부 클릭 방지
            className="relative"
          >
            <Card
              className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white"
              bordered={false}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* 아이디 */}
                <Form.Item
                  label="아이디"
                  name="username"
                  rules={[{ required: true, message: "아이디를 입력하세요" }]}
                >
                  <Input placeholder="아이디 입력" size="large" />
                </Form.Item>

                {/* 비밀번호 */}
                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
                >
                  <Input.Password placeholder="비밀번호 입력" size="large" />
                </Form.Item>

                {/* 소셜 로그인 */}
                <div className="flex flex-col gap-2 mt-6 mb-6 text-center">
                  <Button block className="bg-red-500 text-white hover:bg-red-600">
                    구글 로그인
                  </Button>
                  <Button block className="bg-yellow-400 text-black hover:bg-yellow-500">
                    카카오 로그인
                  </Button>
                  <Button block className="bg-green-500 text-white hover:bg-green-600">
                    네이버 로그인
                  </Button>
                </div>

                {/* 로그인/회원가입 버튼 */}
                <div className="flex justify-between gap-3 mt-4">
                  <div className="flex flex-col items-center w-[48%]">
                    <a
                      href="/find-id"
                      className="text-sm text-gray-600 mb-1 hover:text-sb-teal"
                    >
                      아이디 찾기
                    </a>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-sb-teal hover:bg-sb-gold w-full h-11 font-semibold"
                    >
                      로그인
                    </Button>
                  </div>

                  <div className="flex flex-col items-center w-[48%]">
                    <a
                      href="/forgot"
                      className="text-sm text-gray-600 mb-1 hover:text-sb-teal"
                    >
                      비밀번호 찾기
                    </a>
                    <Button
                      type="default"
                      href="/signup"
                      className="w-full h-11 border border-gray-300 font-semibold"
                    >
                      회원가입
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
