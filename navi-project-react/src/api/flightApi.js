import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080";
const PREFIX = `${API_SERVER_HOST}/api/flights`; // ✅ 복수형으로 수정

/**
 * ✈️ 항공편 예약 저장 요청
 * - 예약 정보 객체를 서버로 전달
 * - 예시: { flightNo, seatNo, userId, price, ... }
 */
export const reserveFlight = async (reservationData) => {
  try {
    const response = await axios.post(`${PREFIX}/reserve`, reservationData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ 항공편 예약 실패:", err);
    throw err;
  }
};

/**
 * ✈️ 항공편 목록 조회 (필요 시 확장)
 * - FlightDetailPage.jsx에서 직접 axios 호출 중이지만,
 *   이 함수를 통해 재사용 가능하도록 정의해둠
 */
export const searchFlights = async (searchData) => {
  try {
    const response = await axios.post(`${PREFIX}/search`, searchData, {
      headers: { "Content-Type": "application/json" },
    });
    return Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];
  } catch (err) {
    console.error("❌ 항공편 조회 실패:", err);
    throw err;
  }
};
