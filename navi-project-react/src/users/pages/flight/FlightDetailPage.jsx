import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const API_SERVER_HOST = "http://localhost:8080";

const FlightDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("📡 useEffect 실행됨:", state);
    if (!state) return;

    const body = {
      depAirportCode: state.depAirport,
      arrAirportCode: state.arrAirport,
      depDate: state.depDate,
      seatClass: (state.seatClass || "ECONOMY").toUpperCase(),
    };

    console.log("📤 요청 body:", body);

    setLoading(true);
    axios
      .post(`${API_SERVER_HOST}/flight/detail`, body)
      .then((res) => {
        console.log("✅ 응답:", res.data);
        setFlights(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("❌ 요청 실패:", err))
      .finally(() => setLoading(false));
  }, [state]);

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
              key={`${f.flightNo}-${f.depTime}`}
              onClick={() => navigate(`/flight/rsv/${f.flightNo}`, { state: f })}
              className="bg-[#fafbff] hover:bg-white border border-gray-100 p-6 rounded-xl shadow cursor-pointer transition"
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
      </div>
    </MainLayout>
  );
};

export default FlightDetailPage;
