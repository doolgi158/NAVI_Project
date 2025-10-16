import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import {
  Card,
  Typography,
  Steps,
  Button,
  Radio,
  Divider,
  Space,
  message,
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const AccPaymentPage = () => {
  const { accId, roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { room, accName, formData } = location.state || {};

  const [paymentMethod, setPaymentMethod] = React.useState("kakaopay");

  // ✅ 총 결제금액을 컴포넌트 상단에서 계산
  const totalAmount =
    (room?.weekdayFee || room?.price || 0) * (formData?.roomCount || 1);
  
  /** ✅ 결제 요청 함수 */
  const handlePayment = async () => {
    const { IMP } = window;
    if (!IMP) {
      alert("아임포트 SDK가 로드되지 않았습니다. index.html을 확인하세요.");
      return;
    }

    // ✅ (1) 예약 마스터 생성 - reserveId 발급
    let reserveId = null;
    try {
      const preRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reservation/pre`,
        {
          userNo: 1, // TODO: 로그인 유저로 교체
          rsvType: "ACC",
          targetId: accId,
          totalAmount: room?.weekdayFee || room?.price,
          startDate: formData?.checkIn,
          endDate: formData?.checkOut,
        }
      );

      reserveId = preRes.data.reserveId;
      console.log("🆔 예약번호 발급 성공:", reserveId);
    } catch (err) {
      console.error("❌ 예약번호 생성 실패:", err);
      message.error("예약 정보를 불러오는 중 오류가 발생했습니다.");
      return;
    }

    // ✅ (2) 아임포트 초기화
    const iamportCode = import.meta.env.VITE_IAMPORT_CODE;
    IMP.init(iamportCode);

    // ✅ (3) PG 및 채널키 설정
    let pg, channelKey;
    switch (paymentMethod) {
      case "kakaopay":
        pg = "kakaopay.TC0ONETIME";
        channelKey = import.meta.env.VITE_KAKAOPAY_CHANNEL_KEY;
        break;
      case "tosspay":
        pg = "tosspay.tosstest";
        channelKey = import.meta.env.VITE_TOSSPAY_CHANNEL_KEY;
        break;
      default:
        pg = "html5_inicis.INIpayTest";
        channelKey = import.meta.env.VITE_INIPAY_CHANNEL_KEY;
    }

    // ✅ (4) 결제 금액 계산
    const totalAmount =
      (room?.weekdayFee || room?.price || 0) * (formData?.roomCount || 1);

    // ✅ (5) 결제 요청 데이터 구성
    const paymentData = {
      pg,
      pay_method: "card",
      merchant_uid: reserveId,
      name: `${accName || "숙소"} 예약 결제`,
      amount: totalAmount,
      buyer_name: formData?.name,
      buyer_tel: formData?.phone,
      buyer_email: formData?.email,
      custom_data: {
        reserveId,
        accId,
        roomId,
        roomName: room?.roomName,
        totalAmount,
        guestCount: formData?.guestCount,
        dateRange: formData?.dateRange,
        channelKey,
      },
    };

    console.log("💳 결제 요청 데이터:", paymentData);

    // ✅ (6) 결제창 호출
    IMP.request_pay(paymentData, async (rsp) => {
      if (rsp.success) {
        console.log("✅ 결제 성공:", rsp);
        message.success("결제가 성공적으로 완료되었습니다!");

        try {
          // ✅ (7) 결제 검증 요청
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify`,
            {
              reserveId,
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid,
              payMethod: paymentMethod,
              channelKey,
            }
          );

          const result = verifyRes.data;
          console.log("🧾 결제 검증 결과:", result);

          if (result.status === "paid") {
            message.success("결제 검증 완료! 예약 확정 중...");

            // ✅ (8) 예약 확정 처리
            const reservePayload = {
              reserveId,
              roomId,
              quantity: formData?.roomCount || 1,
              roomPrice: room?.price || room?.weekdayFee || 0,
              totalAmount,
              startDate: new Date(formData?.checkIn),
              endDate:  new Date(formData?.checkOut),
            };

            const reserveRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/accommodations/reserve/detail`,
              reservePayload
            );

            console.log("🏨 예약 확정 결과:", reserveRes.data);

            // ✅ (9) 성공 페이지로 이동
            navigate(`/accommodations/${accId}/${roomId}/result`, {
              state: {
                success: true,
                message: "결제가 완료되었습니다! 예약이 확정되었습니다.",
                payment: result,
                reservation: reserveRes.data,
              },
            });
          } else {
            message.warning(`결제 상태: ${result.status}`);
            navigate(`/accommodations/${accId}/${roomId}/result`, {
              state: {
                success: false,
                message: "결제 검증에 실패했습니다. 카드가 취소됩니다.",
              },
            });
          }
        } catch (err) {
          console.error("❌ 결제 검증 또는 예약 처리 실패:", err);
          message.error("결제 검증 중 오류 발생");

          // ✅ 검증 실패 시 결과 페이지 이동
          navigate(`/accommodations/${accId}/${roomId}/result`, {
            state: {
              success: false,
              message: "결제 검증 실패 — 잠시 후 카드 결제가 취소됩니다.",
            },
          });
        }
      } else {
        console.error("❌ 결제 실패:", rsp.error_msg);
        message.error("결제 실패: " + rsp.error_msg);

        // ✅ 결제 실패 시 결과 페이지 이동
        navigate(`/accommodations/${accId}/${roomId}/result`, {
          state: {
            success: false,
            message: "결제가 실패했습니다. 잠시 후 카드 결제가 취소됩니다.",
          },
        });
      }
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FFFBEA] flex justify-center pt-10 pb-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* === 왼쪽: 결제 정보 === */}
          <Card
            className="lg:col-span-2"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              backgroundColor: "#FFFFFF",
            }}
            styles={{
              body: { padding: "32px" },
            }}
          >
            <Steps
              current={1}
              items={[
                { title: "예약 정보 입력" },
                { title: "결제 진행" },
                { title: "예약 완료" },
              ]}
              style={{ marginBottom: 40 }}
            />

            <Title level={3} className="mb-6 text-gray-800">
              결제 진행
            </Title>

            {/* ✅ 결제 수단 선택 */}
            <div className="mb-8">
              <Title level={5}>결제 수단 선택</Title>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className="mt-3"
              >
                <Space direction="vertical">
                  <Radio value="kakaopay">카카오페이</Radio>
                  <Radio value="tosspay">토스페이</Radio>
                  <Radio value="inipay">KG이니시스</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            {/* ✅ 예약 정보 확인 */}
            <div className="space-y-2">
              <Title level={5}>예약 정보 확인</Title>
              <Text className="block text-gray-600">
                예약자명: <strong>{formData?.name}</strong>
              </Text>
              <Text className="block text-gray-600">
                연락처: <strong>{formData?.phone}</strong>
              </Text>
              <Text className="block text-gray-600">
                이메일: <strong>{formData?.email}</strong>
              </Text>
              <Text className="block text-gray-600">
                숙박 일정:{" "}
                <strong>
                  {`${formData?.checkIn} ~ ${formData?.checkOut}`}
                </strong>
              </Text>
              <Text className="block text-gray-600">
                인원: <strong>{formData?.guestCount || 2}명</strong>
              </Text>
              <Text className="block text-gray-600 mt-4 text-lg">
                총 결제 금액:{" "}
                <span className="text-blue-600 font-bold text-xl">
                  {totalAmount
                    ? `${totalAmount.toLocaleString()}원`
                    : "가격 정보 없음"}
                </span>
              </Text>
            </div>
          </Card>

          {/* === 오른쪽: 숙소 요약 === */}
          <div className="flex flex-col justify-between h-full">
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#FDF6D8",
              }}
              styles={{
                body: { padding: "24px" },
              }}
            >
              <div className="flex flex-col text-center mb-6">
                <Title level={4} className="text-gray-800 mb-3">
                  {accName || "숙소 이름"}
                </Title>

                <img
                  src={room?.image || "https://via.placeholder.com/300x200"}
                  alt={room?.type || "객실 이미지"}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <Title level={5} className="text-gray-700 mb-1">
                  {room?.roomName || "객실 정보 없음"}
                </Title>

                <Text className="block text-gray-500 mb-1">숙소ID: {accId}</Text>
                <Text className="block text-gray-500 mb-1">객실ID: {roomId}</Text>
                <Text className="text-lg text-gray-600 mb-1">
                  최대 인원 {room?.max || "-"}명
                </Text>
                <Text className="text-2xl font-bold text-[#006D77] mb-2">
                  {room?.price || room?.weekdayFee
                    ? `${(room?.price || room?.weekdayFee).toLocaleString()}원 / 1박`
                    : "-"}
                </Text>
              </div>
            </Card>

            {/* ✅ 결제 버튼 */}
            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
                onClick={handlePayment}
              >
                결제하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccPaymentPage;
