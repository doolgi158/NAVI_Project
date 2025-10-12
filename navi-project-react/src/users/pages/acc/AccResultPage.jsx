import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { Result, Spin, Typography } from "antd";

const { Title } = Typography;

/**
 * ✅ 결제 완료 / 실패 결과 페이지
 * - 결제 성공/실패 여부에 따라 메시지와 UI 다르게 표시
 * - 3초 뒤 자동 이동 (홈 or 예약 내역 등)
 */
const AccResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, message } = location.state || {};

  const [loading, setLoading] = useState(true);

  // ✅ 로딩 효과 후 결과 표시
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ 3초 뒤 자동 이동
//   useEffect(() => {
//     if (!loading) {
//       const redirectTimer = setTimeout(() => {
//         navigate("/accommodations");
//       }, 3000);
//       return () => clearTimeout(redirectTimer);
//     }
//   }, [loading, navigate]);

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center items-center bg-[#FFFBEA]">
        <div
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
          style={{ width: "480px" }}
        >
          {loading ? (
            <>
              <Spin size="large" />
              <Title level={4} className="mt-6 text-gray-600">
                결제 결과 확인 중입니다...
              </Title>
            </>
          ) : success ? (
            <Result
              status="success"
              title="🎉 결제가 성공적으로 완료되었습니다!"
              subTitle={message || "예약이 정상적으로 완료되었습니다."}
            />
          ) : (
            <Result
              status="error"
              title="❌ 결제 실패했습니다!"
              subTitle={
                message ||
                "잠시 후 카드 결제가 자동 취소됩니다. 다시 시도해주세요."
              }
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AccResultPage;
