import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import { Card, Typography, Form, Input, DatePicker, Select, Button, Steps } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AccReservationPage = () => {
  const { accNo, roomId } = useParams();
  const { room, accName } = location.state || {}; // 숙소명 + 객실 정보

  const location = useLocation();
  const navigate = useNavigate(); // ✅ 페이지 이동용

  const [form] = Form.useForm();

  /** ✅ 폼 제출 시 결제 페이지로 이동 */
  const onFinish = (values) => {
    console.log("예약 정보:", values);
    navigate(`/accommodations/${accNo}/${roomId}/payment`, {
      state: { accName, room, formData: values }, // ✅ 다음 페이지로 데이터 전달
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FFFBEA] flex justify-center items-center py-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">

          {/* === 왼쪽: 예약 입력 폼 === */}
          <Card
            className="lg:col-span-2"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              backgroundColor: "#FFFFFF",
              height: "auto",
            }}
            styles={{
              body: { padding: "32px" },
            }}
          >
            {/* ✅ 예약 단계 Steps */}
            <Steps
              current={0}
              items={[
                { title: '예약 정보 입력' },
                { title: '결제 진행' },
                { title: '예약 완료' },
              ]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3} className="mb-6 text-gray-800">
              예약 정보 입력
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ guestCount: 2 }}
            >
              <Form.Item
                label="예약자 이름"
                name="name"
                rules={[{ required: true, message: "이름을 입력해주세요." }]}
              >
                <Input placeholder="홍길동" />
              </Form.Item>

              <Form.Item
                label="연락처"
                name="phone"
                rules={[{ required: true, message: "연락처를 입력해주세요." }]}
              >
                <Input placeholder="010-1234-5678" />
              </Form.Item>

              <Form.Item
                label="이메일"
                name="email"
                rules={[{ required: true, message: "이메일을 입력해주세요." }]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              {/* ✅ 숙박 일정 + 인원 수 한 줄 정렬 */}
              <div className="flex gap-4">
                <Form.Item
                  label="숙박 일정"
                  name="dateRange"
                  className="flex-1"
                  rules={[{ required: true, message: "숙박 일정을 선택해주세요." }]}
                >
                  <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                  label="인원 수"
                  name="guestCount"
                  style={{ width: "120px" }}
                >
                  <Select>
                    <Select.Option value={1}>1명</Select.Option>
                    <Select.Option value={2}>2명</Select.Option>
                    <Select.Option value={3}>3명</Select.Option>
                    <Select.Option value={4}>4명 이상</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </Form>
          </Card>

          {/* === 오른쪽: 숙소 + 객실 요약 정보 === */}
          <div className="flex flex-col justify-between h-full">
            {/* 객실 정보 카드 */}
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#FDF6D8",
              }}
              styles={{
                body: { padding: "24px" },
              }}
            >
              <div className="flex flex-col text-center mb-6">
                <Title level={4} className="text-gray-800 mb-3">
                  {accName || "숙소 이름"}
                </Title>

                <img
                  src={room?.image || "https://via.placeholder.com/300x200"}
                  alt={room?.type || "객실 이미지"}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <Title level={5} className="text-gray-700 mb-1">
                  {room?.type || "객실 정보 없음"}
                </Title>

                <Text className="block text-gray-500 mb-1">숙소번호: {accNo}</Text>
                <Text className="block text-gray-500 mb-1">객실번호: {roomId}</Text>
                <Text className="text-lg text-gray-600 mb-1">
                  최대 인원 {room?.max || "-"}명
                </Text>
                <Text className="text-2xl font-bold text-[#006D77] mb-2">
                  {room?.price
                    ? `${room.price.toLocaleString()}원 / 1박`
                    : "-"}
                </Text>
              </div>
            </Card>

            {/* ✅ 결제 페이지로 이동 버튼 */}
            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
                onClick={() => form.submit()} // ✅ 폼 제출 → onFinish → navigate
              >
                결제하기
              </Button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AccReservationPage;
