import { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Progress } from "antd";

/**
 * LazyDataLoader.jsx
 * - 데이터가 백엔드에서 준비될 때까지 반복적으로 상태를 확인하며 로딩 UI 표시
 * - 항공편 좌석, 숙소 정보, 배송 그룹 등 다양한 모듈에서 재사용 가능
 *
 * @param {string} checkUrl - 상태 확인 API (예: /api/seats/{flightId}/status)
 * @param {object} checkParams - 상태 확인 API에 전달할 파라미터
 * @param {function} onReady - 데이터가 준비되었을 때 실행할 콜백 (fetch 함수 등)
 * @param {ReactNode} children - 로딩 완료 후 렌더링할 컴포넌트
 */
const LazyDataLoader = ({ checkUrl, checkParams = {}, onReady, children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    let timerId;

    const checkStatus = async () => {
      try {
        const res = await axios.get(checkUrl, { params: checkParams });
        if (res.data?.initialized === true) {
          clearTimeout(timerId);
          setLoading(false);
          onReady?.(); // 데이터 로딩 콜백
        } else if (attempt < maxAttempts) {
          setAttempt((prev) => prev + 1);
          timerId = setTimeout(checkStatus, 3000); // 3초마다 재확인
        }
      } catch (err) {
        console.error("❌ LazyDataLoader 상태 확인 실패:", err);
        setError(true);
      }
    };

    checkStatus();
    return () => clearTimeout(timerId);
  }, [checkUrl, JSON.stringify(checkParams)]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600">
        <p className="text-lg font-semibold mb-2">데이터 로딩 실패</p>
        <p className="text-sm text-gray-500 mb-4">
          서버에서 데이터를 가져오는 데 실패했습니다.<br />
          네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          다시 시도하기
        </button>
      </div>
    );
  }


  if (loading) {
    const progress = Math.min((attempt / maxAttempts) * 100, 100);

    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">데이터를 준비 중입니다...</p>
        <Progress percent={progress} status="active" style={{ width: 300 }} />
        <p className="mt-2 text-gray-500">
          {attempt}/{maxAttempts} 단계 진행 중
        </p>
        {/* <p className="mt-4 text-gray-600">최대 30초 정도 소요될 수 있습니다.</p> */}
      </div>
    );
  }

  return children;
};

export default LazyDataLoader;
