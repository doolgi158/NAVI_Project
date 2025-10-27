import { useState, useMemo } from "react";
import { Button, Select, DatePicker, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

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
];

const fieldClassNames =
  "w-full h-[50px] rounded-xl shadow-lg border-none hover:shadow-xl transition-shadow duration-300";
const labelClassNames = "block text-sm font-semibold mb-2 text-gray-700";

const FlightPage = () => {
  const [tripType, setTripType] = useState("round");
  const [depDate, setDepDate] = useState(null);
  const [arrDate, setArrDate] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState("economy");
  const navigate = useNavigate();

  const handleFromChange = (value) => {
    setFrom(value);
    if (value !== "CJU") setTo("CJU");
    else setTo("");
  };

  const disablePastOrFutureDates = (current) => {
    const today = dayjs().startOf("day");
    const lastAvailable = dayjs().add(30, "day").endOf("day");
    return current < today || current > lastAvailable;
  };

  const handleSearch = () => {
    if (!from || !to) {
      message.warning("출발지와 도착지를 선택해주세요.");
      return;
    }
    if (from === to) {
      message.warning("출발지와 도착지는 달라야 합니다.");
      return;
    }
    if (!depDate) {
      message.warning("출발일을 선택해야 합니다.");
      return;
    }
    if (tripType === "round" && !arrDate) {
      message.warning("왕복은 돌아오는 날을 선택해야 합니다.");
      return;
    }

    navigate("/flight/detail", {
      state: {
        tripType,
        depAirport: from,
        arrAirport: to,
        depDate: depDate.format("YYYY-MM-DD"),
        arrDate: tripType === "round" ? arrDate.format("YYYY-MM-DD") : null,
        passengerCount: passengers,
        seatClass,
      },
    });
  };

  const filteredArrivalList = useMemo(
    () =>
      from === "CJU"
        ? airportList.filter((a) => a.airportCode !== "CJU")
        : airportList.filter((a) => a.airportCode === "CJU"),
    [from]
  );

  const FieldWrapper = ({ label, children, spanClass }) => (
    <div className={`flex flex-col ${spanClass}`}>
      <Text className={labelClassNames}>{label}</Text>
      {children}
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-10">
        {/* 왕복 / 편도 선택 탭 */}
        <div className="w-full max-w-6xl flex justify-start -mb-px z-10">
          <button
            className={`px-6 py-3 text-lg font-bold transition-all duration-200 rounded-t-xl
              ${tripType === "round"
                ? "bg-white text-blue-600 shadow-t-lg"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            onClick={() => {
              setTripType("round");
              setArrDate(null);
            }}
          >
            왕복
          </button>
          <button
            className={`px-6 py-3 text-lg font-bold transition-all duration-200 rounded-t-xl -ml-px
              ${tripType === "one"
                ? "bg-white text-blue-600 shadow-t-lg"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            onClick={() => {
              setTripType("one");
              setArrDate(null);
            }}
          >
            편도
          </button>
        </div>

        {/* 메인 검색 카드 */}
        <div className="w-full max-w-6xl bg-white p-6 lg:p-10 rounded-b-xl rounded-tr-xl shadow-2xl z-0">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
            <span className="text-blue-600 mr-2">국내선</span> 항공권 예매
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* 왼쪽 입력 그룹 */}
            <div className="lg:w-11/12 flex-shrink space-y-6">
              {/* 첫 번째 행 */}
              <div className="flex flex-wrap lg:flex-row gap-5 lg:gap-6">
                <FieldWrapper label="출발지" spanClass="w-full lg:w-[calc(25%-18px)]">
                  <Select
                    placeholder="공항 선택"
                    value={from || undefined}
                    onChange={handleFromChange}
                    className={fieldClassNames}
                  >
                    {airportList.map((a) => (
                      <Option key={a.airportCode} value={a.airportCode}>
                        {a.airportName} ({a.airportCode})
                      </Option>
                    ))}
                  </Select>
                </FieldWrapper>

                <FieldWrapper label="도착지" spanClass="w-full lg:w-[calc(25%-18px)]">
                  <Select
                    placeholder={from === "CJU" ? "도착 공항 선택" : "제주(CJU)"}
                    value={to || undefined}
                    onChange={setTo}
                    className={fieldClassNames}
                    disabled={!from || from !== "CJU"}
                  >
                    {filteredArrivalList.map((a) => (
                      <Option key={a.airportCode} value={a.airportCode}>
                        {a.airportName} ({a.airportCode})
                      </Option>
                    ))}
                  </Select>
                </FieldWrapper>

                <FieldWrapper label="탑승객" spanClass="w-full lg:w-[calc(25%-18px)]">
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-300 h-[50px] px-3">
                    <Button
                      type="text"
                      onClick={() => setPassengers((prev) => Math.max(1, prev - 1))}
                      disabled={passengers <= 1}
                      style={{
                        fontSize: "18px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      -
                    </Button>

                    <span className="text-lg font-semibold">{passengers}</span>

                    <Button
                      type="text"
                      onClick={() => setPassengers((prev) => Math.min(9, prev + 1))}
                      disabled={passengers >= 9}
                      style={{
                        fontSize: "18px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      +
                    </Button>
                  </div>
                </FieldWrapper>

                <FieldWrapper label="좌석 등급" spanClass="w-full lg:w-[calc(25%-18px)]">
                  <Select value={seatClass} onChange={setSeatClass} className={fieldClassNames}>
                    <Option value="economy">일반석</Option>
                    <Option value="business">비즈니스</Option>
                  </Select>
                </FieldWrapper>
              </div>

              {/* 두 번째 행 (출발일 / 도착일) */}
              <div className="flex flex-wrap lg:flex-row gap-5 lg:gap-6">
                {tripType === "round" ? (
                  <FieldWrapper label="여행 일정" spanClass="w-full">
                    <RangePicker
                      value={depDate && arrDate ? [depDate, arrDate] : []}
                      onChange={(dates) => {
                        if (dates) {
                          setDepDate(dates[0]);
                          setArrDate(dates[1]);
                        } else {
                          setDepDate(null);
                          setArrDate(null);
                        }
                      }}
                      disabledDate={disablePastOrFutureDates}
                      placeholder={["출발일 선택", "도착일 선택"]}
                      className={fieldClassNames}
                      popupStyle={{ zIndex: 1050 }}
                    />
                  </FieldWrapper>
                ) : (
                  <FieldWrapper label="출발일" spanClass="w-full">
                    <DatePicker
                      value={depDate}
                      onChange={setDepDate}
                      disabledDate={disablePastOrFutureDates}
                      placeholder="출발일 선택"
                      className={fieldClassNames}
                      popupStyle={{ zIndex: 1050 }}
                    />
                  </FieldWrapper>
                )}
              </div>
            </div>

            {/* 오른쪽 검색 버튼 */}
            <div className="lg:w-1/12 flex-shrink-0 flex items-end">
              <Button
                type="primary"
                block
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 h-full rounded-xl text-lg font-bold shadow-2xl transition-all duration-300"
                style={{ height: "100%", minHeight: "50px" }}
              >
                <span className="lg:hidden">검색</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightPage;
