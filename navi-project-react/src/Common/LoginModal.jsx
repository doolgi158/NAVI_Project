import { AnimatePresence, motion } from "framer-motion";
import { Form, Input, Button, Card } from "antd";

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("로그인:", values);
    // TODO: axios.post("/api/user/login", values).then(...)
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 배경 */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card
              className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white"
              bordered={false}
            >
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

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="bg-gradient-to-r from-sb-teal to-sb-gold h-11 text-white font-semibold"
                  >
                    로그인
                  </Button>
                </Form.Item>
              </Form>

              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <a href="/signup" className="hover:text-sb-teal">
                  회원가입
                </a>
                <a href="/forgot" className="hover:text-sb-teal">
                  비밀번호 찾기
                </a>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;