import React from "react";
import { Card, Typography, Divider } from "antd";
const { Title, Text } = Typography;

const AccRsvInfo = ({ formData, data }) => {
  const { name, email, phone } = formData || {};
  const room = data?.room;

  return (
    <div className="space-y-5">
      {/* 예약자 정보 */}
      <Card
        title={<span className="font-semibold text-gray-800">예약자 정보</span>}
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

      {/* 객실 간략정보 */}
      {room && (
        <Card
          title={<span className="font-semibold text-gray-800">선택한 객실</span>}
          className="rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <img
              src={room.thumbnailImage || data?.thumbnail}
              alt={room.roomName}
              className="w-full md:w-1/3 rounded-xl object-cover h-[150px]"
            />
            <div className="flex-1 text-gray-700 space-y-1">
              <p>
                <b>객실명:</b> {room.roomName}
              </p>
              <p>
                <b>최대 인원:</b> {room.maxCnt}명
              </p>
              <p>
                <b>1박 요금:</b>{" "}
                {room.weekdayFee
                  ? `${room.weekdayFee.toLocaleString()}원`
                  : "정보 없음"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AccRsvInfo;
