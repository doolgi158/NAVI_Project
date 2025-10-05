// src/users/pages/flight/FlightRsvInputPage.jsx
import { useLocation } from "react-router-dom";
import MainLayout from "../../layout/MainLayout"; // ✅ 수정된 경로

const FlightRsvInputPage = () => {
  const { state } = useLocation();
  if (!state)
    return (
      <MainLayout>
        <div className="mt-20 text-center">잘못된 접근입니다.</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-xl mt-10">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">선택한 항공편</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          <p><b>항공편:</b> {state.airlineNm} {state.flightNo}</p>
          <p><b>경로:</b> {state.depAirportNm} → {state.arrAirportNm}</p>
          <p><b>출발:</b> {state.depPlandTime}</p>
          <p><b>도착:</b> {state.arrPlandTime}</p>
          <p><b>요금:</b> ₩{Number(state.price || 0).toLocaleString()}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default FlightRsvInputPage;
