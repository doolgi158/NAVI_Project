// FlightPage.jsx
import { DatePicker, Input, Select, Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import MainLayout from "../layout/MainLayout";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FlightPage = () => {
  // ✈️ 상태 관리
  const [tripType, setTripType] = useState("round"); // 왕복 / 편도
  const [dates, setDates] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState("economy");

  const navigate = useNavigate();

  // ✅ 공항 목록
  const airportList = [
    { airportCode: "GMP", airportName: "김포" },
    { airportCode: "CJU", airportName: "제주" },
    { airportCode: "PUS", airportName: "김해(부산)" },
    { airportCode: "TAE", airportName: "대구" },
    { airportCode: "CJJ", airportName: "청주" },
    { airportCode: "KWJ", airportName: "광주" },
    { airportCode: "MWX", airportName: "무안" },
    { airportCode: "RSU", airportName: "여수" },
    { airportCode: "USN", airportName: "울산" },
    { airportCode: "KUV", airportName: "군산" },
    { airportCode: "YNY", airportName: "양양" },
    { airportCode: "HIN", airportName: "사천" },
    { airportCode: "WJU", airportName: "원주" },
    { airportCode: "JDG", airportName: "정석(훈련)" },
  ];

  // 🔍 검색 버튼 클릭 시
  const handleSearch = () => {
    // 1️⃣ 유효성 검사
    if (tripType === "round" && !dates.range) {
      alert("왕복은 가는 날과 오는 날을 선택해야 합니다.");
      return;
    }
    if (tripType === "one" && !dates.dep) {
      alert("편도는 출발일을 선택해야 합니다.");
      return;
    }
    if (!from || !to) {
      alert("출발지와 도착지를 선택해주세요.");
      return;
    }
    if (from === to) {
      alert("출발지와 도착지는 달라야 합니다.");
      return;
    }

    // 2️⃣ 날짜를 문자열(YYYY-MM-DD)로 변환
    let formattedDates = {};
    if (tripType === "round" && dates.range) {
      formattedDates = {
        depDate: dates.range[0]?.format("YYYY-MM-DD"),
        arrDate: dates.range[1]?.format("YYYY-MM-DD"), // ✅ 귀국일 이름 통일
      };
    } else {
      if (dates.dep) formattedDates.depDate = dates.dep.format("YYYY-MM-DD");
    }

    // 3️⃣ 검색 조건을 객체로 묶기
    const searchData = {
      tripType,
      depAirport: from,
      arrAirport: to,
      depDate: formattedDates.depDate,
      arrDate: formattedDates.arrDate || null, // ✅ 추가 (왕복일만 존재)
      passengerCount: passengers,
      seatClass,
    };

    console.log("📤 검색 조건:", searchData);

    // 4️⃣ 다음 페이지로 이동 (state로 검색조건 전달)
    navigate("/flight/detail", { state: searchData });
  };

  return (
    <MainLayout>
      <div className="flex justify-center py-16 bg-[#faf9f6]">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-4xl">
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-blue-800 mb-8 flex items-center">
            <i className="bi bi-airplane-engines-fill mr-2 text-blue-600"></i>
            항공권 예매
          </h2>

          {/* 왕복 / 편도 버튼 */}
          <div className="flex space-x-3 mb-10">
            <Button
              type={tripType === "round" ? "primary" : "default"}
              shape="round"
              onClick={() => setTripType("round")}
            >
              왕복
            </Button>
            <Button
              type={tripType === "one" ? "primary" : "default"}
              shape="round"
              onClick={() => setTripType("one")}
            >
              편도
            </Button>
          </div>

          {/* 입력 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 출발지 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">출발지</label>
              <Select
                value={from || undefined}
                onChange={setFrom}
                placeholder="출발 공항 선택"
                className="w-full"
              >
                {airportList.map((a) => (
                  <Option key={a.airportCode} value={a.airportCode}>
                    {a.airportName}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 도착지 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">도착지</label>
              <Select
                value={to || undefined}
                onChange={setTo}
                placeholder="도착 공항 선택"
                className="w-full"
              >
                {airportList.map((a) => (
                  <Option key={a.airportCode} value={a.airportCode}>
                    {a.airportName}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 날짜 선택 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                {tripType === "round" ? "여행 기간" : "출발일"}
              </label>

              {tripType === "round" ? (
                <RangePicker
                  className="w-full"
                  onChange={(val) => setDates({ range: val })}
                />
              ) : (
                <DatePicker
                  placeholder="출발일 선택"
                  className="w-full"
                  onChange={(val) => setDates({ dep: val })}
                />
              )}
            </div>

            {/* 탑승객 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">탑승객</label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
            </div>

            {/* 좌석 등급 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">좌석 등급</label>
              <Select
                value={seatClass}
                onChange={setSeatClass}
                className="w-full"
              >
                <Option value="economy">일반석</Option>
                <Option value="business">비즈니스석</Option>
              </Select>
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex justify-end mt-10">
            <Button
              type="primary"
              size="large"
              className="px-10"
              onClick={handleSearch}
            >
              항공편 검색
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightPage;
