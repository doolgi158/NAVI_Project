import MainLayout from "../layout/MainLayout";
import { DatePicker, Input, Select, Button, TimePicker } from "antd";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FlightPage = () => {
  const [tripType, setTripType] = useState("round"); // round=왕복, one=편도
  const [dates, setDates] = useState({});

  const handleSearch = () => {
    if (tripType === "round" && !dates.range) {
      alert("왕복은 가는 날과 오는 날을 선택해야 합니다.");
      return;
    }
    if (tripType === "one" && !dates.dep && !dates.arr) {
      alert("편도는 출발일이나 도착일 중 하나는 선택해야 합니다.");
      return;
    }
    console.log("검색 조건:", dates);
    alert("항공편 검색 실행!");
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

          {/* 왕복/편도 버튼 */}
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
              <Input
                prefix={<i className="bi bi-geo-alt-fill text-blue-500 mr-2"></i>}
                placeholder="서울/김포"
              />
            </div>

            {/* 도착지 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">도착지</label>
              <Input
                prefix={<i className="bi bi-geo-fill text-blue-500 mr-2"></i>}
                placeholder="제주"
              />
            </div>

            {/* 날짜 선택 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                {tripType === "round" ? "여행 기간" : "출발/도착일"}
              </label>

              {tripType === "round" ? (
                <RangePicker
                  className="w-full"
                  onChange={(val) => setDates({ ...dates, range: val })}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    placeholder="출발일 선택"
                    className="w-full"
                    onChange={(val) => setDates({ ...dates, dep: val })}
                  />
                  <DatePicker
                    placeholder="도착일 선택"
                    className="w-full"
                    onChange={(val) => setDates({ ...dates, arr: val })}
                  />
                </div>
              )}
            </div>

            {/* 탑승객 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">탑승객</label>
              <Input type="number" min={1} defaultValue={1} />
            </div>

            {/* 좌석 등급 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">좌석 등급</label>
              <Select defaultValue="economy" className="w-full">
                <Option value="economy">일반석</Option>
                <Option value="business">비즈니스석</Option>
              </Select>
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex justify-end mt-10">
            <Button type="primary" size="large" className="px-10" onClick={handleSearch}>
              항공편 검색
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightPage;
