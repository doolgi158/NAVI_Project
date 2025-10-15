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
        markers.forEach((m) => {
          new window.kakao.maps.Marker({
            map,
            position: new window.kakao.maps.LatLng(m.lat, m.lng),
          });
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
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    />
  );
};

/*******************
 * 📅 Step1: 날짜선택 모달
 *******************/
const DateModal = ({ open, setOpen, setDateRange, resetAll, fromMain = false,setStep }) => {
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
          background: "#fff",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
        },
      }}
    >
      <h2 className="text-[#2F3E46] text-2xl font-bold mb-8">
        📅 여행 날짜를 선택하세요
      </h2>
      <DatePicker.RangePicker
        locale={dayjs.locale("ko")}
        value={range}
        onChange={(v) => setRange(v)}
        disabledDate={disabledDate}
        style={{
          width: "80%",
          height: 50,
          fontSize: 18,
          borderRadius: 10,
        }}
      />
      <div className="mt-8 flex justify-center gap-6">
        <Button
          size="large"
          onClick={() => {
            if (fromMain) navigate("/plans");
            else setOpen(false);
          }}
          style={{
            borderRadius: 10,
            background: "#F3F3F3",
            color: "#2F3E46",
            border: "none",
          }}
        >
          닫기
        </Button>
        <Button
          type="primary"
          size="large"
          style={{
            background: "#2F3E46",
            border: "none",
            borderRadius: 10,
            padding: "0 30px",
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
 * ⏰ Step2: 시간 설정 (단일 Drawer, 폭 제한)
 *******************/
const TimeDrawer = ({ days, times, setTimes, onPrev }) => {
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
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    return {
      disabledHours: () => Array.from({ length: startHour }, (_, i) => i),
      disabledMinutes: (selectedHour) =>
        selectedHour === startHour
          ? Array.from({ length: startMinute }, (_, i) => i)
          : [],
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] shadow-sm p-4 rounded-xl" style={{ width: "50%" }}>
      <h2 className="text-[#2F3E46] font-semibold text-lg mb-5">
        ⏰ 일자별 시간 설정
      </h2>

      <div className="flex-1 overflow-y-auto">
        {days.length === 0 ? (
          <Empty description="여행 날짜를 먼저 선택해주세요" />
        ) : (
          <List
            dataSource={days}
            renderItem={(d) => (
              <List.Item key={d.format("YYYY-MM-DD")}>
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

      <div className="flex justify-end mt-6">
      </div>
    </div>
  );
};

/*******************
 * 🧭 Step Drawer (이전/다음/완료 버튼 복원)
 *******************/
const StepDrawer = ({ step, setStep, onPrev, onNext, selectedTravels }) => {
  const steps = ["날짜 선택", "시간 설정", "여행지 선택", "숙소 선택"];

  const handleComplete = () => {
    if (selectedTravels.length === 0) {
      Modal.warning({
        title: "여행지를 선택하세요",
        content: "최소 1개 이상의 여행지를 선택해야 합니다.",
        centered: true,
      });
      return;
    }
    Modal.success({
      title: "🎉 여행 계획이 완료되었습니다!",
      content: "여행 정보가 정상적으로 저장되었습니다.",
      centered: true,
    });
  };

  return (
    <div className="flex flex-col justify-between bg-[#FFFFFF] rounded-l-xl shadow-md p-5">
      <div>
        <h3 className="text-[#2F3E46] font-bold mb-4">진행 단계</h3>
        <ul className="space-y-2">
          {steps.map((label, i) => (
            <li
              key={i}
              onClick={() => setStep(i + 1)}
              className={`cursor-pointer px-3 py-2 rounded-md ${
                step === i + 1
                  ? "bg-[#FFF5B7] text-[#2F3E46] font-semibold text-sm"
                  : "hover:bg-[#FAF9F6] text-gray-700"
              }`}
            >
              Step {i + 1}
              <br />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 버튼 */}
      <div className="space-y-2">
        {step > 1 && (
          <Button className="w-full" onClick={onPrev}>
            이전
          </Button>
        )}
        {step < 4 && (
          <Button
            type="primary"
            className="w-full"
            style={{ background: "#2F3E46", border: "none" }}
            onClick={onNext}
          >
            다음
          </Button>
        )}
        {step === 4 && (
          <Button
            type="primary"
            className="w-full"
            style={{ background: "#2F3E46", border: "none" }}
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
 * 🌍 메인 컴포넌트
 *******************/
export default function TravelPlanner() {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState([]);
  const [times, setTimes] = useState({});
  const [selectedTravels, setSelectedTravels] = useState([]);
  const [selectedStays, setSelectedStays] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    if (step === 1) setShowDateModal(true);
  }, [step]);

  const resetAll = () => {
    setTimes({});
    setSelectedTravels([]);
    setSelectedStays([]);
    setStep(2);
  };

  const travels = [
    { id: 1, name: "도톤보리", desc: "오사카 중심 거리", img: "https://placehold.co/100x100", likes: 120 },
    { id: 2, name: "유니버설 스튜디오", desc: "테마파크 명소", img: "https://placehold.co/100x100", likes: 85 },
  ];
  const stays = [
    { id: 11, name: "신사이바시 호텔", desc: "도심 근처 숙소", img: "https://placehold.co/100x100" },
    { id: 12, name: "난바 게스트하우스", desc: "교통 편리한 숙소", img: "https://placehold.co/100x100" },
  ];

  const toggleSelect = (item, selectedList, setList) => {
    setList((prev) =>
      prev.some((v) => v.id === item.id)
        ? prev.filter((v) => v.id !== item.id)
        : [...prev, item]
    );
  };

  const days = useMemo(() => {
    if (!dateRange[0]) return [];
    const list = [];
    let cur = dateRange[0].startOf("day");
    while (cur.isBefore(dateRange[1]) || cur.isSame(dateRange[1]))
      list.push(cur), (cur = cur.add(1, "day"));
    return list;
  }, [dateRange]);

  const markers =
    step === 3 ? selectedTravels : step === 4 ? selectedStays : [];

  return (
    <Layout style={{ minHeight: "100vh", background: "#FAF9F6" }}>
      <HeaderLayout />
      <Content>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              step === 2 ? "12% 50% 38%" : "12% 48% 40%",
            height: "calc(100vh - 130px)",
          }}
        >
          <StepDrawer
            step={step}
            setStep={setStep}
            onPrev={() => setStep((s) => s - 1)}
            onNext={() => setStep((s) => s + 1)}
            selectedTravels={selectedTravels}
          />

          {/* 메인 Drawer */}
          <div className=" flex h-full bg-[#FDFCF9] border-l border-[#eee]">
            {step === 2 && (
              <TimeDrawer
                days={days}
                times={times}
                setTimes={setTimes}
                onPrev={() => {
                  setStep(1);
                  setShowDateModal(true);
                }}
              />
            )}

            {step === 3 && (
              <>
                {/* 여행지 리스트 */}
                <div className="w-1/2 bg-[#FDFCF9] p-5 border-r border-gray-200">
                  <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg">
                    📍 여행지 선택
                  </h3>
                  <List
                    dataSource={travels}
                    renderItem={(item) => (
                      <List.Item
                        onClick={() =>
                          toggleSelect(item, selectedTravels, setSelectedTravels)
                        }
                        className="cursor-pointer"
                      >
                        <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mb-1">
                                {item.desc}
                              </p>
                              <div className="flex items-center text-xs text-gray-400 gap-1">
                                <i className="bi bi-heart-fill text-red-500"></i>
                                <span>{item.likes}</span>
                              </div>
                            </div>
                          </div>
                          {selectedTravels.some((v) => v.id === item.id) ? (
                            <i className="bi bi-dash-square-fill text-red-500 text-xl"></i>
                          ) : (
                            <i className="bi bi-plus-square-fill text-blue-500 text-xl"></i>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </div>

                {/* 선택된 여행지 */}
                <div className="w-1/2 bg-[#FFFFFF] p-5">
                  <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg">
                    🧳 선택된 여행지
                  </h3>
                  <List
                    dataSource={selectedTravels}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="flex justify-between items-center w-full bg-white px-4 py-3 rounded-lg shadow-sm">
                          <p>{item.name}</p>
                          <Button
                            danger
                            type="link"
                            onClick={() =>
                              setSelectedTravels((prev) =>
                                prev.filter((v) => v.id !== item.id)
                              )
                            }
                          >
                            삭제
                          </Button>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                {/* 숙소 리스트 */}
                <div className="w-1/2 bg-[#FDFCF9] p-5 border-r border-gray-200">
                  <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg">
                    🏨 숙소 선택
                  </h3>
                  <List
                    dataSource={stays}
                    renderItem={(item) => (
                      <List.Item
                        onClick={() =>
                          toggleSelect(item, selectedStays, setSelectedStays)
                        }
                        className="cursor-pointer"
                      >
                        <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 ">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mb-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          {selectedStays.some((v) => v.id === item.id) ? (
                            <i className="bi bi-dash-square-fill text-red-500 text-xl"></i>
                          ) : (
                            <i className="bi bi-plus-square-fill text-blue-500 text-xl"></i>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </div>

                {/* 선택된 숙소 */}
                <div className="w-1/2 bg-[#FFFFFF] p-5">
                  <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg">
                    🛏️ 선택된 숙소
                  </h3>
                  <List
                    dataSource={selectedStays}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="flex justify-between items-center w-full bg-white px-4 py-3 rounded-lg shadow-sm">
                          <p>{item.name}</p>
                          <Button
                            danger
                            type="link"
                            onClick={() =>
                              setSelectedStays((prev) =>
                                prev.filter((v) => v.id !== item.id)
                              )
                            }
                          >
                            삭제
                          </Button>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}
          </div>

          {/* 지도 */}
          <div className="p-4 bg-[#FAF9F6]">
            <TravelMap markers={markers} />
          </div>
        </div>
      </Content>

      <DateModal
        open={showDateModal}
        setOpen={setShowDateModal}
        setDateRange={setDateRange}
        resetAll={resetAll}
        fromMain={step === 1 && dateRange.length === 0}
      />
      <FooterLayout />
    </Layout>
  );
}
