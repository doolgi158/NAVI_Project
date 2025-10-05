import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";

/**
 * ✈️ FlightDetailPage
 * - 항공편 검색 결과 목록 표시
 * - FlightPage에서 받은 검색 조건(state)을 기반으로 API 호출
 */
const FlightDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) return; // 검색 조건이 없으면 중단
    setLoading(true);

    // ✅ 날짜 포맷 안전하게 변환 (moment 객체든 string이든 처리)
    const depDate = state?.dates?.range?.[0]
      ? dayjs(state.dates.range[0]).format("YYYY-MM-DD")
      : dayjs(state?.dates?.dep).format("YYYY-MM-DD");

    // ✅ 백엔드 DTO(FlightSearchRequestDTO)와 1:1 매칭되는 요청 본문
    const requestBody = {
      depAirportCode: state.depAirport, // ex) "GMP"
      arrAirportCode: state.arrAirport, // ex) "CJU"
      depDate: depDate,
      seatClass: state.seatClass || "ECONOMY",
    };

    console.log("📤 항공편 조회 요청:", requestBody);

    axios
      .post("http://localhost:8080/api/flights/search", requestBody)
      .then((res) => {
        console.log("📥 조회 결과:", res.data);
        if (Array.isArray(res.data)) {
          setFlights(res.data);
        } else if (res.data?.content) {
          // 혹시 백엔드가 Page<>로 반환되는 경우 대응
          setFlights(res.data.content);
        } else {
          setFlights([]);
        }
      })
      .catch((err) => {
        console.error("❌ 항공편 조회 실패:", err);
        setFlights([]);
      })
      .finally(() => setLoading(false));
  }, [state]);

  // ✅ state 유효성 체크
  if (!state)
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-20 text-center">
          잘못된 접근입니다.{" "}
          <a href="/flight" className="text-blue-600 underline">
            항공편 검색으로 돌아가기
          </a>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">항공편 조회 결과</h2>

        {/* 로딩 중 */}
        {loading && <p className="text-gray-500">조회 중입니다...</p>}

        {/* 결과 없음 */}
        {!loading && flights.length === 0 && (
          <p className="text-gray-500">검색된 항공편이 없습니다.</p>
        )}

        {/* 결과 목록 */}
        {!loading && flights.length > 0 && (
          <div className="grid gap-4">
            {flights.map((f) => (
              <div
                key={`${f.flightNo}-${f.depTime}`}
                onClick={() => navigate("/flight/rsv", { state: f })}
                className="bg-[#fafbff] hover:bg-white border border-gray-200 p-6 rounded-xl shadow-sm cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {f.airlineNm} {f.flightNo}
                    </p>
                    <p className="text-gray-600">
                      {f.depAirportName} → {f.arrAirportName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {dayjs(f.depTime).format("HH:mm")} 출발 ·{" "}
                      {dayjs(f.arrTime).format("HH:mm")} 도착
                    </p>
                    <p className="font-semibold text-blue-700 mt-1">
                      ₩{Number(f.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FlightDetailPage;
