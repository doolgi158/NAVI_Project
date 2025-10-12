import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import { useModal } from "../../../common/components/Login/ModalProvider";

const FindPasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const {showModal} = useModal();

  // ✅ 비밀번호 찾기 처리
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/users/find-password", values);

      if (res.data.status === 200) {
        message.success("임시 비밀번호가 이메일로 전송되었습니다!");
        form.resetFields();

        setTimeout(() => {
          showModal("login");
        }, 600);
      } else {
        message.error(res.data.message || "아이디 또는 이메일이 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      message.error("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA]">
        <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10 border border-gray-100">
          {/* 제목 */}
          <div className="flex items-center justify-center mb-8">
            <span className="text-3xl mr-2">🔑</span>
            <h2 className="text-3xl font-extrabold text-gray-900">비밀번호 찾기</h2>
          </div>

          {/* 비밀번호 찾기 폼 */}
          <Form form={form} layout="vertical" onFinish={handleSubmit} className="text-gray-700">
            <Form.Item
              label={<span className="text-lg text-gray-800">아이디</span>}
              name="id"
              rules={[{ message: "아이디를 입력하세요." }]}
            >
              <Input
                size="large"
                placeholder="아이디를 입력하세요"
                className="font-normal"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-lg text-gray-800">이메일</span>}
              name="email"
              rules={[
                { message: "이메일을 입력하세요." },
                { type: "email", message: "올바른 이메일 주소를 입력하세요." },
              ]}
            >
              <Input
                size="large"
                placeholder="회원가입 시 등록한 이메일"
                className="font-normal"
              />
            </Form.Item>

            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="bg-[#4A9E8C] hover:bg-[#3A8576] h-12 text-lg font-semibold active:scale-95 transition-transform"
              >
                임시 비밀번호 발송
              </Button>
            </Form.Item>
          </Form>

          {/* 하단 안내 */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>아이디가 기억나지 않으신가요?</p>
            <a
              href="/users/find-id"
              className="font-semibold text-[#4A9E8C] hover:underline"
            >
              아이디 찾기
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FindPasswordForm;
