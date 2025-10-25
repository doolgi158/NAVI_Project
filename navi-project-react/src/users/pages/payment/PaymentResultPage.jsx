import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, Button } from "antd";
import MainLayout from "../../layout/MainLayout";

const { Title, Text } = Typography;

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // usePayment → navigate 시 전달된 데이터
  const { impUid, merchantId, error } = location.state || {};

  const isSuccess = !error && impUid;

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center items-center px-4">
        <Card
          style={{
            width: 400,
            textAlign: "center",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {isSuccess ? (
            <>
              <Title level={3} style={{ color: "#52c41a" }}>
                ✅ 결제가 성공했습니다!
              </Title>
              <Text type="secondary">승인번호: {impUid}</Text>
              <br />
              <Text type="secondary">주문번호: {merchantId}</Text>
            </>
          ) : (
            <>
              <Title level={3} style={{ color: "#ff4d4f" }}>
                ❌ 결제가 실패했습니다!
              </Title>
              <Text type="secondary">
                {error || "결제 중 문제가 발생했습니다."}
              </Text>
            </>
          )}

          <Button
            type="primary"
            block
            size="large"
            style={{ marginTop: 24 }}
            onClick={() => navigate("/")}
          >
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentResultPage;
