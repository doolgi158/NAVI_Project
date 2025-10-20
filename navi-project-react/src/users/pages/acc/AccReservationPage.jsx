import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Steps,
  Divider,
  Space,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";

const { Title, Text } = Typography;

const AccReservationPage = () => {
  const { accId, roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // ✅ 이전 페이지에서 전달된 데이터
  const { accName, room, dateRange, guestCount, roomCount } = location.state || {};

  /** ✅ 결제 페이지 이동 */
  const onFinish = (values) => {
    const reservationData = {
      accId,
      roomId,
      accName,
      room,
      formData: {
        name: values.name,
        phone: values.phone,
        email: values.email,
        guestCount,
        roomCount,
        checkIn: dateRange?.[0],
        checkOut: dateRange?.[1],
      },
    };

    navigate(`/accommodations/${accId}/${roomId}/payment`, {
      state: reservationData,
    });
  };

  // ✅ 숙박일 계산
  const nights = dateRange
    ? dayjs(dateRange[1]).diff(dayjs(dateRange[0]), "day") || 1
    : 1;

  const totalPrice =
    room?.weekdayFee && nights > 0
      ? room.weekdayFee * nights * (roomCount || 1)
      : 0;

  return (
    <MainLayout>
      <div className="flex justify-center py-10 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 왼쪽: 예약자 입력 폼 === */}
          <Card
            className="lg:col-span-2"
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
              backgroundColor: "#fff",
              height: "fit-content", // ✅ 자동 높이
            }}
          >
            <Steps
              current={0}
              items={[
                { title: "예약 정보 입력" },
                { title: "결제 진행" },
                { title: "예약 완료" },
              ]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3} className="mb-6 text-gray-800">
              대표 예약자 정보 입력
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="이름"
                name="name"
                rules={[{ required: true, message: "이름을 입력해주세요." }]}
              >
                <Input placeholder="홍길동" size="large" />
              </Form.Item>

              <Form.Item
                label="연락처"
                name="phone"
                rules={[{ required: true, message: "연락처를 입력해주세요." }]}
              >
                <Input placeholder="010-1234-5678" size="large" />
              </Form.Item>

              <Form.Item
                label="이메일"
                name="email"
                rules={[{ required: true, message: "이메일을 입력해주세요." }]}
                style={{ marginBottom: "0" }}
              >
                <Input placeholder="example@email.com" size="large" />
              </Form.Item>
            </Form>
          </Card>

          {/* === 오른쪽: 예약 요약 카드 === */}
          <div className="flex flex-col justify-between h-full">
            <Card
              bordered
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                backgroundColor: "#fafafa",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div>
                <div className="flex flex-col items-center text-center mb-6">
                  <Title level={4} className="text-gray-900 mb-2">
                    {accName || "숙소 이름"}
                  </Title>
                  <Text className="text-lg text-gray-700 font-medium mb-1">
                    {room?.roomName || "객실 정보 없음"}
                  </Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {room?.weekdayFee
                      ? `${room.weekdayFee.toLocaleString()}원 / 1박`
                      : "가격 미정"}
                  </Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%", fontSize: "0.95rem" }}
                >
                  <Text>
                    <CalendarOutlined className="text-gray-600 mr-2" />
                    <b>숙박 일정:</b>{" "}
                    {dateRange
                      ? `${dateRange[0]} ~ ${dateRange[1]}`
                      : "선택되지 않음"}
                  </Text>

                  <Text>
                    <TeamOutlined className="text-gray-600 mr-2" />
                    <b>인원 수:</b> {guestCount || 1}명
                  </Text>

                  <Text>
                    <HomeOutlined className="text-gray-600 mr-2" />
                    <b>객실 수:</b> {roomCount || 1}개
                  </Text>
                </Space>

                <Divider style={{ margin: "16px 0" }} />

                <Text
                  className="block text-base font-semibold text-gray-900"
                  style={{ textAlign: "center" }}
                >
                  <DollarOutlined className="text-yellow-600 mr-2" />
                  총 금액:{" "}
                  <span className="text-blue-600 font-bold">
                    {totalPrice.toLocaleString()}원
                  </span>
                </Text>
              </div>

              {/* ✅ 카드 하단 버튼 + 안내문 */}
              <div className="mt-6">
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{
                    height: "50px",
                    borderRadius: "10px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    marginTop: "20px"
                  }}
                  onClick={() => form.submit()}
                >
                  결제하기
                </Button>

              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccReservationPage;
