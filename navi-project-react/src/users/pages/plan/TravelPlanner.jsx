import React, { useState, useEffect, useMemo } from "react";
import { Layout, Modal, message, Splitter } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderLayout from "../../layout/HeaderLayout";
import FooterLayout from "../../layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getAllTravels, getAllStays } from "../../../common/api/planApi";
import dayjs from "dayjs";
import { getCookie } from "@/common/util/cookie";
import { API_SERVER_HOST } from "@/common/api/naviApi";

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
  const location = useLocation();
  const state = location.state;

  const [travels, setTravels] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const [splitSize, setSplitSize] = useState(40); // ✅ Splitter 비율 상태

  const cookie = getCookie("userCookie");
  const user = typeof cookie === "string" ? JSON.parse(cookie) : cookie;
  if (!user) return <div>로그인 후 이용해주세요.</div>;

  const handleDeleteItem = (travelId, title) => {
    Modal.confirm({
      title: "여행지 삭제 확인",
      content: `“${title}”을(를) 여행지 목록에서 삭제하시겠습니까?`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      centered: true,
      onOk: () => {
        setSelectedTravels((prev) => prev.filter((t) => t.travelId !== travelId));
        message.success(`"${title}"이(가) 여행지 목록에서 삭제되었습니다.`);
      },
    });
  };

  useEffect(() => {
    const loadData = async () => {

      setLoading(true);
      try {
        const allTravels = await getAllTravels();
        let finalTravels = allTravels;

        const deletedIds = location.state?.deletedIds;
        const deletedStays = location.state?.deletedStayIds || [];

        if (deletedIds?.length) {
          setSelectedTravels((prev) => prev.filter((t) => !deletedIds.includes(t.travelId)));
          finalTravels = allTravels.filter((t) => !deletedIds.includes(t.travelId));
          message.info(`${deletedIds.length}개의 여행지가 삭제되어 목록에서 제외되었습니다.`);
        }

        if (deletedStays.length > 0) {
          setSelectedStays((prev) => prev.filter((s) => !deletedStays.includes(s.accId)));
          setStayPlans((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((accId) => {
              if (deletedStays.includes(accId)) delete updated[accId];
            });
            return updated;
          });
          message.info(`${deletedStays.length}개의 숙소가 삭제되어 목록에서 제외되었습니다.`);
        }

        setTravels(finalTravels);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        message.error("여행지 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.state]);

  useEffect(() => {
    if (location.state?.from === "scheduler" && location.state?.restoreData) {
      const restoreData = location.state.restoreData;
      if (restoreData.selectedTravels) setSelectedTravels(restoreData.selectedTravels);
      if (restoreData.selectedStays) setSelectedStays(restoreData.selectedStays);
      if (restoreData.stayPlans) setStayPlans(restoreData.stayPlans);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const travelData = await getAllTravels();
        setTravels(travelData || []);
      } catch (err) {
        console.error("🚨 여행지 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStays = async () => {
      if (stays.length > 0 || step !== 5) return;
      setLoading(true);
      try {
        const stayData = await getAllStays();
        setStays(stayData || []);
      } catch (err) {
        console.error("🚨 숙소 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, [step]);

  const handleStaySelect = (stay, dates) => {
    setStayPlans((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[k] = updated[k].filter((d) => !dates.includes(d))));
      if (dates.length) updated[stay.accId] = dates.sort();
      else delete updated[stay.accId];
      const active = Object.keys(updated).filter((k) => updated[k].length);
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
    const start = dayjs(dateRange[0]);
    const end = dayjs(dateRange[1]);
    if (!start.isValid() || !end.isValid()) return [];
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
      const lat = parseFloat(t.latitude ?? t.mapy ?? t.lat);
      const lng = parseFloat(t.longitude ?? t.mapx ?? t.lng);
      const imageSrc =
        t.img?.trim() ||
        t.thumbnailPath?.trim() ||
        t.imagePath?.trim() ||
        "https://via.placeholder.com/150x150.png?text=No+Image";
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
        stay.accImage?.trim() ||
        stay.img?.trim() ||
        stay.imagePath?.trim() ||
        stay.thumbnailPath?.trim() ||
        `https://placehold.co/150x150?text=No+Image`;

      dates.forEach((dateStr) => {
        const parsed = dayjs(dateStr.includes("-") ? dateStr : `${dateRange[0].year()}-${dateStr}`);
        stayByDate[parsed.format("YYYY-MM-DD")] = {
          type: "stay",
          stayId: stay.accId ?? stay.id,
          title: stay.title,
          img: stayImg,
          lat: parseFloat(stay.latitude ?? stay.mapy ?? stay.lat),
          lng: parseFloat(stay.longitude ?? stay.mapx ?? stay.lng),
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
      if (i === 0)
        items.push({
          type: "poi",
          title: "제주공항 도착",
          icon: "bi bi-airplane",
          fixed: true,
          lng: 126.4927,
          lat: 33.5068,
          img: "https://via.placeholder.com/400x300.png?text=Arrival",
          startTime: defaultStart,
          endTime: defaultEnd,
        });
      if (stayItem) items.push({ ...stayItem, startTime: defaultStart, endTime: defaultEnd });
      buckets[i].forEach((it) => items.push({ ...it, startTime: defaultStart, endTime: defaultEnd }));
      if (i === dcount - 1)
        items.push({
          type: "poi",
          title: "제주공항 출발",
          icon: "bi bi-airplane",
          fixed: true,
          lng: 126.4927,
          lat: 33.5068,
          img: "https://via.placeholder.com/400x300.png?text=Departure",
          startTime: defaultStart,
          endTime: defaultEnd,
        });
      scheduleDays.push({ dateISO: dateKey, items });
    }
    return {
      meta: {
        title,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      },
      days: scheduleDays,
      dayTimes: times,
    };
  };

  const handleConfirm = () => {
    if (step === 4 || step === 5) {
      if (days.length > 0 && selectedTravels.length < days.length) {
        Modal.warning({
          title: "여행지 선택 부족",
          content: `여행일수(${days.length}일)에 비해 선택된 여행지가 부족합니다.`,
          centered: true,
          onOk: () => setStep(4),
        });
        return;
      }
    }
    const data = buildInitialSchedule();
    if (data?.days)
      data.days.forEach(
        (day) =>
        (day.items = day.items.map((it) => ({
          ...it,
          img: it.img?.trim() || "https://via.placeholder.com/150x150.png?text=No+Image",
        })))
      );
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
      .map((t, i) => ({
        ...t,
        type: "travel",
        latitude: parseFloat(t.latitude ?? t.mapy ?? t.lat),
        longitude: parseFloat(t.longitude ?? t.mapx ?? t.lng),
        order: i + 1,
      }))
      .filter((m) => !isNaN(m.latitude) && !isNaN(m.longitude));
    const stayMarkers = selectedStays
      .map((s, i) => ({
        ...s,
        type: "stay",
        latitude: parseFloat(s.latitude ?? s.mapy),
        longitude: parseFloat(s.longitude ?? s.mapx),
        order: i + 1,
      }))
      .filter((m) => !isNaN(m.latitude) && !isNaN(m.longitude));
    return [...travelMarkers, ...stayMarkers];
  }, [selectedTravels, selectedStays]);

  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <HeaderLayout />
      {loading ? (
        <div className="flex justify-center items-center h-screen text-gray-500">
          {step === 5 ? "숙소 데이터를 불러오는 중..." : "여행지 데이터를 불러오는 중..."}
        </div>
      ) : (
        <Content style={{ width: "100vw", overflowX: "hidden" }}>
          {/* ✅ Splitter 추가 (4,5단계만 적용) */}
          {step === 4 || step === 5 ? (
            <Splitter
              style={{ height: "calc(100vh - 100px)", borderTop: "1px solid #eee" }}
              min="20%"
              max="80%"
              size={splitSize}
              onChange={setSplitSize}
            >
              <Splitter.Panel>
                <div className="shadow-xl bg-white rounded-lg h-full flex">
                  <div
                    className="flex-shrink-0 border-r border-gray-200 transition-all duration-500"
                    style={{ flexBasis: "18%", minWidth: "150px", maxWidth: "200px" }}
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
                      days={days}
                      isViewMode={state?.isViewMode === true}
                    />
                  </div>
                  <div className="flex-1 border-r border-[#eee] overflow-y-auto">
                    {step === 4 ? (
                      <TravelSelectDrawer
                        travels={travels}
                        title={title}
                        dateRange={dateRange}
                        selectedTravels={selectedTravels}
                        setSelectedTravels={setSelectedTravels}
                        onDeleteTravel={handleDeleteItem}
                        days={days}
                      />
                    ) : (
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
                </div>
              </Splitter.Panel>

              <Splitter.Panel style={{ background: "#fafafa", position: "relative" }}>
                <TravelMap markers={markers} step={step} />
              </Splitter.Panel>
            </Splitter>
          ) : (
            // ✅ 기존 Step 1~3는 그대로 유지
            <div className="shadow-xl bg-white rounded-lg transition-all duration-500 h-[calc(100vh-100px)] flex">
              <div
                className="flex-shrink-0 border-r border-gray-200 transition-all duration-500"
                style={{ flexBasis: "18%", minWidth: "150px", maxWidth: "200px" }}
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
                  days={days}
                />
              </div>
              <div
                className="h-full overflow-y-auto border-r border-[#eee]"
                style={{
                  flexBasis: step <= 2 ? "18%" : "20%",
                  minWidth: "350px",
                }}
              >
                {step === 3 && (
                  <TimeDrawer days={days} times={times} setTimes={setTimes} title={title} dateRange={dateRange} />
                )}
              </div>
            </div>
          )}
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
        onClose={() => (step === 1 ? navigate("/plans") : setStep(3))}
        onDateChange={(start, end) => {
          setDateRange([start, end]);
          if (step === 1) setStep(2);
          else {
            message.success("여행 날짜가 수정되었습니다.");
            setStep(3);
          }
        }}
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
