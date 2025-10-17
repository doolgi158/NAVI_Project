import React from "react";
import { Typography, Divider } from "antd";
const { Text } = Typography;

const FlyRsvInfo = ({ data, formData }) => {
  if (!data || !formData) return null;

  // ✅ 객체일 경우 안전하게 처리
  const departure =
    typeof data.departure === "string"
      ? data.departure
      : data.departure?.name || "출발지 미지정";

  const arrival =
    typeof data.arrival === "string"
      ? data.arrival
      : data.arrival?.name || "도착지 미지정";

  return (
    <div>
      <Divider orientation="left">항공 일정</Divider>
      <Text strong>출발:</Text> <Text>{departure}</Text> <br />
      <Text strong>도착:</Text> <Text>{arrival}</Text> <br />
      <Text strong>탑승일:</Text> <Text>{formData?.flightDate}</Text>
    </div>
  );
};

export default FlyRsvInfo;
