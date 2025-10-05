import { useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

const FlightDetailPage = () => {
  const { state: flight } = useLocation();

  if (!flight) return <div>잘못된 접근입니다.</div>;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          {flight.airlineNm} {flight.flightNo}
        </h2>
        <p>출발지: {flight.depAirportNm}</p>
        <p>도착지: {flight.arrAirportNm}</p>
        <p>출발 시간: {flight.depTime}</p>
        <p>도착 시간: {flight.arrTime}</p>
        <p>좌석 등급: {flight.seatClass}</p>
        <p className="text-red-600 font-semibold">가격: ₩{flight.price}</p>
      </div>
    </MainLayout>
  );
};

export default FlightDetailPage;
