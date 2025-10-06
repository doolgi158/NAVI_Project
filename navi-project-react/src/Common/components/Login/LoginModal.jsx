import { Form, Input, Button, Card } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "../../hooks/useLogin";

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();
  const { login } = useLogin();

  const handleSubmit = async (values) => {
    const success = await login(values);
    if (!success) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      form.resetFields();
    }
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card
              className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white relative"
              bordered={false}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              {/* 제목 */}
              <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>

              {/* 입력 폼 */}
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

                {/* 중앙 정렬된 소셜 로그인 버튼들 */}
                <div className="flex flex-col items-center gap-2 my-6 text-center">
                  <Button type="link" className="text-blue-500">
                    구글 로그인
                  </Button>
                  <Button type="link" className="text-yellow-500">
                    카카오 로그인
                  </Button>
                  <Button type="link" className="text-green-500">
                    네이버 로그인
                  </Button>
                </div>

                {/* 하단 링크 + 버튼 */}
                <div className="flex justify-between items-center mt-8">
                  {/* 왼쪽: 아이디 찾기 + 로그인 버튼 */}
                  <div className="flex flex-col items-center w-[48%]">
                    <a
                      href="/find-id"
                      className="text-sm text-gray-600 mb-2 hover:text-sb-teal"
                    >
                      아이디 찾기
                    </a>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full h-11 bg-sb-teal hover:bg-sb-gold font-semibold"
                    >
                      로그인
                    </Button>
                  </div>

                  {/* 오른쪽: 비밀번호 찾기 + 회원가입 버튼 */}
                  <div className="flex flex-col items-center w-[48%]">
                    <a
                      href="/forgot"
                      className="text-sm text-gray-600 mb-2 hover:text-sb-teal"
                    >
                      비밀번호 찾기
                    </a>
                    <Button
                      type="default"
                      href="/signup"
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
