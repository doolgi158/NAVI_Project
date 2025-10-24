import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation 추가
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
  const { state } = useLocation();

  // ✅ PlanScheduler에서 돌아온 경우, 기존 데이터 복원
  useEffect(() => {
    if (location.state && location.state.from === "scheduler") {
      const { meta, days, dayTimes } = location.state;
      if (meta?.title) setTitle(meta.title);
      if (meta?.startDate && meta?.endDate)
        setDateRange([dayjs(meta.startDate), dayjs(meta.endDate)]);
      if (dayTimes) setTimes(dayTimes);
      if (days) {
        // 복원된 days 데이터는 그대로 유지
        console.log("📦 PlanScheduler → 복원된 일정 데이터:", days);
      }
    }
  }, [location.state]);

  const [step, setStep] = useState(() => state?.step || 1);
  const [title, setTitle] = useState(() => state?.restoreData?.title || "");
  const [dateRange, setDateRange] = useState(() => state?.restoreData?.dateRange || []);
  const [times, setTimes] = useState(() => state?.restoreData?.times || {});
  const [selectedTravels, setSelectedTravels] = useState(() => state?.restoreData?.selectedTravels || []);
  const [stayPlans, setStayPlans] = useState(() => state?.restoreData?.stayPlans || {});
  const [selectedStays, setSelectedStays] = useState(() => state?.restoreData?.selectedStays || []);

  const [showStayModal, setShowStayModal] = useState(false);
  const [selectedStayTarget, setSelectedStayTarget] = useState(null);
  const [modalResetTrigger, setModalResetTrigger] = useState(0);

  const cookie = getCookie("userCookie");
  const user = typeof cookie === "string" ? JSON.parse(cookie) : cookie;

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

  const resetAllStays = () => {
    setStayPlans({});
    setSelectedStays([]);
  };

  const days = useMemo(() => {
    if (!dateRange.length) return [];
    const [start, end] = dateRange;
    const diff = end.diff(start, "day") + 1;
    return Array.from({ length: diff }, (_, i) => start.add(i, "day"));
  }, [dateRange]);
  const hasNights = days.length > 1;

  const buildInitialSchedule = () => {
    const start = dateRange?.[0];
    const end = dateRange?.[1];
    if (!start || !end) return null;

    const dcount = end.diff(start, "day") + 1;
    const buckets = Array.from({ length: dcount }, () => []);
    selectedTravels.forEach((t, idx) => {
      const lat = parseFloat(t.latitude ?? t.mapy ?? t.mapy ?? t.lat);
      const lng = parseFloat(t.longitude ?? t.mapx ?? t.mapx ?? t.lng);
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

    const stayByDate = {};
    Object.entries(stayPlans).forEach(([accId, dates]) => {
      const stay = selectedStays.find((s) => s.accId === accId);
      if (!stay) return;

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
          lat: parseFloat(stay.latitude ?? stay.mapy ?? stay.lat ?? stay.mapy),
          lng: parseFloat(stay.longitude ?? stay.mapx ?? stay.lng ?? stay.mapx),
        };
      });
    });

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
          lng: 126.49271493655533,
          lat: 33.50684612635678,
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtda-mfQ8IclFL2JOrafNwY_03skX839tZ60IPclmkut3tH4r7xDFySp8ZOt6tSUaHFvA&usqp=CAU",
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
          lng: 126.49271493655533,
          lat: 33.50684612635678,
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtda-mfQ8IclFL2JOrafNwY_03skX839tZ60IPclmkut3tH4r7xDFySp8ZOt6tSUaHFvA&usqp=CAU",
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
      dayTimes: times, // ✅ 시간 설정 포함
    };
  };

  const handleConfirm = () => {
    const data = buildInitialSchedule();
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
    navigate("/plans/scheduler", {
      state: {
        ...data,
        title,
        dateRange,
        times,
        selectedTravels,
        selectedStays,
        stayPlans,
      },
    });
  };

  const markers = useMemo(() => {
    const travelMarkers = selectedTravels
      .map((t, i) => {
        const lat = parseFloat(t.mapy ?? t.latitude ?? t.lat);
        const lng = parseFloat(t.mapx ?? t.longitude ?? t.lng);
        if (isNaN(lat) || isNaN(lng)) return null;
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
              gridTemplateColumns: step >= 4 ? "10% 50% 40%" : "10% 90% 0%",
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
                <TimeDrawer
                  key="time"
                  days={days}
                  times={times}
                  setTimes={setTimes}
                  title={title}
                  dateRange={dateRange}
                />
              ) : step === 4 ? (
                <TravelSelectDrawer
                  key="travel"
                  travels={travels}
                  title={title}
                  dateRange={dateRange}
                  selectedTravels={selectedTravels}
                  setSelectedTravels={setSelectedTravels}
                />
              ) : step === 5 ? (
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
      )}
      <FooterLayout />
      <DateModal
        open={step === 1 || step === 99}
        isEditMode={step === 99}
        meta={{
          startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
          endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
        }}
        onClose={() => {
          if (step === 1) {
            // ✅ 등록 단계에서 취소 누르면 /plans로 이동
            navigate("/plans");
          } else if (step === 99) {
            // ✅ 수정 단계에서는 단순히 닫기만
            setStep(3);
          }
        }}
        onDateChange={(start, end) => {
          setDateRange([start, end]);
          if (step === 1) {
            // 새 등록 → 다음 단계 이동
            setStep(2);
          } else if (step === 99) {
            // 수정 모드 → 모달 닫고 그대로 유지
            message.success("여행 날짜가 수정되었습니다.");
            setStep(3);
          }
        }}
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
