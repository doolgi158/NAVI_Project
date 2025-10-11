import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Divider, Button, Space } from "antd";
import MainLayout from "../../layout/MainLayout";

// 📦 AccListPage의 mock 데이터 복제
const mockAccommodations = [
  {
    accNo: 1,
    name: "오션뷰 풀빌라",
    address: "제주시 애월읍 하귀로 123",
    tel: "064-123-4567",
    overview:
      "탁 트인 바다 전망과 프라이빗 풀장을 갖춘 럭셔리 풀빌라입니다. 조용한 애월 해안가에 위치해 있으며, 가족 및 커플 여행객에게 최적의 숙소입니다.",
    checkIn: "15:00",
    checkOut: "11:00",
    price: 180000,
    facilities: ["와이파이", "주차장", "개별 바비큐", "조식 포함"],
    rooms: [
      {
        roomId: "ROM001",
        roomType: "디럭스룸",
        max: 4,
        price: 100,
      },
      {
        roomId: "ROM002",
        roomType: "스위트룸",
        max: 6,
        price: 240000,
      },
    ],
  },
  {
    accNo: 2,
    name: "감성 한옥 스테이",
    address: "서귀포시 대정읍 예래로 45",
    tel: "064-222-9876",
    overview:
      "제주의 고즈넉한 감성을 담은 한옥 스테이로 전통과 현대가 조화된 공간입니다. 정원에서 바라보는 노을이 아름다운 숙소입니다.",
    checkIn: "14:00",
    checkOut: "11:00",
    price: 130000,
    facilities: ["와이파이", "주차장", "정원", "전통 찻집"],
    rooms: [
      {
        roomId: "ROM003",
        roomType: "온돌룸",
        max: 3,
        price: 130000,
      },
    ],
  },
  {
    accNo: 3,
    name: "모던 시티 호텔",
    address: "제주시 연동 123-45",
    tel: "064-555-3333",
    overview:
      "도심 속에서 편리하게 머물 수 있는 현대적인 호텔입니다. 공항 접근성이 우수하며 비즈니스 고객에게 최적화된 숙소입니다.",
    checkIn: "15:00",
    checkOut: "11:00",
    price: 110000,
    facilities: ["와이파이", "주차장", "조식 뷔페", "피트니스 센터"],
    rooms: [
      {
        roomId: "ROM004",
        roomType: "스탠다드룸",
        max: 2,
        price: 110000,
      },
      {
        roomId: "ROM005",
        roomType: "비즈니스룸",
        max: 3,
        price: 150000,
      },
    ],
  },
];

const { Title, Text, Paragraph } = Typography;

const AccDetailPage = () => {
  const { accNo } = useParams();
  const navigate = useNavigate();

  // ✅ 해당 숙소 찾기
  const accData = mockAccommodations.find(
    (acc) => acc.accNo === Number(accNo)
  );

  if (!accData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen text-lg">
          해당 숙소 정보를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  // ✅ 예약 페이지로 이동
  const handleReserve = (room) => {
    navigate(`/accommodations/${accData.accNo}/${room.roomId}/reservation`, {
      state: {
        accName: accData.name, // 숙소명
        room: {
          roomId: room.roomId,
          type: room.roomType,
          max: room.max,
          price: room.price,
        },
      },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fffde8] flex justify-center pt-10 pb-12 px-8">
        <div className="w-full max-w-7xl">
          {/* ✅ 흰색 컨테이너 (리스트 페이지와 통일) */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            {/* 숙소 이름 + 주소 */}
            <Title level={3} className="text-gray-800 mb-2">
              {accData.name}
            </Title>
            <Text className="text-base text-gray-600 mb-4 block">
              {accData.address}
            </Text>

            {/* ✅ 숙소 사진 구역 (div 두 개) */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 bg-yellow-100 h-48 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                숙소 대표 이미지
              </div>
              <div className="flex-1 bg-yellow-100 h-48 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                추가 이미지
              </div>
            </div>

            {/* 숙소 소개 */}
            <Title level={5} className="text-gray-700 mb-3 font-semibold">
              숙소 소개
            </Title>
            <Paragraph className="text-base text-gray-600 leading-relaxed">
              {accData.overview}
            </Paragraph>

            <Divider className="my-6" />

            {/* 숙소 정보 */}
            <Title level={5} className="text-gray-700 mb-3 font-semibold">
              숙소 정보
            </Title>
            <div className="space-y-1 text-base text-gray-600">
              <Text className="block">
                체크인: <strong>{accData.checkIn}</strong>
              </Text>
              <Text className="block">
                체크아웃: <strong>{accData.checkOut}</strong>
              </Text>
              <Text className="block">
                1박 요금:{" "}
                <strong className="text-[#006D77] text-lg">
                  {accData.price.toLocaleString()}원
                </strong>
              </Text>
              <Text className="block mt-1">문의: {accData.tel}</Text>
            </div>

            <Divider className="my-6" />

            {/* ✅ 객실 정보 (리스트 형태) */}
            <Title level={5} className="text-gray-700 mb-3 font-semibold">
              객실 정보
            </Title>

            <div className="space-y-5">
              {accData.rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* ✅ 썸네일 구역 (색상 div) */}
                  <div className="md:w-1/3 w-full h-48 bg-yellow-100 flex items-center justify-center text-gray-500 text-sm rounded-l-xl">
                    썸네일 영역
                  </div>

                  {/* ✅ 객실 내용 + 예약 버튼 */}
                  <div className="flex flex-col justify-between p-5 flex-1">
                    <div>
                      <Title level={5} className="text-gray-800 mb-1">
                        {room.roomType}
                      </Title>
                      <Text className="block text-gray-600 text-base mb-1">
                        최대 인원 {room.max}명
                      </Text>
                      <Text className="block text-[#006D77] font-semibold text-lg">
                        {room.price.toLocaleString()}원 / 1박
                      </Text>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        type="primary"
                        size="middle"
                        className="w-full md:w-32 font-semibold"
                        onClick={() => handleReserve(room)}
                      >
                        예약하기
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Divider className="my-6" />

            {/* 편의시설 */}
            <Title level={5} className="text-gray-700 mb-3 font-semibold">
              편의 시설
            </Title>
            <Space size={[8, 12]} wrap>
              {accData.facilities.map((item) => (
                <span
                  key={item}
                  className="bg-yellow-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </Space>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccDetailPage;
