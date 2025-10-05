import { Form, Input, Button, Card, Space } from "antd";

const LoginModal = ({ open = false, onClose = () => {} }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("로그인:", values);
    onClose();
  };

  return (
    open && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <Card
          className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white"
          bordered={false}
        >
          <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>

          {/* 입력 영역 */}
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
                <a href="/find-id" className="text-sm text-gray-600 mb-1 hover:text-sb-teal">
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
                <a href="/forgot" className="text-sm text-gray-600 mb-1 hover:text-sb-teal">
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
      </div>
    )
  );
};

export default LoginModal;
