import { Form, Input, Button, DatePicker, Radio, Space, Row, Col } from "antd";
import { motion } from "framer-motion";
import MainLayout from "../layout/MainLayout";

const SignupPage = () => {
  const [form] = Form.useForm();

  return (
    <MainLayout>
    <div className="flex justify-center items-center py-12 bg-gray-50 min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-10"
      >
        <h2 className="text-3xl font-bold text-center mb-10">회원가입</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* 아이디 */}
          <Form.Item
            label="아이디"
            name="username"
            rules={[{ required: true, message: "아이디를 입력하세요" }]}
          >
            <Input placeholder="아이디" size="large" />
          </Form.Item>

          {/* 비밀번호 */}
          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
          >
            <Input.Password placeholder="비밀번호" size="large" />
          </Form.Item>

          {/* 이름 */}
          <Form.Item
            label="이름"
            name="name"
            rules={[{ required: true, message: "이름을 입력하세요" }]}
          >
            <Input placeholder="이름" size="large" />
          </Form.Item>

          {/* 생년월일 */}
          <Form.Item
            label="생년월일"
            name="birth"
            rules={[{ required: true, message: "생년월일을 선택하세요" }]}
          >
            <DatePicker className="w-full" size="large" placeholder="YYYY-MM-DD" />
          </Form.Item>

          {/* 내/외국인 + 성별 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="구분" name="local" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value="local">내국인</Radio>
                  <Radio value="foreigner">외국인</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="성별" name="gender" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value="M">남자</Radio>
                  <Radio value="F">여자</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* 전화번호 */}
          <Form.Item
            label="전화번호"
            name="phone"
            rules={[{ required: true, message: "전화번호를 입력하세요" }]}
          >
            <Input placeholder="전화번호" size="large" />
          </Form.Item>

          {/* 이메일 + 인증 버튼 */}
          <Form.Item
            label="이메일"
            name="email"
            rules={[{ required: true, message: "이메일을 입력하세요" }]}
          >
            <Space.Compact className="w-full">
              <Input placeholder="이메일" size="large" />
              <Button type="primary" size="large" className="bg-sb-teal hover:bg-sb-gold">
                인증 요청
              </Button>
            </Space.Compact>
          </Form.Item>

          {/* 회원가입 버튼 */}
          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="bg-sb-teal hover:bg-sb-gold h-12 text-lg font-semibold"
            >
              회원 가입
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </div>
    </MainLayout>
  );
};

export default SignupPage;