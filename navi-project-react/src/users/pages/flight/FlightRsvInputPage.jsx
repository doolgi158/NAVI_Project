import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";

const FlightRsvInputPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const selectedOutbound = state?.selectedOutbound;
  const selectedInbound = state?.selectedInbound;
  const passengerCount = state?.passengerCount || 1;

  const [passengers, setPassengers] = useState([]);

  // 탑승객 수만큼 폼 초기화
  useEffect(() => {
    setPassengers(
      Array.from({ length: passengerCount }, () => ({
        name: "",
        phone: "",
        email: "",
      }))
    );
  }, [passengerCount]);

  // 날짜 포맷 함수
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const dayOfWeek = dayNames[date.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek}) ${hours}:${minutes}`;
  };

  // 입력 변경 처리
  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // 좌석 선택으로 이동
  const handleSeatSelection = () => {
    const incomplete = passengers.some((p) => !p.name || !p.phone || !p.email);
    if (incomplete) {
      alert("모든 탑승객 정보를 입력해주세요.");
      return;
    }

    navigate(`/flight/seat`, {
      state: {
        isRoundTrip: !!selectedInbound,
        step: "outbound", // 출발편부터
        selectedOutbound,
        selectedInbound,
        passengerCount,
        passengers,
      },
    });
  };

  // 자동 배정
  const handleAutoAssign = () => {
    const incomplete = passengers.some((p) => !p.name || !p.phone || !p.email);
    if (incomplete) {
      alert("모든 탑승객 정보를 입력해주세요.");
      return;
    }

    alert("좌석을 선택하지 않은 경우 자동 배정됩니다.");
    navigate(`/flight/payment`, {
      state: {
        selectedOutbound,
        selectedInbound,
        passengerCount,
        passengers,
        autoAssign: true,
      },
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white mt-10 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          항공편 예약 정보 입력
        </h2>

        {/* 출발편 */}
        {selectedOutbound && (
          <div className="mb-6 border border-blue-300 p-6 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-700 mb-2">출발편</h3>
            <p className="font-medium">
              {selectedOutbound.airlineNm} {selectedOutbound.flightNo}
            </p>
            <p className="text-gray-600">
              {selectedOutbound.depAirportName} → {selectedOutbound.arrAirportName}
            </p>
            <p className="text-gray-500">
              {formatDateTime(selectedOutbound.depTime)} 출발 ·{" "}
              {formatDateTime(selectedOutbound.arrTime)} 도착
            </p>
            <p className="text-blue-700 font-semibold mt-1">
              ₩{Number(selectedOutbound.price || 0).toLocaleString()}
            </p>
          </div>
        )}

        {/* 복귀편 (왕복 시만) */}
        {selectedInbound && (
          <div className="mb-6 border border-green-300 p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-700 mb-2">복귀편</h3>
            <p className="font-medium">
              {selectedInbound.airlineNm} {selectedInbound.flightNo}
            </p>
            <p className="text-gray-600">
              {selectedInbound.depAirportName} → {selectedInbound.arrAirportName}
            </p>
            <p className="text-gray-500">
              {formatDateTime(selectedInbound.depTime)} 출발 ·{" "}
              {formatDateTime(selectedInbound.arrTime)} 도착
            </p>
            <p className="text-green-700 font-semibold mt-1">
              ₩{Number(selectedInbound.price || 0).toLocaleString()}
            </p>
          </div>
        )}

        {/* 탑승객 정보 입력 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-700 mb-4">탑승객 정보 입력</h3>

          <form className="space-y-6">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="p-4 border rounded-lg bg-gray-50 relative shadow-sm"
              >
                <h4 className="font-semibold mb-3 text-gray-700">
                  탑승객 {i + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleChange(i, "name", e.target.value)}
                    placeholder="이름"
                    className="border p-2 rounded focus:outline-blue-400"
                    required
                  />
                  <input
                    type="text"
                    value={p.phone}
                    onChange={(e) => handleChange(i, "phone", e.target.value)}
                    placeholder="전화번호"
                    className="border p-2 rounded focus:outline-blue-400"
                    required
                  />
                  <input
                    type="email"
                    value={p.email}
                    onChange={(e) => handleChange(i, "email", e.target.value)}
                    placeholder="이메일"
                    className="border p-2 rounded focus:outline-blue-400"
                    required
                  />
                </div>
              </div>
            ))}

            {/* 버튼 영역 */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleAutoAssign}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                좌석 자동배정
              </button>

              <button
                type="button"
                onClick={handleSeatSelection}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                좌석 선택하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightRsvInputPage;
