import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Divider,
  Button,
  Space,
  message,
  Spin,
  Row,
  Col,
  Card,
} from "antd";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const AccDetailPage = () => {
  const { accId } = useParams();
  const navigate = useNavigate();

  const [accData, setAccData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/accommodations/${accId}`);
        const roomRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${accId}`);
        setAccData(accRes.data);
        setRooms(roomRes.data);
      } catch (err) {
        console.error("숙소 상세/객실 조회 실패:", err);
        message.error("숙소 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accId]);

  const handleReserve = async (room) => {
    try {
      // ✅ 예약 마스터 생성 (백엔드 호출)
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/reservation/pre`, {
        userNo: 1,                 // 임시 회원번호 (로그인 연동 시 수정 예정)
        rsvType: "ACC",            // 숙소 예약
        targetId: room.roomId,     // 객실 ID
        totalAmount: room.weekdayFee || 100000,
        paymentMethod: "KAKAOPAY", // 임시 결제수단
      });

      const reserveId = res.data.reserveId;
      console.log("✅ 예약 마스터 생성 완료:", reserveId);

      // ✅ 예약 정보 입력 페이지로 이동 (예약ID 함께 전달)
      navigate(`/accommodations/${accId}/${room.roomId}/reservation`, {
        state: {
          accName: accData?.title || accData?.name,
          room: {
            roomId: room.roomId,
            roomName: room.roomName,
            maxCnt: room.maxCnt,
            weekdayFee: room.weekdayFee,
            weekendFee: room.weekendFee,
          },
          reserveId, // ✅ 예약ID 전달
        },
      });
    } catch (err) {
      console.error("❌ 예약 생성 실패:", err);
      message.error("이미 예약 중이거나 오류가 발생했습니다.");
    }
  };


  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin tip="숙소 정보를 불러오는 중..." />
        </div>
      </MainLayout>
    );
  }

  if (!accData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen text-lg">
          해당 숙소 정보를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fffde8] flex justify-center pt-8 pb-10 px-6">
        <div className="w-full max-w-6xl">
          {/* ✅ 흰색 컨테이너 */}
          <div className="bg-white shadow-md rounded-2xl p-6">
            
            {/* 숙소 이름 + 주소 */}
            <div className="mb-5">
              <Title
                level={3}
                className="text-gray-900 font-bold mb-1 border-l-6 border-orange-400 pl-2"
              >
                {accData.title}
              </Title>
              <Text className="text-sm text-gray-600">{accData.address}</Text>
            </div>

            {/* 이미지 + 지도 */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={14}>
                <div className="bg-gray-100 rounded-xl h-[240px] flex items-center justify-center text-gray-500 text-sm">
                  대표 이미지 (추후 슬라이드 예정)
                </div>
              </Col>
              <Col xs={24} lg={10}>
                <div className="bg-gray-50 border border-gray-200 rounded-xl h-[240px] shadow-inner flex items-center justify-center text-gray-500">
                  지도 영역 (추후 KakaoMap 삽입 예정)
                </div>
              </Col>
            </Row>

            {/* 숙소 소개 */}
            <div className="mb-6">
              <Title level={5} className="text-gray-800 mb-2 font-semibold">
                숙소 소개
              </Title>
              <Paragraph className="text-base text-gray-600 leading-relaxed">
                {accData.overview || "숙소 소개 정보가 없습니다."}
              </Paragraph>
            </div>

            {/* 숙소 정보 + 편의시설 */}
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24} md={12}>
                <Card className="rounded-xl border-gray-200 shadow-sm h-full p-4">
                  <Title level={5} className="text-gray-700 mb-2 font-semibold">
                    숙소 정보
                  </Title>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>
                      <Text className="text-gray-500">체크인 </Text>
                      <Text strong>{accData.checkIn || "15:00"}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-500">체크아웃 </Text>
                      <Text strong>{accData.checkOut || "11:00"}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-500">1박 요금 </Text>
                      <Text strong className="text-[#006D77]">
                        {accData.price
                          ? `${accData.price.toLocaleString()}원`
                          : "가격 정보 없음"}
                      </Text>
                    </div>
                    {accData.tel && (
                      <div>
                        <Text className="text-gray-500">문의 </Text>
                        <Text>{accData.tel}</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card className="rounded-xl border-gray-200 shadow-sm h-full p-4">
                  <Title level={5} className="text-gray-700 mb-2 font-semibold">
                    편의시설
                  </Title>
                  {accData.facilities && accData.facilities.length > 0 ? (
                    <Space size={[6, 8]} wrap>
                      {accData.facilities.map((item) => (
                        <span
                          key={item}
                          className="bg-yellow-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </Space>
                  ) : (
                    <Text className="text-gray-500 text-sm">
                      등록된 편의시설 정보가 없습니다.
                    </Text>
                  )}
                </Card>
              </Col>
            </Row>

            {/* 객실 정보 (리스트형) */}
            <Divider className="my-6" />
            <Title level={5} className="text-gray-800 mb-4 font-semibold">
              객실 정보
            </Title>

            {rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* 썸네일 */}
                    {room.thumbnailImage ? (
                      <img
                        src={room.thumbnailImage}
                        alt={room.roomName}
                        className="md:w-1/4 w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="md:w-1/4 w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        이미지 없음
                      </div>
                    )}

                    {/* 내용 */}
                    <div className="flex flex-col justify-between p-4 flex-1 bg-white">
                      <div>
                        <Title level={5} className="text-gray-900 mb-1">
                          {room.roomName}
                        </Title>
                        <Text className="block text-gray-600 text-sm mb-1">
                          최대 인원 {room.maxCnt}명
                        </Text>
                        <Text className="block text-[#006D77] font-semibold text-base">
                          {room.weekdayFee
                            ? `${room.weekdayFee.toLocaleString()}원 / 1박`
                            : "가격 미정"}
                        </Text>
                      </div>
                      <div className="flex justify-end mt-3 md:mt-0">
                        <Button
                          type="primary"
                          size="small"
                          className="w-full md:w-28 font-semibold"
                          onClick={() => handleReserve(room)}
                        >
                          예약하기
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text className="text-gray-500 text-sm">객실 정보가 없습니다.</Text>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccDetailPage;
