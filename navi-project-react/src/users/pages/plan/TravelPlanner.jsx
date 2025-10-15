import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Button,
  DatePicker,
  TimePicker,
  List,
  Input,
  Empty,
  message,
  Modal,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "@/users/layout/HeaderLayout";
import FooterLayout from "@/users/layout/FooterLayout";
import "bootstrap-icons/font/bootstrap-icons.css";

const { Content } = Layout;

/*******************
 * 🗺 공통 지도
 *******************/
const TravelMap = ({ markers }) => {
  useEffect(() => {
    const scriptId = "kakao-map-sdk";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAOMAP_KEY
    }&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map-container");
        if (!container) return;
        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(34.8, 135.5),
          level: 8,
        });
        (markers || []).forEach((m) => {
          if (m?.lat && m?.lng) {
            new window.kakao.maps.Marker({
              map,
              position: new window.kakao.maps.LatLng(m.lat, m.lng),
            });
          }
        });
      });
    };
    document.body.appendChild(script);
  }, [markers]);

  return (
    <div
      id="map-container"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
      }}
    />
  );
};

/*******************
 * 🏷 공통: 제목 및 날짜 표시
 *******************/
const TitleDateDisplay = ({ title, dateRange }) => (
  // TimeDrawer의 스타일을 그대로 사용
  <div className="mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
    <h2 className="text-xl font-semibold text-[#1E3A8A]">
      ✈️ {title || "여행 제목 미정"}
    </h2>
    {dateRange.length > 0 && (
      <p className="text-gray-500 text-sm mt-1">
        {dateRange[0].format("YYYY.MM.DD")} ~ {dateRange[1].format("YYYY.MM.DD")}
      </p>
    )}
  </div>
);


/*******************
 * 📅 Step1: 날짜선택 모달
 *******************/
const DateModal = ({ open, setOpen, setDateRange, resetAll, fromMain = false, setStep }) => {
  const [range, setRange] = useState([]);
  const navigate = useNavigate();
  const disabledDate = (current) => current && current < dayjs().startOf("day");

  const closeAndGoStep2 = () => {
    setOpen(false);
    setStep(2);
  };

  return (
    <Modal
      open={open}
      centered
      closable={false}
      footer={null}
      width="60%"
      styles={{
        body: {
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "50px",
          textAlign: "center",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        },
      }}
    >
      <h2 className="text-[#1E3A8A] text-2xl font-bold mb-8">
        📅 여행 날짜를 선택하세요
      </h2>
      <DatePicker.RangePicker
        locale={dayjs.locale("ko")}
        value={range}
        onChange={(v) => setRange(v)}
        disabledDate={disabledDate}
        style={{
          width: "80%",
          height: 52,
          fontSize: 17,
          borderRadius: 10,
          borderColor: "#DADADA",
        }}
      />
      <div className="mt-10 flex justify-center gap-6">
        <Button
          size="large"
          onClick={() => {
            if (fromMain) navigate("/plans");
            else setOpen(false);
          }}
          style={{
            borderRadius: 10,
            background: "#ECECEC",
            color: "#2F3E46",
            border: "none",
            fontWeight: 500,
          }}
        >
          닫기
        </Button>
        <Button
          type="primary"
          size="large"
          style={{
            background: "#1E3A8A", // 현대적 색상 변경
            border: "none",
            borderRadius: 10,
            padding: "0 35px",
            fontWeight: 600,
          }}
          onClick={() => {
            if (!range || !range[0])
              return message.warning("날짜를 선택해주세요.");
            resetAll();
            setDateRange(range);
            closeAndGoStep2();
          }}
        >
          선택 완료
        </Button>
      </div>
    </Modal>
  );
};

/*******************
 * ✏️ Step2: 여행 제목 입력
 *******************/
