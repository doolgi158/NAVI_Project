import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import MainLayout from "../../layout/MainLayout";

const DeliveryResultPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state || {}; // ✅ 핵심 수정: 실제 예약정보 추출

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">짐배송 예약 완료</h2>

          <div className="text-left space-y-3 mb-8">
            <p>
              <strong>예약번호:</strong> {data.drsvId || "-"}
            </p>
            <p>
              <strong>출발지:</strong> {data.startAddr || "-"}
            </p>
            <p>
              <strong>도착지:</strong> {data.endAddr || "-"}
            </p>
            <p>
              <strong>배송일자:</strong> {data.deliveryDate || "-"}
            </p>
            <p>
              <strong>결제금액:</strong>{" "}
              {data.totalPrice ? `${data.totalPrice.toLocaleString()}원` : "-"}
            </p>
            <p>
              <strong>현재 상태:</strong>{" "}
              <span
                className={
                  data.status === "PENDING"
                    ? "text-yellow-600"
                    : data.status === "PAID"
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                {data.status || "PENDING"}
              </span>
            </p>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => navigate("/")}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryResultPage;
