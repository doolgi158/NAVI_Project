import { Card, Typography, Divider } from "antd";
const { Title, Text } = Typography;

const AccRsvInfo = ({ data, formData }) => {
  if (!data) return null;

  const items = Array.isArray(data) ? data : [data];

  return (
    <div className="space-y-4 mt-6">
      {items.map((item, idx) => (
        <Card
          key={idx}
          className="border rounded-xl p-4 bg-white shadow-sm"
          style={{ borderColor: "#f0f0f0" }}
        >
          <Title level={5}>숙소 예약 {idx + 1}</Title>
          <Divider />
          <Text strong>예약 ID:</Text> <Text>{item.reserveId}</Text>
          <br />
          <Text strong>결제 금액:</Text>{" "}
          <Text className="text-blue-600">
            {Number(item.amount).toLocaleString()}원
          </Text>
        </Card>
      ))}
    </div>
  );
};

export default AccRsvInfo;
