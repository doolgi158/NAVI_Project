import { Form, Input, Button, DatePicker, Radio, Row, Col, message, Space } from "antd";
import dayjs from "dayjs";
import { signup } from "../../api/naviApi";
import axios from "axios";
import { useState } from "react";
import { useModal } from "../../components/Login/ModalProvider";
import { useSignupForm } from "../../hooks/useSignup";

const SignupForm = () => {
  const [form] = Form.useForm();
  const { showModal } = useModal();

  const [idChecked, setIdChecked] = useState(false);
  const [idStatus, setIdStatus] = useState("");
  const [idMessage, setIdMessage] = useState("");

  const {
    resetIdState,
    // ✅ 이메일 인증 관련 상태 & 함수
    emailVerified,
    emailStatus,
    emailMessage,
    handleSendEmail,
    handleVerifyCode,
    setEmailCode,
    isSending,
    isVerifying,
    emailCode,
    emailSent,
    emailCodeStatus,
    emailCodeMessage,
  } = useSignupForm(form);

  // ✅ 아이디 중복 검사
  const handleCheckId = async () => {
    const idValue = form.getFieldValue("id");
console.log(emailSent);
    if (!idValue) {
      message.warning("아이디를 입력하세요.");
      setIdStatus("error");
      setIdMessage("아이디를 입력하세요.");
      setIdChecked(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/users/check-id`, {
        params: { id: idValue },
      });

      if (res.data.available === true) {
        message.success("사용 가능한 아이디입니다!");
        setIdStatus("success");
        setIdMessage("✅ 사용 가능한 아이디입니다!");
        setIdChecked(true);
      } else {
        message.warning("이미 사용 중인 아이디입니다.");
        setIdStatus("error");
        setIdMessage("❌ 이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      }
    } catch (err) {
      console.error("중복 검사 오류:", err);
      message.error("아이디 중복 검사 중 오류가 발생했습니다.");
      setIdStatus("error");
      setIdMessage("서버 오류로 중복 검사를 수행할 수 없습니다.");
      setIdChecked(false);
    }
  };

  // ✅ 회원가입 처리
  const handleSubmit = async (values) => {
    if (!idChecked) {
      message.warning("아이디 중복 검사를 먼저 진행해주세요.");
      setIdStatus("warning");
      setIdMessage("⚠️ 아이디 중복 검사를 먼저 진행해주세요.");
      return;
    }

    try {
      const formattedValues = {
        ...values,
        birth: dayjs(values.birth).format("YYYY-MM-DD"),
        gender: values.gender,
        local: values.local === "local" ? "L" : "F",
      };

      const response = await signup(formattedValues);

      if (response.status === 200) {
        message.success("회원가입이 완료되었습니다!");
        setTimeout(() => showModal("login"), 600);
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      message.error(err.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form
      form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const formItems = Array.from(
              document.querySelectorAll(
                "input, select, textarea, .ant-picker-input input, .ant-radio-input"
              )
            ).filter((el) => !el.disabled && el.type !== "hidden");

            const index = formItems.indexOf(e.target);
            if (index === formItems.length - 1) form.submit();
            else formItems[index + 1].focus();
          }
        }}
    >
      {/* 아이디 + 중복검사 버튼 */}
      <Form.Item
        label="아이디"
        name="id"
        rules={[{ required: true, message: "아이디를 입력하세요" }]}
        validateStatus={idStatus}
        help={idMessage}
      >
        <Space.Compact className="w-full">
          <Input
            placeholder="아이디"
            size="large"
            onChange={() => {
              setIdChecked(false);
              setIdStatus("");
              setIdMessage("");
            }}
          />
          <Button
            type="primary"
            onClick={handleCheckId}
            size="large"
            className="bg-sb-teal hover:bg-sb-gold"
          >
            중복 검사
          </Button>
        </Space.Compact>
      </Form.Item>

      {/* ✅ 비밀번호 유효성 검사 */}
      <Form.Item
        label="비밀번호"
        name="pw"
        rules={[
          { required: true, message: "비밀번호를 입력하세요" },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-?<>]).{8,}$/,
            message: "비밀번호는 영어, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다.",
          },
        ]}
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
      <DatePicker
        className="w-full"
        size="large"
        placeholder="YYYY-MM-DD"
        format="YYYY-MM-DD"
        allowClear
        inputReadOnly={false}
        onBlur={(e) => {
          const value = e.target.value.replaceAll("-", "");
          if (/^\d{8}$/.test(value)) {
            // 8자리 숫자면 dayjs 객체로 변환
            const formatted = `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
            form.setFieldsValue({ birth: dayjs(formatted) });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const value = e.target.value.replaceAll("-", "");
            if (/^\d{8}$/.test(value)) {
              const formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
              form.setFieldsValue({ birth: dayjs(formatted) });
            }
          }
        }}
      />
      </Form.Item>

      {/* 내/외국인 + 성별 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="내/외국인 구분" name="local">
            <Radio.Group>
              <Radio value="local">내국인</Radio>
              <Radio value="foreigner">외국인</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="성별" name="gender">
            <Radio.Group>
              <Radio value="M">남자</Radio>
              <Radio value="F">여자</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      {/* ✅ 전화번호 유효성 검사 */}
      <Form.Item
        label="전화번호"
        name="phone"
        rules={[
          { required: true, message: "전화번호를 입력하세요" },
          {
            pattern: /^[0-9]{10,11}$/,
            message: "전화번호는 숫자만 입력해주세요. (예: 01012345678)",
          },
        ]}
        validateTrigger="onChange"
      >
        <Input placeholder="숫자만 입력 (예: 01012345678)" size="large" />
      </Form.Item>

      {/* ✅ 이메일 + 인증코드 */}
      <Form.Item
        label="이메일"
        name="email"
        rules={[
          { required: true, message: "이메일을 입력하세요" },
          { type: "email", message: "유효한 이메일 주소를 입력해주세요" },
        ]}
        validateStatus={emailStatus}
        help={emailMessage}
      >
        <Space.Compact className="w-full">
          <Input
            placeholder="이메일"
            size="large"
            disabled={emailVerified}
          />
          <Button
            type="primary"
            onClick={handleSendEmail}
            size="large"
            loading={isSending}
            className="bg-sb-teal hover:bg-sb-gold"
            disabled={emailVerified}
          >
            인증 코드 보내기
          </Button>
        </Space.Compact>
      </Form.Item>

      {/* ✅ 인증 코드 입력란 */}
      {emailSent && !emailVerified && (
        <Form.Item label="인증 코드"  validateStatus={emailCodeStatus} help={emailCodeMessage}>
          <Space.Compact className="w-full">
            <Input
              placeholder="이메일로 받은 인증 코드"
              size="large"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
            />
            <Button
              onClick={handleVerifyCode}
              size="large"
              loading={isVerifying}
              className="bg-sb-teal hover:bg-sb-gold"
            >
              인증 확인
            </Button>
          </Space.Compact>
        </Form.Item>
      )}

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
  );
};

export default SignupForm;
