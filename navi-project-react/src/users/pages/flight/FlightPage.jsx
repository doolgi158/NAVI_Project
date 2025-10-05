import { DatePicker, Input, Select, Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import MainLayout from "../../layout/MainLayout";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FlightPage = () => {
  const [tripType, setTripType] = useState("round");
  const [dates, setDates] = useState({});
  const [depAirport, setDepAirport] = useState("");
  const [arrAirport, setArrAirport] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [seatClass, setSeatClass] = useState("ECONOMY");
  const navigate = useNavigate();

  const airportList = [
    { airportCode: "GMP", airportName: "김포" },
    { airportCode: "CJU", airportName: "제주" },
    { airportCode: "PUS", airportName: "김해(부산)" },
    { airportCode: "TAE", airportName: "대구" },
    { airportCode: "CJJ", airportName: "청주" },
    { airportCode: "KWJ", airportName: "광주" },
  ];

  const handleSearch = () => {
    if (!depAirport || !arrAirport) {
      alert("출발지와 도착지를 모두 선택해주세요.");
      return;
    }
    if (depAirport === arrAirport) {
      alert("출발지와 도착지는 달라야 합니다.");
      return;
    }
    if (tripType === "round" && !dates.range) {
      alert("왕복은 출발일과 복귀일을 선택해주세요.");
      return;
    }
    if (tripType === "one" && !dates.dep) {
      alert("편도는 출발일을 선택해주세요.");
      return;
    }

    const searchData = {
      tripType,
      depAirport,
      arrAirport,
      seatClass,
      passengerCount,
      dates,
    };

    navigate("/flight/detail", { state: searchData });
  };

  return (
    <MainLayout>
      <div className="flex justify-center py-16 bg-[#faf9f6]">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-blue-800 mb-8 flex items-center">
            <i className="bi bi-airplane-engines-fill mr-2 text-blue-600"></i>
            항공권 예매
          </h2>

          {/* 왕복 / 편도 선택 */}
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
            <div>
              <label className="block text-sm text-gray-600 mb-2">출발지</label>
              <Select value={depAirport} onChange={setDepAirport} className="w-full">
                {airportList.map((a) => (
                  <Option key={a.airportCode} value={a.airportCode}>
                    {a.airportName}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">도착지</label>
              <Select value={arrAirport} onChange={setArrAirport} className="w-full">
                {airportList.map((a) => (
                  <Option key={a.airportCode} value={a.airportCode}>
                    {a.airportName}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">여행 날짜</label>
              {tripType === "round" ? (
                <RangePicker onChange={(val) => setDates({ range: val })} className="w-full" />
              ) : (
                <DatePicker onChange={(val) => setDates({ dep: val })} className="w-full" />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">탑승객</label>
              <Input
                type="number"
                min={1}
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">좌석 등급</label>
              <Select value={seatClass} onChange={setSeatClass} className="w-full">
                <Option value="ECONOMY">일반석</Option>
                <Option value="PRESTIGE">비즈니스석</Option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-10">
            <Button type="primary" size="large" onClick={handleSearch}>
              항공편 검색
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightPage;
