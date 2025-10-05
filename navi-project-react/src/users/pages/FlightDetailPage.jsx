// FlightDetailPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const FlightDetailPage = () => {
  const { state } = useLocation(); // FlightPage에서 넘어온 searchData
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📦 받은 검색조건을 기반으로 API 호출
  useEffect(() => {
    if (!state) return;
    setLoading(true);

    const params = {
      depAirport: state.from,
      arrAirport: state.to,
      seatClass: state.seatClass,
      passengerCount: state.passengers,
      tripType: state.tripType,
    };

    // 날짜 변환
    if (state.tripType === "round" && state.dates.range) {
      params.depDate = state.dates.range[0]?.format("YYYY-MM-DD");
      params.retDate = state.dates.range[1]?.format("YYYY-MM-DD");
    } else {
      if (state.dates.dep)
        params.depDate = state.dates.dep.format("YYYY-MM-DD");
      if (state.dates.arr)
        params.arrDate = state.dates.arr.format("YYYY-MM-DD");
    }

    console.log("요청 파라미터:", params);

    axios
      .get("http://localhost:8080/api/flights", { params })
      .then((res) => {
        setFlights(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("조회 실패:", err))
      .finally(() => setLoading(false));
  }, [state]);

  if (!state)
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-10">
          잘못된 접근입니다.{" "}
          <a href="/flight" className="text-blue-600 underline">
            검색 페이지로 돌아가기
          </a>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">항공편 조회 결과</h2>

        {loading && <p>조회 중...</p>}
        {!loading && flights.length === 0 && (
          <p className="text-gray-500">검색된 항공편이 없습니다.</p>
        )}

        <div className="grid gap-4">
          {flights.map((f) => (
            <div
              key={`${f.flightNo}-${f.depPlandTime}`}
              onClick={() => navigate("/flight/rsv", { state: f })}
              className="bg-[#fafbff] hover:bg-white border border-gray-100 p-6 rounded-xl shadow cursor-pointer transition"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-lg">
                    {f.airlineNm} {f.flightNo}
                  </p>
                  <p className="text-gray-500">
                    {f.depAirportNm} → {f.arrAirportNm}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {f.depPlandTime} 출발 · {f.arrPlandTime} 도착
                  </p>
                  <p className="font-semibold text-blue-700">
                    ₩{Number(f.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightDetailPage;
