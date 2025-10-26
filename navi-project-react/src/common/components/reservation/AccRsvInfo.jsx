import React from "react";
import { Card, Typography, Divider } from "antd";
const { Title, Text } = Typography;

const AccRsvInfo = ({ formData }) => {
  const { name, email, phone } = formData || {};

  return (
    <div className="space-y-5">
      {/* 예약자 정보 */}
      <Card
        title={<span className="font-semibold text-gray-800">대표 예약자 정보</span>}
        className="rounded-2xl border border-gray-200 shadow-sm"
      >
        <div className="space-y-2 text-gray-700">
          <p>
            <b>이름:</b> {name || "입력 정보 없음"}
          </p>
          <p>
            <b>이메일:</b> {email || "입력 정보 없음"}
          </p>
          <p>
            <b>전화번호:</b> {phone || "입력 정보 없음"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AccRsvInfo;
