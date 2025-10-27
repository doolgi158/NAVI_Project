import React from "react";
import { Card, Typography } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const AccRsvInfo = ({ formData }) => {
  const { name, email, phone, birth } = formData || {};

  // birth를 안전하게 dayjs 객체로 변환
  const displayBirth = birth ? dayjs(birth).format("YYYY-MM-DD") : "입력 정보 없음";

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
          <p>
            <b>생년월일:</b> {displayBirth}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AccRsvInfo;
