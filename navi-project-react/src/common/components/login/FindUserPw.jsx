import { useRef, useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useModal } from "../../../common/components/Login/ModalProvider";

const FindUserPw = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();
  const emailRef = useRef(null);

  // 비밀번호 찾기 처리
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8080/api/users/find-password",
        values
      );

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
      message.error("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="text-gray-700"
    >
      {/* 아이디 */}
      <Form.Item
        label={<span className="text-lg text-gray-800">아이디</span>}
        name="id"
        rules={[{ required: true, message: "아이디를 입력하세요." }]}
      >
        <Input
          size="large"
          placeholder="아이디를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              emailRef.current?.focus(); // 다음 input으로 이동
            }
          }}
        />
      </Form.Item>

      {/* 이메일 */}
      <Form.Item
        label={<span className="text-lg text-gray-800">이메일</span>}
        name="email"
        rules={[
          { required: true, message: "이메일을 입력하세요." },
          { type: "email", message: "올바른 이메일 주소를 입력하세요." },
        ]}
      >
        <Input
          ref={emailRef}
          size="large"
          placeholder="회원가입 시 등록한 이메일"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              form.submit(); // 마지막 input → submit 실행
            }
          }}
        />
      </Form.Item>

      {/* 버튼 */}
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
  );
};

export default FindUserPw;