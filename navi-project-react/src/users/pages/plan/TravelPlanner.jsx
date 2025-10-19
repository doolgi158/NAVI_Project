import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, message } from "antd";
import HeaderLayout from "../../layout/HeaderLayout";
import FooterLayout from "../../layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getAllTravels, getAllStays } from "../../../common/api/planApi";
import { useAuth } from "../../../common/hooks/useAuth";
import dayjs from "dayjs";


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
  const user = useAuth();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [times, setTimes] = useState({});
  const [selectedTravels, setSelectedTravels] = useState([]);
  const [stayPlans, setStayPlans] = useState({});
  const [selectedStays, setSelectedStays] = useState([]);
  const [showStayModal, setShowStayModal] = useState(false);
  const [selectedStayTarget, setSelectedStayTarget] = useState(null);
  const [modalResetTrigger, setModalResetTrigger] = useState(0);

  const resetAll = () => {
    setTimes({});
    setSelectedTravels([]);
    setSelectedStays([]);
    setStayPlans({});
    setShowStayModal(false);
    setSelectedStayTarget(null);
    setTitle("");
    setStep(2);
    setModalResetTrigger((prev) => prev + 1);
  };



  /** ✅ 데이터 로드 */
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
        console.error("🚨 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


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

      // 선택된 숙소 리스트 갱신
      const active = Object.keys(updated).filter((k) => updated[k].length);
      setSelectedStays(stays.filter((s) => active.includes(s.accId)));

      return updated;
    });
  };
  /** ✅ 숙소 일정 변경 로직 (단일 관리) */
  const handleStayChange = (accId, selectedDates) => {
    setStayPlans((prev) => {
      const updated = { ...prev };
      if (!selectedDates.length) delete updated[accId];
      else updated[accId] = selectedDates.sort();

      const active = Object.keys(updated);
      setSelectedStays(stays.filter((s) => active.includes(s.accId)));
      return updated;
    });
  };

  /** ✅ 숙소 전체 초기화 */
  const resetAllStays = () => {
    setStayPlans({});
    setSelectedStays([]);
  };

  /** ✅ 전체 날짜 계산 */
  const days = useMemo(() => {
    if (!dateRange.length) return [];
    const [start, end] = dateRange;
    const diff = end.diff(start, "day") + 1;
    return Array.from({ length: diff }, (_, i) => start.add(i, "day"));
  }, [dateRange]);
  const hasNights = days.length > 1;

  // ✅ 일정 생성용 데이터 빌더 (기존 그대로 사용)
  const buildInitialSchedule = () => {
    const start = dateRange?.[0];
    const end = dateRange?.[1];
    if (!start || !end) return null;

    const dcount = end.diff(start, "day") + 1;

    // 1️⃣ 여행지 1/n 분배
    const buckets = Array.from({ length: dcount }, () => []);
    selectedTravels.forEach((t, idx) => {
      buckets[idx % dcount].push({
        type: "travel",
        id: t.travelId,
        title: t.title,
        img: t.img,
        lat: parseFloat(t.latitude ?? t.lat ?? t.mapy ?? t.mapY),
        lng: parseFloat(t.longitude ?? t.lng ?? t.mapx ?? t.mapX),
      });
    });

    // 2️⃣ 숙소 날짜 매핑 (날짜 포맷을 YYYY-MM-DD로 고정)
    const stayByDate = {};
    Object.entries(stayPlans).forEach(([accId, dates]) => {
      const stay = selectedStays.find((s) => s.accId === accId);
      if (!stay) return;

      dates.forEach((dateStr) => {
        const parsed = dateStr.includes("-")
          ? dayjs(dateStr)
          : dayjs(dateRange[0].year() + "-" + dateStr); // MM/DD → 2025-11-02 같은 형태로 보정
        const key = parsed.format("YYYY-MM-DD");
        stayByDate[key] = {
          type: "stay",
          id: stay.accId,
          title: stay.title,
          img: stay.accImages?.[0],
          lat: parseFloat(stay.latitude ?? stay.mapx ?? stay.lat ?? stay.mapX),
          lng: parseFloat(stay.longitude ?? stay.mapy ?? stay.lng ?? stay.mapY),
        };
      });
    });

    // 3️⃣ 날짜별 일정 생성
    const scheduleDays = [];
    for (let i = 0; i < dcount; i++) {
      const date = start.add(i, "day");
      const dateKey = date.format("YYYY-MM-DD");
      const items = [];

      const stayItem = stayByDate[dateKey] || null;

      // ✅ 기본 시간 (10:00~22:00)
      const defaultStart = "10:00";
      const defaultEnd = "22:00";

      // ✅ 첫날: 공항 → 숙소 → 여행지
      if (i === 0) {
        items.push({
          type: "poi",
          title: "제주공항 도착",
          icon: "bi bi-airplane",
          fixed: true,
          startTime: defaultStart,
          endTime: defaultEnd,
        });
        if (stayItem)
          items.push({ ...stayItem, startTime: defaultStart, endTime: defaultEnd });
        buckets[i].forEach((it) =>
          items.push({ ...it, startTime: defaultStart, endTime: defaultEnd })
        );
      }
      // ✅ 마지막날: 숙소 → 여행지 → 공항
      else if (i === dcount - 1) {
        if (stayItem)
          items.push({ ...stayItem, startTime: defaultStart, endTime: defaultEnd });
        buckets[i].forEach((it) =>
          items.push({ ...it, startTime: defaultStart, endTime: defaultEnd })
        );
        items.push({
          type: "poi",
          title: "제주공항 출발",
          icon: "bi bi-airplane",
          fixed: true,
          startTime: defaultStart,
          endTime: defaultEnd,
        });
      }
      // ✅ 중간날: 숙소 → 여행지
      else {
        if (stayItem)
          items.push({ ...stayItem, startTime: defaultStart, endTime: defaultEnd });
        buckets[i].forEach((it) =>
          items.push({ ...it, startTime: defaultStart, endTime: defaultEnd })
        );
      }

      scheduleDays.push({
        dateISO: dateKey,
        items,
      });
    }

    return {
      meta: {
        title,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        defaultStartTime: "10:00",
        defaultEndTime: "22:00",
      },
      days: scheduleDays,
    };
  };


  const handleConfirm = () => {
    const data = buildInitialSchedule();
    navigate("/plans/schedule", { state: data });
  };

  // /** ✅ 저장 요청 */
  // const handleConfirm = async () => {
  //   if (!title || !dateRange.length) {
  //     return message.warning("제목과 여행 기간을 입력해주세요.");
  //   }
  //   if (selectedTravels.length === 0) {
  //     return message.warning("최소 1개 이상의 여행지를 선택해주세요.");
  //   }
  //   if (!user) {
  //     message.warning("로그인 정보가 없습니다. 다시 로그인해주세요.");
  //     navigate("/login");
  //     return;
  //   }

  //   const defaultStartTime = "10:00:00";
  //   const defaultEndTime = "22:00:00";
  //   const thumbnailPath = selectedTravels[0]?.img || null;

  //   const body = {
  //     userId: user.id,
  //     title,
  //     startDate: dateRange[0].format("YYYY-MM-DD"),
  //     endDate: dateRange[1].format("YYYY-MM-DD"),
  //     startTime: defaultStartTime,
  //     endTime: defaultEndTime,
  //     thumbnailPath,
  //     travels: selectedTravels.map((t) => ({
  //       travelId: t.travelId,
  //       travelName: t.title,
  //     })),
  //     stays: selectedStays.map((s) => ({
  //       stayId: s.accId,
  //       stayName: s.title,
  //       dates: (stayPlans[s.accId] || []).map((d) =>
  //         d?.format ? d.format("YYYY-MM-DD") : d
  //       ),
  //     })),
  //   };

  //   try {
  //     await savePlan(body);
  //     message.success("여행 계획이 저장되었습니다!");
  //     navigate("/plans");
  //   } catch (err) {
  //     Modal.error({
  //       title: "저장 실패",
  //       content: "여행 계획 저장 중 문제가 발생했습니다.",
  //     });
  //   }
  // };

  /** ✅ 지도 마커 */
  const markers = useMemo(() => {
    const travelMarkers = selectedTravels
      .map((t, i) => {
        const lat = parseFloat(t.mapY ?? t.latitude ?? t.lat);
        const lng = parseFloat(t.mapX ?? t.longitude ?? t.lng);

        if (isNaN(lat) || isNaN(lng)) {
          console.warn("[TravelMarker Skip] invalid coords:", t.title, t.mapX, t.mapY);
          return null;
        }

        return {
          ...t,
          type: "travel",
          order: i + 1,
          latitude: lat,
          longitude: lng,
        };
      })
      .filter(Boolean);

    const stayMarkers = selectedStays
      .map((s, i) => ({
        ...s,
        type: "stay",
        latitude: parseFloat(s.latitude ?? s.mapx),
        longitude: parseFloat(s.longitude ?? s.mapy),
        order: i + 1,
      }))
      .filter((s) => !isNaN(s.latitude) && !isNaN(s.longitude));

    return [...travelMarkers, ...stayMarkers];
  }, [selectedTravels, selectedStays]);

  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <HeaderLayout />

      {loading || !user ? (
        <div className="flex justify-center items-center h-screen text-gray-500">
          {loading ? "여행지 데이터를 불러오는 중..." : "로그인 정보를 확인 중..."}
        </div>
      ) : (
        <Content style={{ width: "100vw", overflowX: "hidden" }}>
          <div
            className="shadow-xl bg-white rounded-lg transition-all duration-500"
            style={{
              display: "grid",
              gridTemplateColumns:
                step >= 4 ? "10% 50% 40%" : "10% 90% 0%",
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
              onSaveSchedule={handleConfirm}
            />

            <div className="flex h-[calc(100vh-100px)] border-l border-[#eee]">
              {step === 3 && (
                <TimeDrawer days={days} times={times} setTimes={setTimes} />
              )}

              {step === 4 && (
                <TravelSelectDrawer
                  travels={travels}
                  selectedTravels={selectedTravels}
                  setSelectedTravels={setSelectedTravels}
                />
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

            <div style={{ position: "relative" }}>
              <div className="absolute inset-0">
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
      <TitleModal open={step === 2} title={title} setTitle={setTitle} setStep={setStep} />
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
