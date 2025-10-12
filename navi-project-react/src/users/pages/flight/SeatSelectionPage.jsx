import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";

const API_SERVER_HOST = "http://localhost:8080";

/**
 * SeatSelectPage.jsx
 * - 백엔드에서 좌석을 받아오고,
 * - 프론트에서 20~30%를 "임의 예약됨" 상태로 표시 (UI 전용).
 * - 임의 예약 인덱스는 sessionStorage에 저장되어 세션(탭) 동안 일관성 유지.
 */

const SeatSelectPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 전달받은 상태
  const {
    isRoundTrip = false,
    step = "outbound", // outbound(출발) | inbound(귀국)
    selectedOutbound,
    selectedInbound,
    passengerCount = 1,
    passengers = [],
  } = state || {};

  const flight = step === "outbound" ? selectedOutbound : selectedInbound;

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // EmbeddedId 대응 (FlightId 복합키 구조)
  const flightIdValue = flight?.flightId?.flightId || flight?.flightNo || flight?.flightId; // 마지막 fallback
  const depTimeValue = flight?.flightId?.depTime || flight?.depTime;

  // 날짜 포맷 (UI 표시용)
  const formatDateTimeKOR = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- helper: session key for pseudo reservations
  const makeSessionKey = (flightId, depTimeIso) => {
    return `pseudoReserved_${flightId}_${depTimeIso}`;
  };

  // --- helper: generate N unique random indexes within [0, total-1]
  const generateRandomIndexes = (total, count) => {
    const set = new Set();
    while (set.size < Math.min(count, total)) {
      set.add(Math.floor(Math.random() * total));
    }
    return Array.from(set);
  };

  // 좌석 데이터 불러오기 및 UI용 랜덤 예약 처리 (세션 일관성 유지)
  useEffect(() => {
    if (!flightIdValue || !depTimeValue) {
      console.warn("⚠️ flightId/depTime 누락:", { flight, flightIdValue, depTimeValue });
      return;
    }

    // depTime은 반드시 ISO 형태 (스페이스 → T)
    const formattedDepTime = depTimeValue.includes("T")
      ? depTimeValue
      : depTimeValue.replace(" ", "T");

    const sessionKey = makeSessionKey(flightIdValue, formattedDepTime);
    console.log("🧭 좌석 요청", { flightIdValue, formattedDepTime, step });

    const fetchSeats = async () => {
      try {
        const res = await axios.get(
          `${API_SERVER_HOST}/api/seats/${encodeURIComponent(flightIdValue)}`,
          {
            // 스프링 ISO 파서는 "2025-10-13T09:00:00" 그대로 받는게 가장 안전
            params: { depTime: formattedDepTime },
          }
        );

        let seatData = Array.isArray(res.data) ? res.data : [];
        console.log("📦 좌석 응답 크기:", seatData.length);

        if (seatData.length === 0) {
          console.warn("❗ 좌석이 0개입니다. flightId/depTime 매칭 실패 가능성.");
          setSeats([]);
          return;
        }

        // 필드 안전 보정 (백엔드 DTO와 이름 다를 경우 대비)
        seatData = seatData.map((seat) => ({
          ...seat,
          seatClass: seat.seatClass || seat.seat_class || "ECONOMY",
          totalPrice: seat.totalPrice ?? seat.price ?? 0,
          isReserved: !!seat.isReserved,
        }));

        // --- 포폴용: sessionStorage에 저장된 랜덤 예약 인덱스가 있으면 사용,
        //     없으면 20~30% 비율로 생성해 저장.
        let reservedIndexes = null;
        try {
          const stored = sessionStorage.getItem(sessionKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              // 범위를 벗어나는 인덱스 필터
              reservedIndexes = parsed.filter(
                (i) => Number.isInteger(i) && i >= 0 && i < seatData.length
              );
            }
          }
        } catch (e) {
          console.warn("sessionStorage parse 실패:", e);
        }

        if (!reservedIndexes || reservedIndexes.length === 0) {
          const totalSeats = seatData.length;
          const ratio = 0.2 + Math.random() * 0.1; // 20% ~ 30%
          const reservedCount = Math.max(1, Math.floor(totalSeats * ratio));
          reservedIndexes = generateRandomIndexes(totalSeats, reservedCount);
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(reservedIndexes));
          } catch (e) {
            console.warn("sessionStorage set 실패:", e);
          }
        }

        // 좌석 데이터 복사 후 isReserved 표시 (UI 전용)
        seatData = seatData.map((seat, idx) =>
          reservedIndexes.includes(idx)
            ? { ...seat, isReserved: true }
            : seat
        );

        console.log(
          `🎲 [UI 시뮬] pseudo-reserved ${reservedIndexes.length}/${seatData.length}`,
          { flightIdValue, formattedDepTime }
        );

        setSeats(seatData);
      } catch (err) {
        console.error("❌ 좌석 불러오기 실패:", err);
        setSeats([]);
      }
    };

    fetchSeats();
  }, [flightIdValue, depTimeValue, step]); // step 바뀌어도 재조회

  // 귀국편 진입 시 선택 초기화
  useEffect(() => {
    if (step === "inbound") {
      setSelectedSeats([]);
      setTotalPrice(0);
    }
  }, [step]);

  // 좌석 선택 / 해제
  const handleSeatClick = (seat) => {
    if (seat.isReserved) return;

    const already = selectedSeats.find((s) => s.seatNo === seat.seatNo);
    let updatedSeats;

    if (already) {
      updatedSeats = selectedSeats.filter((s) => s.seatNo !== seat.seatNo);
    } else {
      if (selectedSeats.length >= passengerCount) {
        alert("탑승객 수보다 많은 좌석을 선택할 수 없습니다.");
        return;
      }
      updatedSeats = [...selectedSeats, seat];
    }

    setSelectedSeats(updatedSeats);
    const newTotal = updatedSeats.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    setTotalPrice(newTotal);
  };

  // 좌석 구역별 분리
  const prestigeSeats = seats.filter((s) => s.seatClass === "PRESTIGE");
  const economySeats = seats.filter((s) => s.seatClass === "ECONOMY");

  const groupByRow = (seatArray) => {
    const rows = {};
    seatArray.forEach((s) => {
      const rowNum = s.seatNo.replace(/[^0-9]/g, "");
      if (!rows[rowNum]) rows[rowNum] = [];
      rows[rowNum].push(s);
    });
    return rows;
  };

  const prestigeRows = groupByRow(prestigeSeats);
  const economyRows = groupByRow(economySeats);

  // 좌석 버튼 (크기 작음, 한 영역에 통합)
  const SeatButton = ({ seat }) => {
    const selected = selectedSeats.some((s) => s.seatNo === seat.seatNo);
    return (
      <button
        onClick={() => handleSeatClick(seat)}
        className={`w-8 h-8 m-0.5 rounded-md border text-xs font-semibold
          ${
            seat.isReserved
              ? "bg-gray-400 cursor-not-allowed text-white"
              : selected
              ? "bg-yellow-400 border-yellow-600"
              : seat.seatClass === "PRESTIGE"
              ? "bg-blue-300 hover:bg-blue-400"
              : "bg-green-200 hover:bg-green-300"
          }`}
        title={seat.isReserved ? "예약됨" : `${seat.seatNo} (${seat.seatClass})`}
      >
        {seat.seatNo}
      </button>
    );
  };

  // 다음 단계 이동
  const handleNext = () => {
    if (selectedSeats.length !== passengerCount) {
      alert(`탑승객 수(${passengerCount})에 맞게 좌석을 선택해주세요.`);
      return;
    }

    if (isRoundTrip && step === "outbound") {
      // 왕복 출발편 완료 → 귀국편 좌석 선택으로 이동
      navigate("/flight/seat", {
        state: {
          isRoundTrip: true,
          step: "inbound",
          selectedOutbound,
          selectedInbound,
          passengerCount,
          passengers,
          outboundSeats: selectedSeats,
        },
      });
    } else {
      // 편도 or 귀국 완료 → 결제 페이지로 이동
      navigate("/flight/payment", {
        state: {
          selectedOutbound,
          selectedInbound,
          outboundSeats: step === "outbound" ? selectedSeats : state.outboundSeats,
          inboundSeats: step === "inbound" ? selectedSeats : [],
          passengerCount,
          passengers,
          totalPrice,
        },
      });
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (step === "inbound") {
      navigate("/flight/seat", {
        state: {
          isRoundTrip: true,
          step: "outbound",
          selectedOutbound,
          selectedInbound,
          passengerCount,
          passengers,
        },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto my-10">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-800">
          {step === "outbound" ? "출발편 좌석 선택" : "귀국편 좌석 선택"}
        </h2>
        <p className="text-center text-gray-600 mb-1">
          {flight?.depAirportName} → {flight?.arrAirportName}
        </p>
        <p className="text-center text-gray-500 mb-6">
          출발시간: {formatDateTimeKOR(flight?.depTime)}
        </p>

        {/* 통합 좌석 박스 */}
        <div className="border border-gray-300 bg-gray-50 rounded-lg p-4">
          {/* 색상 안내 */}
          <div className="flex justify-start text-sm text-gray-600 mb-3">
            <span className="flex items-center mr-4">
              <span className="w-3 h-3 bg-blue-300 border border-blue-400 mr-1" /> 비즈니스석
            </span>
            <span className="flex items-center mr-4">
              <span className="w-3 h-3 bg-green-200 border border-green-400 mr-1" /> 일반석
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-gray-400 mr-1" /> 예약됨
            </span>
          </div>

          {/* 비즈니스석 (프레스티지) */}
          <div className="mb-4">
            {Object.keys(prestigeRows).map((row) => (
              <div key={row} className="flex justify-center mb-1 gap-1">
                {prestigeRows[row].map((seat, idx) => (
                  <span key={seat.seatNo} className="flex items-center">
                    <SeatButton seat={seat} />
                    {idx === 1 && <div className="w-2" />} {/* 통로 (간격) */}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* 일반석 */}
          <div>
            {Object.keys(economyRows).map((row) => (
              <div key={row} className="flex justify-center mb-1 gap-1">
                {economyRows[row].map((seat, idx) => (
                  <span key={seat.seatNo} className="flex items-center">
                    <SeatButton seat={seat} />
                    {idx === 2 && <div className="w-3" />} {/* 통로 (간격) */}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 선택 요약 */}
        <div className="mt-6 border-t pt-4 text-center">
          <h4 className="text-lg font-semibold mb-2">선택된 좌석</h4>
          {selectedSeats.length === 0 ? (
            <p className="text-gray-500">좌석을 선택하세요.</p>
          ) : (
            <ul className="mb-3">
              {selectedSeats.map((s) => (
                <li key={s.seatNo}>
                  {s.seatNo} ({s.seatClass}) - ₩{(s.totalPrice || 0).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xl font-bold mb-4">총 금액: ₩{totalPrice.toLocaleString()}</p>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              뒤로가기
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isRoundTrip && step === "outbound" ? "귀국편 선택하기" : "결제 진행하기"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SeatSelectPage;
