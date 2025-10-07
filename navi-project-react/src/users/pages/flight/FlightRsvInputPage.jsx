// FlightRsvInputPage.jsx
import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import MainLayout from "../layout/MainLayout";

const FlightRsvInputPage = () => {
  const { state } = useLocation();
  const { flightNo } = useParams();

  const selectedOutbound = state?.selectedOutbound;
  const selectedInbound = state?.selectedInbound;
  const passengerCount = state?.passengerCount || 1;

  // ✅ 탑승객 정보 상태
  const [passengers, setPassengers] = useState([
    { name: "", phone: "", email: "" },
  ]);

  // ✅ 날짜 포맷 함수
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

  // ✅ 탑승객 추가
  const handleAddPassenger = () => {
    setPassengers([...passengers, { name: "", phone: "", email: "" }]);
  };

  // ✅ 탑승객 삭제
  const handleRemovePassenger = (index) => {
    const updated = passengers.filter((_, i) => i !== index);
    setPassengers(updated);
  };

  // ✅ 입력 변경 처리
  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // ✅ 예약 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🧾 예약 데이터:", {
      selectedOutbound,
      selectedInbound,
      passengers,
    });
    alert(`✅ 예약 요청 완료 (${passengers.length}명)\n\n(현재는 테스트 단계입니다)`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white mt-10 p-8 rounded-xl shadow-lg">
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          항공편 예약정보 입력
        </h2>
        <p className="text-gray-600 mb-6">
          탑승객 수: <span className="font-semibold">{passengers.length}</span>명
        </p>

        {/* ✈️ 출발편 정보 */}
        {selectedOutbound && (
          <div className="mb-8 border border-blue-300 p-6 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-700 mb-2">출발편</h3>
            <p className="text-gray-700 font-medium mb-1">
              {selectedOutbound.airlineNm} {selectedOutbound.flightNo}
            </p>
            <p className="text-gray-600">
              {selectedOutbound.depAirportName} → {selectedOutbound.arrAirportName}
            </p>
            <p className="text-gray-600">
              {formatDateTime(selectedOutbound.depTime)} 출발 ·{" "}
              {formatDateTime(selectedOutbound.arrTime)} 도착
            </p>
            <p className="text-gray-800 font-semibold mt-2">
              ₩{Number(selectedOutbound.price || 0).toLocaleString()}
            </p>
          </div>
        )}

        {/* 🛬 귀국편 정보 */}
        {selectedInbound && (
          <div className="mb-8 border border-green-300 p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-700 mb-2">귀국편</h3>
            <p className="text-gray-700 font-medium mb-1">
              {selectedInbound.airlineNm} {selectedInbound.flightNo}
            </p>
            <p className="text-gray-600">
              {selectedInbound.depAirportName} → {selectedInbound.arrAirportName}
            </p>
            <p className="text-gray-600">
              {formatDateTime(selectedInbound.depTime)} 출발 ·{" "}
              {formatDateTime(selectedInbound.arrTime)} 도착
            </p>
            <p className="text-gray-800 font-semibold mt-2">
              ₩{Number(selectedInbound.price || 0).toLocaleString()}
            </p>
          </div>
        )}

        {/* 🧍 예약자 정보 입력 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-700 mb-4">탑승객 정보 입력</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
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

                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassenger(i)}
                    className="absolute top-3 right-3 text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleAddPassenger}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                + 탑승객 추가하기
              </button>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                예약 진행하기
              </button>
            </div>
          </form>
        </div>

        {/* 디버깅 */}
        <div className="mt-6 text-sm text-gray-400">
          <p>URL flightNo: {flightNo}</p>
          <p>출발편: {selectedOutbound?.flightNo || "없음"}</p>
          <p>귀국편: {selectedInbound?.flightNo || "없음"}</p>
          <p>탑승객 수: {passengers.length}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightRsvInputPage;