const TitleModal = ({ open, setOpen, title, setTitle, setStep }) => {
  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      closable={false}
      footer={null}
      width="60%"
      transitionName="ant-fade"
      styles={{
        mask: {
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
        },
        body: {
          background: "#fff",
          borderRadius: "18px",
          padding: "50px",
          textAlign: "center",
          boxShadow: "0 10px 36px rgba(0,0,0,0.12)",
        },
      }}
    >
      <h2 className="text-[#1E3A8A] text-2xl font-bold mb-8">
        ✏️ 여행 제목을 입력하세요
      </h2>

      <Input
        placeholder="예: 가족과 함께하는 오사카 여행"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="large"
        style={{
          width: "80%",
          height: 52,
          fontSize: 17,
          borderRadius: 12,
          borderColor: "#DADADA",
        }}
      />

      <div className="mt-10 flex justify-center gap-6">
        <Button
          size="large"
          onClick={() => {
            setOpen(false);
            setStep(1);
          }}
          style={{
            borderRadius: 10,
            background: "#ECECEC",
            color: "#2F3E46",
            border: "none",
            padding: "0 35px",
            fontWeight: 500,
          }}
        >
          이전
        </Button>
        <Button
          type="primary"
          size="large"
          style={{
            background: "#1E3A8A", // 현대적 색상 변경
            border: "none",
            borderRadius: 10,
            padding: "0 45px",
            fontWeight: 600,
          }}
          onClick={() => {
            if (!title.trim()) {
              return message.warning("여행 제목을 입력해주세요!");
            }
            setOpen(false);
            setStep(3);
          }}
        >
          다음
        </Button>
      </div>
    </Modal>
  );
};

/*******************
 * ⏰ Step3: 시간 설정
 *******************/
