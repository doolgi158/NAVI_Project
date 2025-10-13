import { useRef, useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const FindUserId = ({ onResult }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  // 아이디 찾기 요청
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/users/find-id", values);

      if (res.data.userId) {
        message.success("아이디를 성공적으로 찾았습니다!");
        onResult(`회원님의 아이디는 "${res.data.userId}" 입니다.`);
        form.resetFields();
      } else {
        message.error(res.data.message || "입력하신 정보와 일치하는 아이디가 없습니다.");
        onResult("입력하신 정보와 일치하는 아이디가 없습니다.");
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
      {/* 이름 입력 */}
      <Form.Item
        label={<span className="text-lg text-gray-800">이름</span>}
        name="name"
        rules={[{ required: true, message: "이름을 입력하세요." }]}
      >
        <Input
          size="large"
          placeholder="이름을 입력하세요"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              emailRef.current?.focus(); // 다음 input으로 이동
            }
          }}
        />
      </Form.Item>

      {/* 이메일 입력 */}
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
          아이디 찾기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FindUserId;