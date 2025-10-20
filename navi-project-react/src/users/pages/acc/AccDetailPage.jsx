import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { useKakaoMap } from "@/common/hooks/useKakaoMap";
import { setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const AccDetailPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accIdFromRedux = useSelector((state) => state.acc.selectedAcc);

  // ✅ 로컬 상태
  const [accId, setAccId] = useState(accIdFromRedux || null);
  const [accData, setAccData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 검색 조건 상태
  const [dateRange, setDateRange] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);

  // ✅ Kakao 지도 훅
  const { isMapLoaded, updateMap, resetMap } = useKakaoMap("acc-detail-map");

  /* ✅ 숙소 ID 유지 로직 */
  useEffect(() => {
    if (accIdFromRedux) {
      localStorage.setItem("selectedAccId", accIdFromRedux);
      setAccId(accIdFromRedux);
    } else {
      const savedId = localStorage.getItem("selectedAccId");
      if (savedId) {
        setAccId(savedId);
        dispatch(setSelectedAcc(savedId));
      }
    }
  }, [accIdFromRedux, dispatch]);

  /* ✅ 숙소 기본 데이터 로드 */
  useEffect(() => {
    if (!accId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/accommodations/${accId}`);
        const data = res.data;

        if (!data.active) {
          message.warning("운영 중이 아닌 숙소입니다.");
          navigate(-1);
          return;
        }

        setAccData(data);
      } catch (err) {
        console.error("숙소 상세 조회 실패:", err);
        message.error("숙소 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => resetMap();
  }, [accId, navigate, resetMap]);

  /* ✅ Kakao 지도 업데이트 */
  useEffect(() => {
    if (isMapLoaded && accData?.mapx && accData?.mapy) {
      updateMap({
        title: accData.title,
        latitude: accData.mapx,
        longitude: accData.mapy,
        thumbnailPath: accData.accImages?.[0],
      });
    }
  }, [isMapLoaded, accData, updateMap]);

  /* ✅ 검색 조건 복원 */
  useEffect(() => {
    const stored = localStorage.getItem("searchState");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.dateRange && parsed.dateRange.length === 2) {
          setDateRange([
            dayjs(parsed.dateRange[0]),
            dayjs(parsed.dateRange[1]),
          ]);
        }
        if (parsed.guestCount) setGuestCount(parsed.guestCount);
        if (parsed.roomCount) setRoomCount(parsed.roomCount);
      } catch (e) {
        console.warn("검색 조건 복원 실패:", e);
      }
    }
  }, []);

  /* ✅ 조건 기반 객실 리스트 로드 */
  const fetchRooms = useCallback(async () => {
    if (!accId || !dateRange) return;

    try {
      const checkIn = dateRange[0].format("YYYY-MM-DD");
      const checkOut = dateRange[1].format("YYYY-MM-DD");

      const res = await axios.get(`/api/rooms/${accId}`, {
        params: { checkIn, checkOut, guestCount, roomCount },
      });

      setRooms(res.data);
    } catch (err) {
      console.error("객실 목록 조회 실패:", err);
      message.error("객실 정보를 불러오지 못했습니다.");
    }
  }, [accId, dateRange, guestCount, roomCount]);

  // ✅ 날짜 변경 시 자동 객실 갱신
  useEffect(() => {
    if (dateRange) fetchRooms();
  }, [dateRange, guestCount, roomCount, fetchRooms]);

  /* ✅ 예약 버튼 클릭 → 예약 입력 페이지로 이동 */
  const handleReserve = (room) => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning("체크인 및 체크아웃 날짜를 선택해주세요.");
      return;
    }

    const checkIn = dateRange[0].format("YYYY-MM-DD");
    const checkOut = dateRange[1].format("YYYY-MM-DD");

    const reservationData = {
      accId,
      accName: accData.title,
      room,
      dateRange: [checkIn, checkOut],
      guestCount,
      roomCount,
    };

    navigate("/accommodations/detail/reservation", {
      state: reservationData,
    });
  };

  /* ✅ 로딩 상태 */
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
            {/* 숙소명 + 주소 */}
            <div className="mb-5">
              <Title level={3} className="text-gray-900 font-bold mb-1">
                {accData.title}
              </Title>
              <Text className="text-sm text-gray-600">{accData.address}</Text>
            </div>

            {/* 이미지 + 지도 */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={14}>
                {accData.accImages?.length > 0 ? (
  <Carousel autoplay dots className="rounded-xl overflow-hidden">
    {accData.accImages.map((img, idx) => (
      <div key={idx}>
        <img
          src={
            img.startsWith("http")
              ? img
              : `${API_SERVER_HOST}${img}` // ✅ 절대 경로 붙이기
          }
          alt={`${accData.title} 이미지 ${idx + 1}`}
          className="w-full h-[260px] object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            const fallback = document.createElement("div");
            fallback.className =
              "w-full h-[260px] flex items-center justify-center text-gray-500 bg-gray-100 text-sm";
            fallback.textContent = "이미지 준비중";
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>
    ))}
  </Carousel>
) : (
  <div className="bg-gray-100 rounded-xl h-[260px] flex items-center justify-center text-gray-500 text-sm">
    이미지 준비중
  </div>
)}

              </Col>

              <Col xs={24} lg={10}>
                <div
                  id="acc-detail-map"
                  className="w-full h-[260px] rounded-xl border border-gray-200 shadow-inner"
                />
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

            {/* 숙박 조건 선택 */}
            <Divider />
            <Title level={5} className="text-gray-800 mb-5 font-semibold">
              숙박 조건 선택
            </Title>

            <div className="flex flex-wrap gap-4 mb-8 items-end">
              <div className="flex flex-col">
                <Text className="text-sm text-gray-600 mb-2 font-medium">
                  숙박 일정
                </Text>
                <RangePicker
                  format="YYYY-MM-DD"
                  placeholder={["체크인", "체크아웃"]}
                  value={dateRange}
                  size="large"
                  onChange={(v) => setDateRange(v)}
                />
              </div>

              <div className="flex flex-col">
                <Text className="text-sm text-gray-600 mb-2 font-medium">
                  인원 수
                </Text>
                <InputNumber
                  min={1}
                  max={30}
                  value={guestCount}
                  onChange={setGuestCount}
                  size="large"
                />
              </div>

              <div className="flex flex-col">
                <Text className="text-sm text-gray-600 mb-2 font-medium">
                  객실 수
                </Text>
                <InputNumber
                  min={1}
                  max={10}
                  value={roomCount}
                  onChange={setRoomCount}
                  size="large"
                />
              </div>

              <Button type="primary" onClick={fetchRooms} className="h-[40px]">
                객실 조회
              </Button>
            </div>

            {/* 객실 목록 */}
            <Divider className="my-6" />
            <Title level={5} className="text-gray-800 mb-4 font-semibold">
              객실 정보
            </Title>

            {rooms?.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* 객실 이미지 */}
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

                    {/* ✅ 객실 정보 + 버튼 */}
                    <div className="flex flex-col justify-between p-4 flex-1 bg-white">
                      <div>
                        <Title level={5} className="text-gray-900 mb-1">
                          {room.roomName}
                        </Title>
                        <Text className="block text-gray-600 text-sm mb-1">
                          최대 인원 {room.maxCnt}명
                        </Text>
                        <Text className="block text-[#006D77] font-semibold text-base mb-1">
                          {room.weekdayFee
                            ? `${room.weekdayFee.toLocaleString()}원 / 1박`
                            : "가격 미정"}
                        </Text>
                      </div>

                      <div className="flex justify-between items-end">
                        {room.remainCount !== null && (
                          <Text
                            type={room.remainCount <= 3 ? "danger" : "secondary"}
                            className={`font-medium ${
                              room.remainCount <= 3
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
                          disabled={room.remainCount !== null && room.remainCount <= 0}
                        >
                          {room.remainCount !== null && room.remainCount <= 0
                            ? "예약 마감"
                            : "예약하기"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text className="text-gray-500 text-sm">
                조건에 맞는 객실이 없습니다.
              </Text>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccDetailPage;