const TimeDrawer = ({ days, times, setTimes, onPrev, title, dateRange }) => {
  const handleChange = (date, field, value) => {
    setTimes((prev) => {
      const updated = { ...(prev[date.format("YYYY-MM-DD")] || {}) };
      updated[field] = value ? value.format("HH:mm") : null;
      return { ...prev, [date.format("YYYY-MM-DD")]: updated };
    });
  };

  const getDisabledEndTime = (date) => {
    const startTime = times[date.format("YYYY-MM-DD")]?.start;
    if (!startTime) return {};
    const startHour = parseInt(startTime.split(":")[0], 10);
    const startMinute = parseInt(startTime.split(":")[1], 10);
    return {
      disabledHours: () => Array.from({ length: startHour }, (_, i) => i),
      disabledMinutes: (selectedHour) =>
        selectedHour === startHour
          ? Array.from({ length: startMinute }, (_, i) => i)
          : [],
    };
  };

  return (
    <div
      className="flex flex-col h-full bg-white shadow-md rounded-2xl p-6"
      style={{ width: "50%", border: "1px solid #eee" }}
    >
       {/* ➡️ TitleDateDisplay 컴포넌트로 대체 */}
      <TitleDateDisplay title={title} dateRange={dateRange} />

      <h2 className="text-[#2F3E46] font-semibold text-lg mb-4 h-[calc(100vh-120px)] overflow-hidden">
        ⏰ 일자별 시간 설정
      </h2>

      {/* TimeDrawer 내부 스크롤 영역 */}
      {/* ✅ 스크롤바 여백 추가 (pr-4) */}
      <div className="flex-1 overflow-y-auto custom-scroll pr-4"> 
        {days.length === 0 ? (
          <Empty description="여행 날짜를 먼저 선택해주세요" />
        ) : (
          <List
            dataSource={days}
            renderItem={(d) => (
              <List.Item
                key={d.format("YYYY-MM-DD")}
                className="hover:bg-blue-50 transition rounded-md px-2 py-1" // 현대적 hover 색상
              >
                <div className="flex gap-3 items-center w-full justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-24 font-medium text-[#2F3E46]">
                      {d.format("MM/DD (ddd)")}
                    </div>
                    <TimePicker
                      placeholder="시작"
                      format="HH:mm"
                      value={
                        times[d.format("YYYY-MM-DD")]?.start
                          ? dayjs(times[d.format("YYYY-MM-DD")].start, "HH:mm")
                          : null
                      }
                      onChange={(v) => handleChange(d, "start", v)}
                    />
                    <span>~</span>
                    <TimePicker
                      placeholder="종료"
                      format="HH:mm"
                      {...getDisabledEndTime(d)}
                      value={
                        times[d.format("YYYY-MM-DD")]?.end
                          ? dayjs(times[d.format("YYYY-MM-DD")].end, "HH:mm")
                          : null
                      }
                      onChange={(v) => handleChange(d, "end", v)}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

/*******************
 * 🧭 Step Drawer
 *******************/
const StepDrawer = ({ step, setStep, onPrev, onNext, selectedTravels, title }) => {
  const navigate = useNavigate();
  const steps = ["날짜 선택", "여행 제목", "시간 설정", "여행지 선택", "숙소 선택"];

  const handleComplete = () => {
    if (!title || title.trim() === "") {
      Modal.warning({
        title: "여행 제목을 입력하세요",
        content: "여행 제목을 입력해야 여행 계획을 완료할 수 있습니다.",
        centered: true,
      });
      setStep(2);
      return;
    }

    if (selectedTravels.length === 0) {
      Modal.warning({
        title: "여행지를 선택하세요",
        content: "최소 1개 이상의 여행지를 선택해야 합니다.",
        centered: true,
      });
      setStep(4);
      return;
    }

    Modal.success({
      title: "🎉 여행 계획이 완료되었습니다!",
      content: (
        <div>
          <p>
            제목: <strong>{title}</strong>
          </p>
          <p>선택한 여행지: {selectedTravels.length}곳</p>
        </div>
      ),
      centered: true,
      onOk: () => {
        navigate("/plans");
      },
    });
  };

  return (
    <div className="flex flex-col justify-between bg-[#FFFFFF] rounded-l-xl shadow-lg p-5">
      <div>
        <h3 className="text-[#1E3A8A] font-bold mb-4">진행 단계</h3>
        <ul className="space-y-2">
          {steps.map((label, i) => (
            <li
              key={i}
              onClick={() => setStep(i + 1)}
              className={`cursor-pointer px-3 py-2 rounded-lg transition-all ${
                step === i + 1
                  ? "bg-blue-100 text-blue-800 font-bold text-sm" // 현대적 하이라이트
                  : "hover:bg-gray-50 text-gray-700 font-medium"
              }`}
            >
              <span className="text-xs font-normal block text-gray-500">Step {i + 1}</span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {step > 1 && (
          <Button className="w-full h-10 border-gray-300 font-semibold" onClick={onPrev}>
            이전
          </Button>
        )}
        {step < 5 && (
          <Button
            type="primary"
            className="w-full h-10 font-semibold"
            style={{ background: "#1E3A8A", border: "none" }} // 현대적 색상 변경
            onClick={onNext}
          >
            다음
          </Button>
        )}
        {step === 5 && (
          <Button
            type="primary"
            className="w-full h-10 font-semibold"
            style={{ background: "#1E3A8A", border: "none" }} // 현대적 색상 변경
            onClick={handleComplete}
          >
            완료
          </Button>
        )}
      </div>
    </div>
  );
};

/*******************
 * 🏨 숙소 선택 모달 (오류 수정 반영)
 *******************/
const StaySelectModal = ({ open, onClose, stay, days, onSelectDates, resetTrigger, stayPlans }) => {
  const [selectedDates, setSelectedDates] = useState([]);

  // ✅ 외부 초기화 트리거 감지 시 리셋
  useEffect(() => {
    setSelectedDates([]);
  }, [resetTrigger]);

  useEffect(() => {
    const name = stay?.name;
    if (!open || !name) return;
    setSelectedDates([...(stayPlans?.[name] || [])]);
  }, [open, stay?.name, stayPlans]);

  const toggleDate = (dateStr) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  return (
    <Modal
      open={open}
      key={stay?.id || stay?.name || "stay"}
      centered
      onCancel={() => {
        // 모달 닫기 시 onSelectDates를 호출하여 변경 사항 저장
        setTimeout(() => onSelectDates(stay, [...selectedDates]), 0);
        onClose();
      }}
      footer={null}
      width={600}
      styles={{
        body: {
          background: "#fff",
          borderRadius: 16,
          padding: "40px 30px 30px",
          textAlign: "center",
        },
      }}
    >
      <h2 className="text-lg font-semibold text-[#1E3A8A] mb-1">
        숙박하실 날짜를 선택해주세요.
      </h2>
      <p className="text-gray-500 mb-8">{stay?.name || "선택된 숙소 없음"}</p>

      <div className="grid grid-cols-4 gap-4 justify-center items-center mb-10">
        {days.map((d) => {
          // 마지막 날짜는 숙박 불가 (퇴실일)
          if (d.isSame(days[days.length - 1], 'day') && days.length > 1) return null;
          
          const dateStr = d.format("MM/DD");
          const selected = selectedDates.includes(dateStr);
          return (
            <div
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              className={`relative flex flex-col items-center justify-center border-2 rounded-xl cursor-pointer transition-all duration-200 p-3 ${
                selected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/10" // 현대적 색상 변경
                  : "border-gray-300 hover:border-[#1E3A8A]"
              }`}
            >
              <div
                className={`absolute -top-3 text-xs font-bold px-2 py-1 rounded-full ${
                  selected
                    ? "bg-[#1E3A8A] text-white" // 현대적 색상 변경
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {dateStr}
              </div>
              <div className="w-16 h-16 flex items-center justify-center text-gray-400 text-2xl mt-3">
                {selected ? (
                  <i className="bi bi-check-circle-fill text-[#1E3A8A]"></i> // 현대적 아이콘
                ) : (
                  <i className="bi bi-calendar-plus text-gray-500"></i> // 현대적 아이콘
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selected ? "선택됨" : "숙박 선택"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={() => {
            setTimeout(() => onSelectDates(stay, [...selectedDates]), 0);
            onClose();
          }}
          type="primary"
          className="h-11 px-10 rounded-lg font-semibold text-sm"
          style={{
            background: "#1E3A8A", // 현대적 색상 변경
            border: "none",
          }}
        >
          선택 완료
        </Button>
        <Button
          onClick={() => {
            // 취소 시에도 onSelectDates를 호출하여 현재 상태 저장 (필요 없으면 제거 가능)
            // 현재 로직은 onCancel과 동일하게 동작합니다.
            setTimeout(() => onSelectDates(stay, [...selectedDates]), 0);
            onClose();
          }}
          className="h-11 px-10 rounded-lg font-semibold text-sm"
          style={{
            background: "#4A5568", // Dark gray for secondary action
            color: "#fff",
            border: "none",
          }}
        >
          닫기
        </Button>
      </div>
    </Modal>
  );
};

/*******************
 * 🌍 메인 컴포넌트 시작
 *******************/
export default function TravelPlanner() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [times, setTimes] = useState({});
  const [selectedTravels, setSelectedTravels] = useState([]);
  const [selectedStays, setSelectedStays] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showStayModal, setShowStayModal] = useState(false);
  const [selectedStayTarget, setSelectedStayTarget] = useState(null);
  const [stayPlans, setStayPlans] = useState({});
  const [modalResetTrigger, setModalResetTrigger] = useState(0);

  useEffect(() => {
    if (step === 1) setShowDateModal(true);
    if (step === 2) setShowTitleModal(true);
    // step이 변경되어도 모달을 닫지 않고, step 5 진입 시 수동으로만 열리도록 유지
  }, [step]);
  
  // step이 변경될 때 모달을 닫는 로직 추가
  useEffect(() => {
    if (step !== 1) setShowDateModal(false);
    if (step !== 2) setShowTitleModal(false);
    if (step !== 5) setShowStayModal(false);
  }, [step]);


  const resetAll = () => {
    setTimes({});
    setSelectedTravels([]);
    setSelectedStays([]);
    setTitle("");
    setStayPlans({});
    setModalResetTrigger((prev) => prev + 1); // StaySelectModal 리셋 트리거
    setStep(2);
  };

  const travels = [
    { id: 1, name: "도톤보리", desc: "오사카 중심 거리", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=D", likes: 120, lat: 34.6687, lng: 135.5015 },
    { id: 2, name: "유니버설 스튜디오", desc: "테마파크 명소", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=U", likes: 85, lat: 34.6677, lng: 135.4320 },
    { id: 3, name: "오사카성", desc: "역사적인 명소", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=O", likes: 150, lat: 34.6873, lng: 135.5255 },
    { id: 4, name: "신세카이", desc: "복고풍 상점가", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=S", likes: 90, lat: 34.6525, lng: 135.5063 },
    { id: 5, name: "우메다 공중정원", desc: "전망대", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=W", likes: 180, lat: 34.7058, lng: 135.4925 },
    { id: 6, name: "덴포잔 대관람차", desc: "항구 전망", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=T", likes: 60, lat: 34.6545, lng: 135.4335 },
    { id: 7, name: "나카노시마 공원", desc: "도심 속 휴식 공간", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=N", likes: 45, lat: 34.6938, lng: 135.5037 },
    { id: 8, name: "가이유칸 수족관", desc: "세계 최대급 수족관", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=K", likes: 200, lat: 34.6565, lng: 135.4325 },
    { id: 9, name: "쿠로몬 시장", desc: "오사카의 부엌", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=K", likes: 110, lat: 34.6644, lng: 135.5065 },
    { id: 10, name: "텐노지 동물원", desc: "도심 속 동물원", img: "https://placehold.co/100x100/1E3A8A/ffffff?text=T", likes: 30, lat: 34.6508, lng: 135.5085 },
  ];

  const stays = [
    { id: 11, name: "신사이바시 호텔", desc: "도심 근처 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=S", lat: 34.6738, lng: 135.5011 },
    { id: 12, name: "난바 게스트하우스", desc: "교통 편리한 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=N", lat: 34.6661, lng: 135.5042 },
    { id: 13, name: "우메다 레지던스", desc: "북부 교통 요지 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=U", lat: 34.7042, lng: 135.4930 },
    { id: 14, name: "텐노지 이코노미", desc: "가성비 좋은 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=T", lat: 34.6515, lng: 135.5090 },
    { id: 15, name: "오사카 베이 호텔", desc: "항구 근처 고급 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=B", lat: 34.6580, lng: 135.4330 },
    { id: 16, name: "도톤보리 캡슐", desc: "중심가 저가 숙소", img: "https://placehold.co/100x100/0077B6/ffffff?text=C", lat: 34.6685, lng: 135.5005 },
    { id: 17, name: "교토 리조트", desc: "교토 방면", img: "https://placehold.co/100x100/0077B6/ffffff?text=K", lat: 34.7100, lng: 135.5000 },
  ];

  const days = useMemo(() => {
    if (!dateRange[0]) return [];
    const list = [];
    let cur = dateRange[0].startOf("day");
    // [수정] 마지막 날짜 포함하여 순회
    while (cur.isBefore(dateRange[1].add(1, 'day'))) { 
      list.push(cur);
      cur = cur.add(1, "day");
    }
    return list;
  }, [dateRange]);

  // days.length가 1일 경우 (당일치기)는 0박으로 처리
  const hasNights = days.length > 1; 

  // 지도 마커를 위한 데이터
  const markers = useMemo(() => {
    if (step === 4) return selectedTravels;
    if (step === 5) return selectedStays;
    return [];
  }, [step, selectedTravels, selectedStays]);
  
  // 숙소 날짜 선택 시 호출되는 콜백
  const handleSelectDates = (stay, dates) => {
    if (!stay || !stay.name) return;
    
    // 1. stayPlans 업데이트: 현재 숙소의 선택 날짜를 저장
    setStayPlans((prev) => {
        const newStayPlans = { ...prev };
        
        // 날짜가 하나라도 선택되었다면 저장
        if (dates && dates.length > 0) {
            newStayPlans[stay.name] = Array.from(new Set(dates));
        } else {
            // 선택된 날짜가 없다면 stayPlans에서 해당 숙소 정보 제거
            delete newStayPlans[stay.name];
        }

        return newStayPlans;
    });
    
    // 2. selectedStays 업데이트: 날짜가 하나라도 선택되었다면 목록에 추가
    //    (목록에 없으면 추가, 있으면 유지)
    setSelectedStays((prev) => {
      const isSelected = dates.length > 0;
      const isAlreadyAdded = prev.some((v) => v.id === stay.id);
      
      if (isSelected && !isAlreadyAdded) {
        return [...prev, stay];
      }
      // 선택된 날짜가 없고, 목록에 이미 있다면 제거 (날짜 선택 해제 시)
      if (!isSelected && isAlreadyAdded) {
        return prev.filter(v => v.id !== stay.id);
      }
      
      return prev;
    });
  };
  
  return (
    // 🌟 [수정 1] 레이아웃 전체를 flex-col로 설정하고 배경색을 밝고 깨끗한 색상으로 변경
    <Layout style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column" }}>
      <HeaderLayout />
      
      {/* 🌟 [수정 2] Content 영역을 flex-grow로 설정하여 남은 공간을 모두 채우고, overflow-y를 auto로 설정 */}
      <Content style={{ flexGrow: 1, overflowY: 'auto' }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: step === 3 || step === 4 || step === 5 ? "8% 44% 48%" : "8% 44% 48%",
            height: "100%", 
          }}
        >
          {/* Step Drawer */}
          <StepDrawer
            step={step}
            setStep={setStep}
            onPrev={() => setStep((s) => Math.max(1, s - 1))}
            onNext={() => setStep((s) => Math.min(5, s + 1))}
            selectedTravels={selectedTravels}
            title={title}
          />

          {/* 메인 Drawer */}
          <div className="flex h-full bg-[#FFFFFF] border-l border-[#eee]">
            {/* Step 3: 시간 설정 */}
            {step === 3 && (
              <TimeDrawer
                days={days}
                times={times}
                setTimes={setTimes}
                onPrev={() => setStep(2)}
                title={title}
                dateRange={dateRange}
              />
            )}

            {/* Step 4: 여행지 선택 */}
            {step === 4 && (
              <>
                <div className="w-1/2 bg-[#F9FAFB] p-6 border-r border-gray-100 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
                  
                   {/* ➡️ TitleDateDisplay 컴포넌트로 대체 */}
                 <TitleDateDisplay title={title} dateRange={dateRange} />

                  <h3 className="font-semibold text-[#2F3E46] mb-4 text-lg flex-shrink-0">
                    📍 여행지 선택
                  </h3>
                  <div className="flex-1 overflow-y-auto pb-4 pr-4 ">
                    <List
                      dataSource={travels}
                      renderItem={(item) => (
                        <List.Item
                          onClick={() =>
                            setSelectedTravels((prev) =>
                              prev.some((v) => v.id === item.id)
                                ? prev.filter((v) => v.id !== item.id)
                                : [...prev, item]
                            )
                          }
                          className="cursor-pointer hover:bg-gray-50 transition rounded-lg"
                        >
                          <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                                <div className="flex items-center text-xs text-gray-400 gap-1">
                                  <i className="bi bi-heart-fill text-red-500"></i>
                                  <span>{item.likes}</span>
                                </div>
                              </div>
                            </div>
                            {selectedTravels.some((v) => v.id === item.id) ? (
                              <i className="bi bi-check-circle-fill text-green-600 text-xl"></i>
                            ) : (
                              <i className="bi bi-plus-circle text-gray-400 text-xl"></i>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>

                <div className="w-1/2 bg-[#FFFFFF] p-6 flex flex-col h-[calc(100vh-120px)] overflow-hidden">

                   {/* ✅ 새로운 여행지 일정 요약 섹션 추가 */}
                  <div className="flex justify-between items-center mb-5 flex-shrink-0">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2F3E46]">
                        🧳 선택된 여행지 목록
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        총 {selectedTravels.length}개의 여행지
                      </p>
                      
                    </div>
                    <Button
                      type="link"
                      className="text-red-500 hover:text-red-600 font-semibold"
                      onClick={() => {
                        setSelectedTravels([]);
                      }}
                    >
                      여행지 설정 초기화
                    </Button>
                  </div>

                  <p className="text-gray-500 text-sm mb-6 flex-shrink-0 border-b pb-4 border-gray-100">
                    여행지는 최소 1개 이상 선택해 주세요.
                  </p>
     
                  <div className="flex-1 overflow-y-auto pb-4 pr-4 mt-">
                    <List
                      dataSource={selectedTravels}
                      locale={{ emptyText: <Empty description="선택된 여행지가 없습니다." /> }}
                      renderItem={(item) => (
                        <List.Item>
                          <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg border border-gray-200 hover:bg-red-50 transition">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                              </div>
                            </div>
                            <i
                              className="bi bi-trash-fill text-red-500 text-lg cursor-pointer"
                              onClick={() =>
                                setSelectedTravels((prev) => prev.filter((v) => v.id !== item.id))
                              }
                            ></i>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 5: 숙소 선택 */}
            {step === 5 && (
              <>

                <div className="w-1/2 bg-[#F9FAFB] p-6 border-r border-gray-100 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
                  
                   {/* ➡️ TitleDateDisplay 컴포넌트로 대체 */}
                   <TitleDateDisplay title={title} dateRange={dateRange} />

                  <h3 className="font-semibold text-[#2F3E46] mb-4 text-lg flex-shrink-0">🏨 숙소 선택</h3>

                  <div className="flex-1 overflow-y-auto pb-4 pr-4">
                    <List
                      dataSource={stays}
                      renderItem={(item) => (
                        <List.Item
                          onClick={() => {
                            if (!hasNights) {
                              message.info("1일 여행은 숙소 설정이 필요하지 않습니다.");
                              return;
                            }
                            setSelectedStayTarget(item);
                            setShowStayModal(true);
                            // (숙박일이 1일 이상 선택되었을 때만 추가되도록)
                          }}
                          className={`cursor-pointer hover:bg-gray-50 transition rounded-lg ${!hasNights ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 ">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-sm text-[#2F3E46] mb-0">{item.name}</p>
                                <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                              </div>
                            </div>
                            {/* 현재 숙소에 대해 선택된 날짜가 있는지 확인 */}
                            {Object.keys(stayPlans).includes(item.name) && stayPlans[item.name].length > 0 ? (
                              <i className="bi bi-calendar-check-fill text-blue-600 text-xl"></i>
                            ) : (
                              <i className="bi bi-calendar-plus text-gray-400 text-xl"></i>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>

                <div className="w-1/2 bg-[#FFFFFF] p-6 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
                  {/* ✅ 요약 영역 (고정) */}
                  <div className="flex justify-between items-center mb-5 flex-shrink-0">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2F3E46]">🏨 숙박 일정 요약</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        총 {Math.max(days.length - 1, 0)}박 / {Object.keys(stayPlans).filter(k => stayPlans[k].length > 0).length}개의 숙소
                      </p>
                    </div>
                    <Button
                      type="link"
                      className="text-red-500 hover:text-red-600 font-semibold"
                      onClick={() => {
                        setStayPlans({});
                        setSelectedStays([]);
                        setModalResetTrigger((prev) => prev + 1);
                      }}
                    >
                      숙소 설정 초기화
                    </Button>
                  </div>

                  <p className="text-gray-500 text-sm mb-6 flex-shrink-0 border-b pb-4 border-gray-100">
                    숙소를 설정하지 않아도 위치 기반으로 자동 숙박 일정이 생성됩니다.
                  </p>

                  <div className="flex-1 overflow-y-auto pb-4 pr-4">
                    {selectedStays.length > 0 || hasNights ? (
                      <div className="space-y-6">
                        {days.slice(0, days.length - 1).map((d, idx) => {
                          const nextDay = days[idx + 1];

                          const rangeText = `${d.format("MM.DD(ddd)")} ~ ${nextDay.format("MM.DD(ddd)")}`;
                          
                          // 현재 날짜(d)가 포함된 숙소 찾기
                          const dateStr = d.format("MM/DD");
                          const assignedStayEntry = Object.entries(stayPlans).find(([stayName, dates]) =>
                             dates.includes(dateStr)
                          );
                          
                          const assignedStayName = assignedStayEntry ? assignedStayEntry[0] : null;
                          const stayData = stays.find((s) => s.name === assignedStayName);
                          
                          // [수정] 숙소가 없는 경우 빈 카드로 표시하거나, 건너뛰기
                          // 숙소가 없는 경우: "숙소 미정"으로 표시
                          const displayStay = stayData || { 
                            id: `default-${idx}`, 
                            name: "숙소 미정", 
                            desc: "클릭하여 숙소 선택", 
                            img: "https://placehold.co/100x100?text=?",
                          };


                          return (
                            <div key={d.format("YYYY-MM-DD")} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition">
                              {/* 날짜 헤더 */}
                              <div className="text-sm font-semibold text-[#2F3E46] mb-3">{rangeText}</div>

                              {/* 숙소 카드 */}
                              <div
                                className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 cursor-pointer transition"
                                onClick={() => {
                                  // 숙소 미정인 경우, 모달을 열지 않고, 사용자가 직접 리스트에서 선택하도록 유도
                                  if (displayStay.name === "숙소 미정") {
                                      message.info("좌측 목록에서 숙소를 선택해주세요.");
                                      return;
                                  }
                                  setSelectedStayTarget(stayData);
                                  setShowStayModal(true);
                                }}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-7 h-7 rounded-full bg-blue-100 text-center text-xs font-bold text-blue-700 leading-[28px] flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img src={displayStay.img} alt={displayStay.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col ml-3 min-w-[140px]">
                                    <p className={`text-sm font-semibold ${displayStay.name === "숙소 미정" ? 'text-gray-500 italic' : 'text-[#2F3E46]'}`}>
                                      {displayStay.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {displayStay.desc || "주소 정보 없음"}
                                    </p>
                                  </div>
                                </div>

                                {displayStay.name !== "숙소 미정" && (
                                  <i className="bi bi-pencil-square text-xl text-blue-600"></i>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // 숙소 미선택 시 빈 상태 (1박 이상일 때만 표시)
                      hasNights ? (
                          <Empty
                              description={<span className="text-gray-400">좌측 목록에서 숙소를 선택하여 일정을 설정하세요.</span>}
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                      ) : (
                          <Empty
                              description={<span className="text-gray-400">당일치기 여행은 숙소 설정이 필요하지 않습니다.</span>}
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 지도 */}
          <div className="bg-[#F9FAFB]">
            <TravelMap markers={markers} />
          </div>
        </div>
      </Content>

      {/* 모달 */}
      <DateModal
        open={showDateModal}
        setOpen={setShowDateModal}
        setDateRange={setDateRange}
        resetAll={resetAll}
        fromMain={step === 1 && dateRange.length === 0}
        setStep={setStep}
      />

      <TitleModal
        open={showTitleModal}
        setOpen={setShowTitleModal}
        title={title}
        setTitle={setTitle}
        setStep={setStep}
      />

      {/* ✅ 오류 수정 반영된 공유형 숙소 모달 */}
      <StaySelectModal
        open={hasNights && showStayModal}
        onClose={() => setShowStayModal(false)}
        stay={selectedStayTarget}
        days={days}
        resetTrigger={modalResetTrigger}
        stayPlans={stayPlans}
        onSelectDates={handleSelectDates} // TravelPlanner 내부 함수 사용
      />

      <FooterLayout />
    </Layout>
  );
}