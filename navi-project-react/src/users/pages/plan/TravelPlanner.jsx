import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, message, Modal } from "antd";
import HeaderLayout from "../../layout/HeaderLayout";
import FooterLayout from "../../layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getAllTravels, getAllStays, savePlan } from "../../../common/api/planApi";
import { useAuth } from "../../../common/hooks/useAuth";

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
  const [travels, setTravels] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuth(); // ✅ 로그인 훅 (최상단 한 번만 호출)

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

  /** ✅ 여행지 / 숙소 데이터 로드 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [travelData, stayData] = await Promise.all([
          getAllTravels(),
          getAllStays(),
        ]);
        setTravels(travelData || []);
        setStays(stayData || []);
      } catch (err) {
        console.error("🚨 여행/숙소 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  /** ✅ 단계 이동 시 숙소 모달 닫기 */
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

  // ✅ 숙소 일정 선택 핸들러
  const handleStaySelect = (stay, dates) => {
    setStayPlans((prev) => {
      const updated = { ...prev };

      // 날짜 중복 제거
      Object.keys(updated).forEach(
        (k) => (updated[k] = updated[k].filter((d) => !dates.includes(d)))
      );
      if (dates.length) updated[stay.accId] = dates.sort();
      else delete updated[stay.accId];
      const active = Object.keys(updated).filter((k) => updated[k].length);
      setSelectedStays(stays.filter((s) => active.includes(s.accId)));

      return updated;
    });
  };

  // ✅ 지도 마커 계산
  const markers = useMemo(() => {
    const travelMarkers = selectedTravels.map((t, i) => ({
      ...t,
      type: "travel",
      order: i + 1,
      latitude: parseFloat(t.latitude ?? t.lat ?? t.mapy ?? t.mapY),
      longitude: parseFloat(t.longitude ?? t.lng ?? t.mapx ?? t.mapX),
    }));

    // ✅ 숙소: mapx/mapy가 반대로 되어 있어서 교정
    const stayMarkers = selectedStays
      .map((s, i) => {
        const lat = parseFloat(s.latitude ?? s.lat ?? s.mapx ?? s.mapX); // mapx → 위도
        const lng = parseFloat(s.longitude ?? s.lng ?? s.mapy ?? s.mapY); // mapy → 경도
        if (isNaN(lat) || isNaN(lng)) {
          console.warn("[StayMarker Skip] invalid stay coords:", s.title, s.mapx, s.mapy);
          return null;
        }
        return {
          ...s,
          type: "stay",
          latitude: lat,
          longitude: lng,
          order: i + 1,
        };
      })
      .filter(Boolean);

    return [...travelMarkers, ...stayMarkers];
  }, [selectedTravels, selectedStays]);

  // ✅ 저장 요청
  const handleConfirm = async () => {
    if (!title || !dateRange.length) {
      return message.warning("제목과 여행 기간을 모두 입력해주세요.");
    }
    if (selectedTravels.length === 0) {
      return message.warning("최소 1개 이상의 여행지를 선택해주세요.");
    }

    if (!user) {
      message.warning("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // ✅ 기본 시간 설정
    const defaultStartTime = "10:00:00";
    const defaultEndTime = "22:00:00";

    // ✅ 첫 번째 여행지 썸네일
    const thumbnailPath = selectedTravels[0]?.img || null;

    const body = {
      userId: user.id, // DTO: String OK
      title,
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
      startTime: defaultStartTime, // DTO: LocalTime로 파싱됨 ("HH:mm:ss")
      endTime: defaultEndTime,
      thumbnailPath,
      travels: selectedTravels.map((t) => ({
        travelId: t.travelId,
        travelName: t.title,
      })),
      stays: selectedStays.map((s) => ({
        stayId: s.accId,
        stayName: s.title,
        // stayPlans는 accId 키로 관리하고 있으니 accId로 조회해야 합니다.
        // 날짜가 dayjs 객체일 수도 있으니 안전하게 문자열화
        dates: (stayPlans[s.accId] || []).map((d) =>
          d?.format ? d.format("YYYY-MM-DD") : d
        ),
      })),
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

      {/* ✅ 로딩 또는 로그인 전 상태 */}
      {loading || !user ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">
            {loading
              ? "여행지 데이터를 불러오는 중..."
              : "로그인 정보를 확인 중..."}
          </p>
        </div>
      ) : (
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
      )}

      <FooterLayout />

      {/* ✅ 모달 영역 */}
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
