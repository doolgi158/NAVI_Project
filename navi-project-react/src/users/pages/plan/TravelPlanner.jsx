import React, { useState, useEffect, useMemo } from "react";
import { Layout, message } from "antd";
import HeaderLayout from "@/users/layout/HeaderLayout";
import FooterLayout from "@/users/layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { savePlan } from "@/common/api/planApi";

// ✅ 분리된 컴포넌트 import
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

  const days = useMemo(() => {
    if (!dateRange.length) return [];
    const [start, end] = dateRange;
    const diff = end.diff(start, "day") + 1;
    return Array.from({ length: diff }, (_, i) => start.add(i, "day"));
  }, [dateRange]);

  const hasNights = days.length > 1;

  const travels = [
    {
      id: 1,
      name: "도톤보리",
      desc: "오사카 중심 거리",
      img: "https://placehold.co/100x100",
      likes: 120,
      lat: 34.6687,
      lng: 135.5015,
    },
    {
      id: 2,
      name: "유니버설 스튜디오",
      desc: "테마파크 명소",
      img: "https://placehold.co/100x100",
      likes: 85,
      lat: 34.6677,
      lng: 135.432,
    },
    {
      id: 3,
      name: "오사카성",
      desc: "역사적인 명소",
      img: "https://placehold.co/100x100",
      likes: 150,
      lat: 34.6873,
      lng: 135.5255,
    },
    {
      id: 4,
      name: "신세카이",
      desc: "복고풍 상점가",
      img: "https://placehold.co/100x100",
      likes: 90,
      lat: 34.6525,
      lng: 135.5063,
    },
    {
      id: 5,
      name: "우메다 공중정원",
      desc: "전망대",
      img: "https://placehold.co/100x100",
      likes: 180,
      lat: 34.7058,
      lng: 135.4925,
    },
    {
      id: 6,
      name: "덴포잔 대관람차",
      desc: "항구 전망",
      img: "https://placehold.co/100x100",
      likes: 60,
      lat: 34.6545,
      lng: 135.4335,
    },
    {
      id: 7,
      name: "나카노시마 공원",
      desc: "도심 속 휴식 공간",
      img: "https://placehold.co/100x100",
      likes: 45,
      lat: 34.6938,
      lng: 135.5037,
    },
    {
      id: 8,
      name: "가이유칸 수족관",
      desc: "세계 최대급 수족관",
      img: "https://placehold.co/100x100",
      likes: 200,
      lat: 34.6565,
      lng: 135.4325,
    },
    {
      id: 9,
      name: "쿠로몬 시장",
      desc: "오사카의 부엌",
      img: "https://placehold.co/100x100",
      likes: 110,
      lat: 34.6644,
      lng: 135.5065,
    },
    {
      id: 10,
      name: "텐노지 동물원",
      desc: "도심 속 동물원",
      img: "https://placehold.co/100x100",
      likes: 30,
      lat: 34.6508,
      lng: 135.5085,
    },
  ];

  const stays = [
    {
      id: 11,
      name: "신사이바시 호텔",
      desc: "도심 근처 숙소",
      img: "https://placehold.co/100x100/6846FF/ffffff?text=S",
      lat: 34.6695,
      lng: 135.5008,
    },
    {
      id: 12,
      name: "난바 그랜드",
      desc: "난바역 도보 5분",
      img: "https://placehold.co/100x100/3E2F46/ffffff?text=N",
      lat: 34.6646,
      lng: 135.5002,
    },
    {
      id: 13,
      name: "우메다 레지던스",
      desc: "고급 아파트먼트",
      img: "https://placehold.co/100x100/2F3E46/ffffff?text=U",
      lat: 34.7,
      lng: 135.495,
    },
    {
      id: 14,
      name: "오사카 베이 타워",
      desc: "오션 뷰",
      img: "https://placehold.co/100x100/90A4AE/ffffff?text=B",
      lat: 34.652,
      lng: 135.432,
    },
    {
      id: 15,
      name: "혼마치 캡슐",
      desc: "가성비 숙소",
      img: "https://placehold.co/100x100/FF5722/ffffff?text=H",
      lat: 34.685,
      lng: 135.5,
    },
  ];

  

  const handleStaySelect = (stay, dates) => {
    setStayPlans((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[k] = updated[k].filter((d) => !dates.includes(d))));
      if (dates.length) updated[stay.name] = dates.sort();
      else delete updated[stay.name];
      const active = Object.keys(updated).filter((k) => updated[k].length);
      setSelectedStays(stays.filter((s) => active.includes(s.name)));
      return updated;
    });
  };

  const markers = useMemo(() => {
    const travelMarkers = selectedTravels.map((t, i) => ({ ...t, type: "travel", order: i + 1 }));
    const stayMarkers = selectedStays.map((s) => ({ ...s, type: "stay" }));
    return [...travelMarkers, ...stayMarkers];
  }, [selectedTravels, selectedStays]);

  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <HeaderLayout />
      <Content style={{ width: "100vw", overflowX: "hidden" }}>
        <div
          className="shadow-xl bg-white rounded-lg"
          style={{
            display: "grid",
            gridTemplateColumns: step >= 3 ? "10% 45% 45%" : "10% 90% 0%",
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
            savePlan={savePlan}
          />

          <div className="flex h-[calc(100vh-100px)] border-l border-[#eee]">
            {step === 3 && (
              <TimeDrawer days={days} times={times} setTimes={setTimes} title={title} dateRange={dateRange} />
            )}
            {step === 4 && (
              <TravelSelectDrawer
                travels={travels}
                title={title}
                dateRange={dateRange}
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
              />
            )}
          </div>

          <div className="bg-[#FAF9F6]">
            <TravelMap markers={markers} />
          </div>
        </div>
      </Content>

      {/* 모달들 */}
      <DateModal open={step === 1} setStep={setStep} setDateRange={setDateRange} />
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
      />

      <FooterLayout />
    </Layout>
  );
}

