import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import { PlaneTakeoff, PlaneLanding } from "lucide-react";

const API_SERVER_HOST = "http://localhost:8080";

const FlightDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("outbound");
  const [inboundLoaded, setInboundLoaded] = useState(false);
  const [noInbound, setNoInbound] = useState(false);
  const [sortOption, setSortOption] = useState("time");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { depAirport, arrAirport, depDate, arrDate, seatClass, passengerCount } = state || {};

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayName = dayNames[date.getDay()];
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}월 ${day}일 (${dayName}) ${hours}:${minutes}`;
  };

  const formatPrice = (price) => `${Number(price || 0).toLocaleString("ko-KR")}원`;

  const getDuration = (dep, arr) => {
    if (!dep || !arr) return "";
    const depTime = new Date(dep);
    const arrTime = new Date(arr);
    const diffMin = Math.floor((arrTime - depTime) / 60000);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours === 0) return `${mins}분`;
    return `${hours}시간 ${mins}분`;
  };

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
        setCurrentPage(1);
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

  const handleSelectFlight = (flight) => {
    if (step === "outbound") setSelectedOutbound(flight);
    else setSelectedInbound(flight);
  };

  const handleNextStep = () => {
    if (step === "outbound") {
      if (!selectedOutbound) {
        alert("출발편을 먼저 선택해주세요.");
        return;
      }

      // 편도 → 예약정보 페이지
      if (!arrDate) {
        navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
          state: {
            selectedOutbound,
            passengerCount: passengerCount || 1,
          },
        });
      }
      // 왕복 → 귀국편 단계로 이동
      else {
        setStep("inbound");
      }
    } else if (step === "inbound") {
      if (loading || !inboundLoaded || flights.length === 0 || !selectedInbound) return;
      navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
        state: {
          selectedOutbound,
          selectedInbound,
          passengerCount: passengerCount || 1,
        },
      });
    }
  };

  const isButtonDisabled =
    (step === "outbound" && !selectedOutbound) ||
    (step === "inbound" && (loading || !inboundLoaded || noInbound || flights.length === 0));

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortOption === "priceAsc") return a.price - b.price;
    if (sortOption === "priceDesc") return b.price - a.price;
    return new Date(a.depTime) - new Date(b.depTime);
  });

  const totalPages = Math.ceil(sortedFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlights = sortedFlights.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(currentPage - Math.floor(maxButtons / 2), 1);
    let end = Math.min(start + maxButtons - 1, totalPages);
    if (end - start < maxButtons - 1) start = Math.max(end - maxButtons + 1, 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-800">
            {step === "outbound" ? "출발편 선택" : "복귀편 선택"}
          </h2>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="time">출발 시간순</option>
            <option value="priceAsc">가격 낮은순</option>
            <option value="priceDesc">가격 높은순</option>
          </select>
        </div>

        {loading && <p>데이터를 불러오는 중...</p>}
        {!loading && paginatedFlights.length === 0 && !noInbound && (
          <p className="text-gray-500 text-center">항공편이 없습니다.</p>
        )}

        {!loading && paginatedFlights.length > 0 && (
          <>
            <div className="grid gap-4 mb-6">
              {paginatedFlights.map((f) => (
                <div
                  key={`${f.flightNo}-${f.depTime}`}
                  onClick={() => handleSelectFlight(f)}
                  className={`border p-6 rounded-xl shadow cursor-pointer transition duration-150 ${
                    (step === "outbound"
                      ? selectedOutbound?.flightNo === f.flightNo
                      : selectedInbound?.flightNo === f.flightNo)
                      ? "bg-blue-100 border-blue-400"
                      : "bg-[#fafbff] hover:bg-white border-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg text-gray-800">{f.airlineNm}</p>
                        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-md border border-blue-200">
                          {f.flightNo}
                        </span>
                      </div>
                      <p className="text-gray-500">
                        {f.depAirportName} → {f.arrAirportName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        총 비행시간 {getDuration(f.depTime, f.arrTime)}
                      </p>
                    </div>

                    <div className="text-right text-gray-600">
                      <p className="text-sm flex items-center justify-end gap-1">
                        <PlaneTakeoff size={14} /> 출발: {formatDateTime(f.depTime)}
                      </p>
                      <p className="text-sm flex items-center justify-end gap-1 mb-1">
                        <PlaneLanding size={14} /> 도착: {formatDateTime(f.arrTime)}
                      </p>
                      <p className="font-semibold text-blue-700 text-lg">
                        {formatPrice(f.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
              >
                처음
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
              >
                이전
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
              >
                다음
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
              >
                마지막
              </button>
            </div>
          </>
        )}

        {/* 다음 단계 버튼 */}
        <div className="flex justify-end mt-6">
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
