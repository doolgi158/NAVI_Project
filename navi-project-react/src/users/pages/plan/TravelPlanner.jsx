import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "antd";
import HeaderLayout from "../../layout/HeaderLayout";
import FooterLayout from "../../layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getAllTravels, getAllStays } from "../../../common/api/planApi";
import dayjs from "dayjs";
import { getCookie } from "@/common/util/cookie";

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

  const cookie = getCookie("userCookie");
  const user =
    typeof cookie === "string"
      ? JSON.parse(cookie)
      : cookie;

  if (!user) {
    return <div>로그인 후 이용해주세요.</div>;
  }

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

    // ✅ 여행지 1/n 분배
    const buckets = Array.from({ length: dcount }, () => []);
    selectedTravels.forEach((t, idx) => {
      const lat = parseFloat(t.latitude ?? t.mapx ?? t.mapx ?? t.lat);
      const lng = parseFloat(t.longitude ?? t.mapy ?? t.mapy ?? t.lng);

      // ✅ 안전한 이미지 경로 정규화 (빈 문자열도 필터링)
      const imageSrc =
        t.img && t.img.trim() !== ""
          ? t.img
          : t.thumbnailPath && t.thumbnailPath.trim() !== ""
            ? t.thumbnailPath
            : t.imagePath && t.imagePath.trim() !== ""
              ? t.imagePath
              : "https://via.placeholder.com/150x150.png?text=No+Image";

      buckets[idx % dcount].push({
        type: "travel",
        travelId: t.travelId ?? t.id,
        title: t.title,
        img: imageSrc,
        lat,
        lng,
      });
    });


    // ✅ 숙소 매핑 (날짜별)
    const stayByDate = {};
    Object.entries(stayPlans).forEach(([accId, dates]) => {
      const stay = selectedStays.find((s) => s.accId === accId);
      if (!stay) return;

      // ✅ 숙소 이미지 정규화
      const stayImg =
        stay.img && stay.img.trim() !== ""
          ? stay.img
          : stay.thumbnailPath && stay.thumbnailPath.trim() !== ""
            ? stay.thumbnailPath
            : stay.imagePath && stay.imagePath.trim() !== ""
              ? stay.imagePath
              : Array.isArray(stay.accImages?.[0]) && stay.accImages.length > 0
                ? stay.accImages?.[0]
                : "https://via.placeholder.com/150x150.png?text=No+Image";

      dates.forEach((dateStr) => {
        const parsed = dateStr.includes("-")
          ? dayjs(dateStr)
          : dayjs(dateRange[0].year() + "-" + dateStr);
        const key = parsed.format("YYYY-MM-DD");
        stayByDate[key] = {
          type: "stay",
          stayId: stay.accId ?? stay.id,
          title: stay.title,
          img: stayImg,
          lat: parseFloat(stay.latitude ?? stay.mapx ?? stay.lat ?? stay.mapx),
          lng: parseFloat(stay.longitude ?? stay.mapy ?? stay.lng ?? stay.mapy),
        };
      });
    });

    // ✅ 날짜별 일정 구성
    const scheduleDays = [];
    for (let i = 0; i < dcount; i++) {
      const date = start.add(i, "day");
      const dateKey = date.format("YYYY-MM-DD");
      const items = [];

      const stayItem = stayByDate[dateKey] || null;
      const defaultStart = "10:00";
      const defaultEnd = "22:00";

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
      } else if (i === dcount - 1) {
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
      } else {
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

    // ✅ 전달 전에 모든 img 필드 재검증 (보조 안전장치)
    if (data?.days) {
      data.days.forEach((day) => {
        day.items = day.items.map((it) => ({
          ...it,
          img:
            it.img && it.img.trim() !== ""
              ? it.img
              : "https://via.placeholder.com/150x150.png?text=No+Image",
        }));
      });
    }

    navigate("/plans/scheduler", { state: data, replace: true });
  };

  /** ✅ 지도 마커 */
  const markers = useMemo(() => {
    const travelMarkers = selectedTravels
      .map((t, i) => {
        const lat = parseFloat(t.mapy ?? t.latitude ?? t.lat);
        const lng = parseFloat(t.mapx ?? t.longitude ?? t.lng);

        if (isNaN(lat) || isNaN(lng)) {
          console.warn("[TravelMarker Skip] invalid coords:", t.title, t.mapx, t.mapy);
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


              {step === 3 ? (
                <TimeDrawer key="time" days={days} times={times} setTimes={setTimes} title={title} dateRange={dateRange} />
              ) :
                step === 4 ? (
                  <TravelSelectDrawer
                    key="travel"
                    travels={Array.isArray(travels) ? travels : []}
                    title={title}
                    dateRange={dateRange}
                    selectedTravels={Array.isArray(selectedTravels) ? selectedTravels : []}
                    setSelectedTravels={setSelectedTravels}
                  />
                ) :

                  step === 5 ? (
                    <StaySelectDrawer
                      key="stay"
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
                  ) : null}
            </div>

            <div style={{ position: "relative" }}>
              <div className="absolute inset-0">
                <TravelMap markers={markers} step={step} />
              </div>
            </div>
          </div>
        </Content>
      )
      }

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
    </Layout >
  );
}
