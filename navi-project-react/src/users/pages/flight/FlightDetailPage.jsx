import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";

const API_SERVER_HOST = "http://localhost:8080";

const FlightDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 상태 관리
  const [flights, setFlights] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("outbound");
  const [inboundLoaded, setInboundLoaded] = useState(false);
  const [noInbound, setNoInbound] = useState(false);

  // 전달받은 검색 조건
  const { depAirport, arrAirport, depDate, arrDate, seatClass } = state || {};

  // 항공편 조회
  useEffect(() => {
    if (!depAirport || !arrAirport || !depDate) return;

    const body =
      step === "outbound"
        ? {
            depAirportCode: depAirport,
            arrAirportCode: arrAirport,
            depDate,
            seatClass: (seatClass || "ECONOMY").toUpperCase(),
          }
        : {
            depAirportCode: arrAirport,
            arrAirportCode: depAirport,
            depDate: arrDate,
            seatClass: (seatClass || "ECONOMY").toUpperCase(),
          };

    setLoading(true);
    setInboundLoaded(false);

    axios
      .post(`${API_SERVER_HOST}/api/flight/detail`, body)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        setFlights(data);
        setLoading(false);

        if (step === "inbound") {
          setInboundLoaded(true);

          if (data.length === 0) {
            setNoInbound(true);

            setTimeout(() => {
              alert("해당 날짜에는 귀국편이 없습니다. 출발편으로 돌아갑니다.");
              setStep("outbound");
              setNoInbound(false);
              setSelectedInbound(null);
            }, 2000);
          }
        }
      })
      .catch(() => setLoading(false));
  }, [step, depAirport, arrAirport, depDate, arrDate, seatClass]);

  // 항공편 선택
  const handleSelectFlight = (flight) => {
    if (step === "outbound") setSelectedOutbound(flight);
    else setSelectedInbound(flight);
  };

  // 다음 단계 이동
  const handleNextStep = () => {
    if (step === "outbound") {
      if (!selectedOutbound) {
        alert("출발편을 먼저 선택해주세요.");
        return;
      }

      if (arrDate) {
        // 왕복인 경우
        setStep("inbound");
      } else {
        // 편도인 경우 바로 예약 페이지로 이동
        navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
          state: { selectedOutbound },
        });
      }
    } else if (step === "inbound") {
      if (loading) {
        alert("귀국편 정보를 불러오는 중입니다. 잠시만 기다려주세요.");
        return;
      }

      if (!inboundLoaded) {
        alert("귀국편 정보가 아직 로딩 중입니다.");
        return;
      }

      if (flights.length === 0) {
        alert("선택 가능한 귀국편이 없습니다.");
        return;
      }

      if (!selectedInbound) {
        alert("귀국편을 선택해주세요.");
        return;
      }

      navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
        state: { selectedOutbound, selectedInbound },
      });
    }
  };

  // 버튼 활성화 조건
  const isButtonDisabled =
    (step === "outbound" && !selectedOutbound) ||
    (step === "inbound" &&
      (loading || !inboundLoaded || noInbound || flights.length === 0));

  // 렌더링
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          {step === "outbound" ? "출발편 선택" : "귀국편 선택"}
        </h2>

        {loading && <p>데이터를 불러오는 중...</p>}
        {!loading && flights.length === 0 && !noInbound && (
          <p className="text-gray-500 text-center">항공편이 없습니다.</p>
        )}

        {!loading && flights.length > 0 && (
          <div className="grid gap-4 mb-6">
            {flights.map((f) => (
              <div
                key={`${f.flightNo}-${f.depTime}`}
                onClick={() => handleSelectFlight(f)}
                className={`border p-6 rounded-xl shadow cursor-pointer transition ${
                  (step === "outbound"
                    ? selectedOutbound?.flightNo === f.flightNo
                    : selectedInbound?.flightNo === f.flightNo)
                    ? "bg-blue-100 border-blue-400"
                    : "bg-[#fafbff] hover:bg-white border-gray-100"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-lg">
                      {f.airlineNm} {f.flightNo}
                    </p>
                    <p className="text-gray-500">
                      {f.depAirportName} → {f.arrAirportName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {f.depTime} 출발 · {f.arrTime} 도착
                    </p>
                    <p className="font-semibold text-blue-700">
                      ₩{Number(f.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 다음 단계 버튼 수정 완료 */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleNextStep}
            disabled={isButtonDisabled}
            className={`px-6 py-2 rounded-lg transition ${
              isButtonDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {step === "outbound"
              ? arrDate
                ? "귀국편 선택하기"
                : "예약 진행하기"
              : "예약 진행하기"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightDetailPage;
