import React from "react";
import { Card, Typography, Divider } from "antd";
import { CalendarOutlined, TeamOutlined, HomeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AccRsvSumCard = ({ accData, formData, totalAmount }) => {
  if (!accData || !formData)
    return (
      <Card className="rounded-2xl border border-gray-200 text-center text-gray-500">
        예약된 숙소 정보가 없습니다.
      </Card>
    );

  const { accName, address, thumbnail, room } = accData;
  const { checkIn, checkOut, guestCount, roomCount, nights } = formData;

  return (
    <Card
      className="rounded-2xl shadow-md border border-gray-100 bg-white"
      cover={
        thumbnail && (
          <img
            src={thumbnail}
            alt={accName}
            className="h-[200px] w-full object-cover rounded-t-2xl"
          />
        )
      }
    >
      <div className="p-2 space-y-2">
        <Title level={4} className="text-gray-900 mb-1 font-bold">
          {accName}
        </Title>
        <Text className="text-gray-600 text-sm">{address}</Text>

        <Divider className="my-3" />

        <div className="space-y-2 text-gray-700 text-sm">
          <p>
            <CalendarOutlined className="mr-2 text-blue-500" />
            체크인: <b>{checkIn}</b>
          </p>
          <p>
            <CalendarOutlined className="mr-2 text-blue-500" />
            체크아웃: <b>{checkOut}</b>
          </p>
          <p>
            <HomeOutlined className="mr-2 text-blue-500" />
            객실: <b>{room?.roomName}</b> ({roomCount}개)
          </p>
          <p>
            <TeamOutlined className="mr-2 text-blue-500" />
            인원: <b>{guestCount}명</b> / 숙박일수: <b>{nights}박</b>
          </p>
        </div>

        <Divider className="my-3" />

        <div className="text-right">
          <Text className="text-gray-600">총 결제 금액</Text>
          <Title level={3} className="text-blue-600 font-extrabold leading-none mt-1">
            {totalAmount?.toLocaleString()}원
          </Title>
        </div>
      </div>
    </Card>
  );
};

export default AccRsvSumCard;
