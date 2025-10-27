import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Typography,
  Divider,
  Button,
  message,
  Spin,
  Row,
  Col,
  Carousel,
  DatePicker,
  InputNumber,
  Descriptions,
} from "antd";
import {
  PhoneOutlined,
  ClockCircleOutlined,
  CarOutlined,
  FireOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useKakaoMap } from "../../../common/hooks/useKakaoMap";
import { setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { setReserveData } from "../../../common/slice/paymentSlice";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const AccDetailPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux
  const selectedAccId = useSelector((state) => state.acc.selectedAccId);
  const searchState = useSelector((state) => state.acc.searchState);

  // 로컬 상태
  const [accId, setAccId] = useState(selectedAccId || null);
  const [accData, setAccData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL 파라미터로 accId 받기
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlAccId = query.get("accId");
    if (urlAccId && urlAccId !== accId) {
      setAccId(urlAccId);
      dispatch(setSelectedAcc(urlAccId));
      localStorage.setItem("selectedAccId", urlAccId);
    }
  }, [location.search, accId, dispatch]);

  // 검색 조건 상태
  const [dateRange, setDateRange] = useState(
    searchState?.dateRange?.length === 2
      ? [dayjs(searchState.dateRange[0]), dayjs(searchState.dateRange[1])]
      : null
  );
  const [guestCount, setGuestCount] = useState(searchState?.guestCount || 1);
  const [roomCount, setRoomCount] = useState(searchState?.roomCount || 1);

  // Kakao Map
  const { isMapLoaded, updateMap, resetMap } = useKakaoMap("kakao-detail-map-container");

  /* 숙소 ID 유지 (새로고침 방어) */
  useEffect(() => {
    if (selectedAccId) {
      localStorage.setItem("selectedAccId", selectedAccId);
      setAccId(selectedAccId);
    } else {
      const savedId = localStorage.getItem("selectedAccId");
      if (savedId) {
        setAccId(savedId);
        dispatch(setSelectedAcc(savedId));
      }
    }
  }, [selectedAccId, dispatch]);

  /* 숙소 기본 데이터 로드 */
  useEffect(() => {
    if (!accId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_SERVER_HOST}/api/accommodations/${accId}`);
        setAccData(res.data);
      } catch (err) {
        console.error("숙소 상세 조회 실패: ", err);
        message.error("숙소 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => resetMap();
  }, [accId, resetMap]);

  /* 지도 업데이트 */
  useEffect(() => {
    if (isMapLoaded && accData?.mapx && accData?.mapy) {
      updateMap({
        title: accData.title,
        latitude: accData.mapy,
        longitude: accData.mapx,
      });
    }
  }, [isMapLoaded, accData, updateMap]);

  /* 객실 데이터 조회 */
  const fetchRooms = useCallback(async () => {
    if (!accId || !dateRange) return;

    try {
      const checkIn = dateRange[0].format("YYYY-MM-DD");
      const checkOut = dateRange[1].format("YYYY-MM-DD");

      const res = await axios.get(`${API_SERVER_HOST}/api/rooms/${accId}`, {
        params: { checkIn, checkOut, guestCount, roomCount },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("객실 목록 조회 실패:", err);
      message.error("객실 정보를 불러오지 못했습니다.");
    }
  }, [accId, dateRange, guestCount, roomCount]);

  useEffect(() => {
    if (dateRange) fetchRooms();
  }, [dateRange, guestCount, roomCount, fetchRooms]);

  /* 예약 처리 */
  const handleReserve = async (room) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.warning("로그인이 필요한 서비스입니다.");
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.warning("체크인 및 체크아웃 날짜를 선택해주세요.");
      return;
    }

    const checkIn = dateRange[0].format("YYYY-MM-DD");
    const checkOut = dateRange[1].format("YYYY-MM-DD");
    const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
    const totalAmount = room.weekdayFee * roomCount * nights;

    const dtoList = [
      {
        reserveId: null,
        roomId: room.roomId,
        startDate: checkIn,
        endDate: checkOut,
        nights,
        quantity: roomCount,
        price: room.weekdayFee,
        guestCount,
      },
    ];

    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/room/reserve/pending`, dtoList, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const generatedReserveId =
        res.data?.reserveId || (Array.isArray(res.data) && res.data[0]?.reserveId);

      if (!generatedReserveId) {
        console.warn("⚠️ 서버 응답:", res.data);
        message.error("예약 ID 생성에 실패했습니다.");
        return;
      }

      const formData = {
        reserveId: generatedReserveId,
        roomId: room.roomId,
        checkIn,
        checkOut,
        guestCount,
        roomCount,
        totalAmount,
        nights,
        roomName: room.roomName,
      };

      const itemData = {
        accId,
        accName: accData.title,
        address: accData.address,
        thumbnail: accData.accImages?.[0] || null,
        room,
      };

      const items = [
        {
          reserveId: generatedReserveId,
          amount: room.weekdayFee,
        },
      ];

      // Redux에 저장
      dispatch(
        setReserveData({
          rsvType: "ACC",
          itemData,
          items,
          formData,
        })
      );

      // 결제 정보 입력 페이지로 이동
      navigate("/accommodations/detail/reservation", {
        state: {
          rsvType: "ACC",
          itemData,
          items,
          formData,
        },
      });
    } catch (err) {
      console.error("❌ 예약 임시 생성 실패:", err);
      message.error("예약 생성 중 오류가 발생했습니다.");
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
          숙소 정보를 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center pt-8 pb-10 px-6">
        <div className="w-full max-w-6xl">
          <div className="bg-white shadow-md rounded-2xl p-6">
            {/* 숙소 정보 */}
            <div className="mb-5">
              <Title level={3}>{accData.title}</Title>
              <Text className="text-sm text-gray-600">{accData.address}</Text>
            </div>

            {/* 이미지 + 지도 */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={14}>
                {accData.accImages?.length > 0 ? (
                  <Carousel autoplay dots className="rounded-xl overflow-hidden">
                    {accData.accImages.map((img, idx) => {
                      const src = img.startsWith("http")
                        ? img
                        : `${API_SERVER_HOST}${img}`;
                      return (
                        <div key={idx}>
                          <img
                            src={src}
                            alt={`숙소 이미지 ${idx + 1}`}
                            className="w-full h-[260px] object-cover rounded-xl"
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                ) : (
                  <div className="bg-gray-100 rounded-xl h-[260px] flex items-center justify-center text-gray-500">
                    이미지 준비중
                  </div>
                )}
              </Col>
              <Col xs={24} lg={10}>
                <div
                  id="kakao-detail-map-container"
                  className="w-full h-[260px] rounded-xl border border-gray-200 shadow-inner"
                />
              </Col>
            </Row>

            {/* 숙소 설명 */}
            <div className="mb-6">
              <Title level={5}>숙소 소개</Title>
              <Paragraph>{accData.overview || "숙소 소개 정보가 없습니다."}</Paragraph>
            </div>

            {/* 숙소 기본 정보 */}
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              className="rounded-xl overflow-hidden shadow-sm mb-8"
            >
              <Descriptions.Item label="문의전화">
                {accData.tel || "정보 없음"}
              </Descriptions.Item>
              <Descriptions.Item label="체크인 시간">
                {accData.checkInTime || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="체크아웃 시간">
                {accData.checkOutTime || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="주차 가능 여부">
                {accData.hasParking ? "가능" : "불가"}
              </Descriptions.Item>
              <Descriptions.Item label="취사 가능 여부">
                {accData.hasCooking ? "가능" : "불가"}
              </Descriptions.Item>
              <Descriptions.Item label="운영 상태">
                {accData.active ? "운영 중" : "운영 중단"}
              </Descriptions.Item>
            </Descriptions>

            {/* 숙박 조건 선택 */}
            <Divider />
            <Title level={5}>숙박 조건 선택</Title>

            <div className="flex flex-wrap gap-4 mb-8 items-end">
              <div className="flex flex-col">
                <Text>숙박 일정</Text>
                <RangePicker
                  format="YYYY-MM-DD"
                  value={dateRange}
                  size="large"
                  onChange={setDateRange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </div>

              <div className="flex flex-col">
                <Text>인원 수</Text>
                <InputNumber min={1} max={30} value={guestCount} onChange={setGuestCount} />
              </div>

              <div className="flex flex-col">
                <Text>객실 수</Text>
                <InputNumber min={1} max={10} value={roomCount} onChange={setRoomCount} />
              </div>

              <Button type="primary" onClick={fetchRooms}>
                객실 조회
              </Button>
            </div>

            {/* 객실 목록 */}
            <Divider />
            <Title level={5}>객실 정보</Title>

            {rooms?.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {room.thumbnailImage ? (
                      <img
                        src={`${API_SERVER_HOST}${room.thumbnailImage}`}
                        alt={room.roomName}
                        className="md:w-1/4 w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="md:w-1/4 w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        이미지 없음
                      </div>
                    )}

                    <div className="flex flex-col justify-between p-4 flex-1 bg-white">
                      <div>
                        <Title level={5}>{room.roomName}</Title>
                        <Text className="block text-gray-600 text-sm">
                          최대 인원 {room.maxCnt}명
                        </Text>
                        <Text className="block text-[#006D77] font-semibold text-base">
                          {room.weekdayFee
                            ? `${room.weekdayFee.toLocaleString()}원 / 1박`
                            : "가격 미정"}
                        </Text>
                      </div>

                      <div className="flex justify-between items-end">
                        {room.remainCount !== null && (
                          <Text
                            className={`font-medium ${room.remainCount <= 3
                              ? "text-red-500 font-semibold"
                              : "text-gray-600"
                              }`}
                          >
                            잔여 객실 {room.remainCount}개
                          </Text>
                        )}

                        <Button
                          type="primary"
                          size="large"
                          className="w-28 font-semibold"
                          onClick={() => handleReserve(room)}
                          disabled={room.remainCount <= 0}
                        >
                          {room.remainCount <= 0 ? "예약 마감" : "예약하기"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text className="text-gray-500 text-sm">조건에 맞는 객실이 없습니다.</Text>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccDetailPage;