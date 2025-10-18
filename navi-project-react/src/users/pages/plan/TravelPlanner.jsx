import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, message, Modal } from "antd";
import HeaderLayout from "../../layout/HeaderLayout";
import FooterLayout from "../../layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { savePlan } from "../../../common/api/planApi";
import { getAccessToken, parseJwt } from "../../../common/api/naviApi";

import TravelMap from "./components/TravelMap";
import StepDrawer from "./components/StepDrawer";
import TimeDrawer from "./components/TimeDrawer";
import TravelSelectDrawer from "./components/TravelSelectDrawer";
import StaySelectDrawer from "./components/StaySelectDrawer";
import DateModal from "./components/DateModal";
import TitleModal from "./components/TitleModal";
import StaySelectModal from "./components/StaySelectModal";

const { Content } = Layout;

export default function TravelPlanner() {
  const navigate = useNavigate();

  /** ✅ 페이지 진입 시 로그인 확인 */
  useEffect(() => {
    const token =
      localStorage.getItem("ACCESS_TOKEN") ||
      localStorage.getItem("accessToken");
    if (!token) {
      message.warning("로그인 후 이용 가능한 서비스입니다.");
      navigate("/login");
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [times, setTimes] = useState({});
  const [selectedTravels, setSelectedTravels] = useState([]);
  const [selectedStays, setSelectedStays] = useState([]);
  const [showStayModal, setShowStayModal] = useState(false);
  const [selectedStayTarget, setSelectedStayTarget] = useState(null);
  const [stayPlans, setStayPlans] = useState({});
  const [modalResetTrigger, setModalResetTrigger] = useState(0);

  useEffect(() => {
    if (step !== 5) setShowStayModal(false);
  }, [step]);

  // ✅ 숙소 전체 초기화
  const resetAllStays = () => {
    setStayPlans({});
    setSelectedStays([]);
    setShowStayModal(false);
    setSelectedStayTarget(null);
    setModalResetTrigger((prev) => prev + 1);
  };

  // ✅ 모든 상태 초기화
  const resetAll = () => {
    setTimes({});
    setSelectedTravels([]);
    setSelectedStays([]);
    setStayPlans({});
    setShowStayModal(false);
    setSelectedStayTarget(null);
    setModalResetTrigger((prev) => prev + 1);
    setTitle("");
    setStep(2);
  };

  // ✅ 전체 날짜 계산
  const days = useMemo(() => {
    if (!dateRange.length) return [];
    const [start, end] = dateRange;
    const diff = end.diff(start, "day") + 1;
    return Array.from({ length: diff }, (_, i) => start.add(i, "day"));
  }, [dateRange]);

  const hasNights = days.length > 1;

  // ✅ 더미 데이터 (여행지, 숙소)
  const travels = [
    { id: 1, name: "도톤보리", desc: "오사카 중심 거리", img: "https://placehold.co/100x100", likes: 120, lat: 34.6687, lng: 135.5015 },
    { id: 2, name: "유니버설 스튜디오", desc: "테마파크 명소", img: "https://placehold.co/100x100", likes: 85, lat: 34.6677, lng: 135.432 },
    { id: 3, name: "오사카성", desc: "역사적인 명소", img: "https://placehold.co/100x100", likes: 150, lat: 34.6873, lng: 135.5255 },
    { id: 4, name: "신세카이", desc: "복고풍 상점가", img: "https://placehold.co/100x100", likes: 90, lat: 34.6525, lng: 135.5063 },
    { id: 5, name: "우메다 공중정원", desc: "전망대", img: "https://placehold.co/100x100", likes: 180, lat: 34.7058, lng: 135.4925 },
    { id: 6, name: "덴포잔 대관람차", desc: "항구 전망", img: "https://placehold.co/100x100", likes: 60, lat: 34.6545, lng: 135.4335 },
    { id: 7, name: "나카노시마 공원", desc: "도심 속 휴식 공간", img: "https://placehold.co/100x100", likes: 45, lat: 34.6938, lng: 135.5037 },
    { id: 8, name: "가이유칸 수족관", desc: "세계 최대급 수족관", img: "https://placehold.co/100x100", likes: 200, lat: 34.6565, lng: 135.4325 },
    { id: 9, name: "쿠로몬 시장", desc: "오사카의 부엌", img: "https://placehold.co/100x100", likes: 110, lat: 34.6644, lng: 135.5065 },
    { id: 10, name: "텐노지 동물원", desc: "도심 속 동물원", img: "https://placehold.co/100x100", likes: 30, lat: 34.6508, lng: 135.5085 },
  ];

  const stays = [
    { id: 11, name: "신사이바시 호텔", desc: "도심 근처 숙소", img: "https://placehold.co/100x100/6846FF/ffffff?text=S", lat: 34.6695, lng: 135.5008 },
    { id: 12, name: "난바 그랜드", desc: "난바역 도보 5분", img: "https://placehold.co/100x100/3E2F46/ffffff?text=N", lat: 34.6646, lng: 135.5002 },
    { id: 13, name: "우메다 레지던스", desc: "고급 아파트먼트", img: "https://placehold.co/100x100/2F3E46/ffffff?text=U", lat: 34.7, lng: 135.495 },
    { id: 14, name: "오사카 베이 타워", desc: "오션 뷰", img: "https://placehold.co/100x100/90A4AE/ffffff?text=B", lat: 34.652, lng: 135.432 },
    { id: 15, name: "혼마치 캡슐", desc: "가성비 숙소", img: "https://placehold.co/100x100/FF5722/ffffff?text=H", lat: 34.685, lng: 135.5 },
  ];

  // ✅ 숙소 일정 선택 핸들러
  const handleStaySelect = (stay, dates) => {
    setStayPlans((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(
        (k) => (updated[k] = updated[k].filter((d) => !dates.includes(d)))
      );
      if (dates.length) updated[stay.name] = dates.sort();
      else delete updated[stay.name];
      const active = Object.keys(updated).filter((k) => updated[k].length);
      setSelectedStays(stays.filter((s) => active.includes(s.name)));
      return updated;
    });
  };

  // ✅ 지도 마커
  const markers = useMemo(() => {
    const travelMarkers = selectedTravels.map((t, i) => ({
      ...t,
      type: "travel",
      order: i + 1,
    }));
    const stayMarkers = selectedStays.map((s) => ({ ...s, type: "stay" }));
    return [...travelMarkers, ...stayMarkers];
  }, [selectedTravels, selectedStays]);

  // ✅ 저장 요청 (user 변수 사용 안 함)
  const handleConfirm = async () => {
    if (!title || !dateRange.length) {
      return message.warning("제목과 여행 기간을 모두 입력해주세요.");
    }
    if (selectedTravels.length === 0) {
      return message.warning("최소 1개 이상의 여행지를 선택해주세요.");
    }

    // ✅ JWT 토큰 가져오기
    const token = getAccessToken();

    if (!token) {
      Modal.warning({
        title: "로그인 필요",
        content: "로그인 후 이용 가능합니다.",
        onOk: () => navigate("/login"),
      });
      return;
    }

    // ✅ JWT 파싱 (안전하게)
    let payload = null;

    try {
      payload = parseJwt(token);
    } catch (err) {
      console.error("❌ JWT 파싱 오류:", err);
      Modal.error({
        title: "로그인 정보 오류",
        content: "로그인 세션이 만료되었거나 손상되었습니다. 다시 로그인해주세요.",
        onOk: () => navigate("/login"),
      });
      return;
    }

    // ✅ userId 추출
    const userId = payload?.id;

    if (!userId) {
      Modal.error({
        title: "유저 정보 오류",
        content: "로그인 정보에 문제가 있습니다. 다시 로그인해주세요.",
        onOk: () => navigate("/login"),
      });
      return;
    }

    // ✅ 기본 시간 설정
    const defaultStartTime = "10:00:00";
    const defaultEndTime = "22:00:00";

    // ✅ 첫 번째 여행지 썸네일
    const thumbnailPath = selectedTravels[0]?.img || null;

    const body = {
      userId,
      title,
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
      travels: selectedTravels.map((t) => ({
        travelId: t.id,
        travelName: t.name,
      })),
      stays: selectedStays.map((s) => ({
        stayId: s.id,
        stayName: s.name,
        dates: stayPlans[s.name] || [],
      })),
      thumbnailPath,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    };

    try {
      await savePlan(body);
      message.success("여행 계획이 저장되었습니다!");
      navigate("/plans");
    } catch (err) {
      if (err.response?.status === 401) {
        Modal.warning({
          title: "로그인 만료",
          content: "세션이 만료되었습니다. 다시 로그인해주세요.",
          onOk: () => navigate("/login"),
        });
      } else {
        console.error("❌ 저장 중 오류:", err);
        Modal.error({
          title: "저장 실패",
          content: "여행 계획 저장 중 문제가 발생했습니다.",
        });
      }
    }
  };
  // ✅ 실제 렌더링
  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <HeaderLayout />
      <Content style={{ width: "100vw", overflowX: "hidden" }}>
        <div
          className="shadow-xl bg-white rounded-lg transition-all duration-500"
          style={{
            display: "grid",
            gridTemplateColumns:
              step === 3
                ? "10% 25% 0%"
                : step >= 4
                  ? "10% 50% 40%"
                  : "10% 90% 0%",
          }}
        >
          <StepDrawer
            step={step}
            setStep={setStep}
            title={title}
            selectedTravels={selectedTravels}
            dateRange={dateRange}
            stayPlans={stayPlans}
            stays={stays}
            handleConfirm={handleConfirm}
          />

          <div className="flex h-[calc(100vh-100px)] border-l border-[#eee] transition-all duration-500">
            {step === 3 && (
              <TimeDrawer
                days={days}
                times={times}
                setTimes={setTimes}
                title={title}
                dateRange={dateRange}
              />
            )}

            {step === 4 && (
              <>
                <TravelSelectDrawer
                  travels={travels}
                  title={title}
                  dateRange={dateRange}
                  selectedTravels={selectedTravels}
                  setSelectedTravels={setSelectedTravels}
                />
                <div className="border-l border-gray-200 bg-white"></div>
              </>
            )}

            {step === 5 && (
              <>
                <StaySelectDrawer
                  stays={stays}
                  title={title}
                  dateRange={dateRange}
                  days={days}
                  hasNights={hasNights}
                  stayPlans={stayPlans}
                  setStayPlans={setStayPlans}
                  selectedStays={selectedStays}
                  setSelectedStays={setSelectedStays}
                  setSelectedStayTarget={setSelectedStayTarget}
                  setShowStayModal={setShowStayModal}
                  setModalResetTrigger={setModalResetTrigger}
                  resetAllStays={resetAllStays}
                />
              </>
            )}
          </div>

          {/* 지도 영역 */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "100%",
              }}
            >
              <TravelMap markers={markers} step={step} />
            </div>
          </div>
        </div>
      </Content>

      <FooterLayout />

      <DateModal
        open={step === 1}
        setStep={setStep}
        setDateRange={setDateRange}
        resetAll={resetAll}
      />
      <TitleModal
        open={step === 2}
        title={title}
        setTitle={setTitle}
        setStep={setStep}
      />
      <StaySelectModal
        open={showStayModal}
        onClose={() => setShowStayModal(false)}
        stay={selectedStayTarget}
        days={days}
        stayPlans={stayPlans}
        stays={stays}
        resetTrigger={modalResetTrigger}
        onSelectDates={handleStaySelect}
        setStayPlans={setStayPlans}
        setSelectedStays={setSelectedStays}
        resetAllStays={resetAllStays}
      />
    </Layout>
  );
}
