import React from "react";
import MainLayout from "../../layout/MainLayout";
import PaymentStepIndicator from "../../../components/payment/PaymentStepIndicator";
import PaymentMethodSelect from "../../../components/payment/PaymentMethodSelect";
import PaymentInfoSection from "../../../components/payment/PaymentInfoSection";
import PaymentButton from "../../../components/payment/PaymentButton";
import AccRoomSummaryCard from "../../../components/acc/AccRoomSummaryCard";

const AccPaymentPage = () => {
  const buyer = { name: "홍길동", email: "test@example.com", phone: "010-1234-5678" };
  const amount = 130000;

  const handlePaymentSuccess = (result) => {
    console.log("✅ 결제 성공:", result);
    alert("결제가 완료되었습니다!");
  };

  const accInfo = {
    accName: "감성 한옥 스테이",
    roomName: "온돌룸",
    accNo: 2,
    roomId: "ROM003",
    maxGuests: 3,
    pricePerNight: 130000,
    imageUrl: "/images/sample-room.jpg",
  };

  const rsvInfo = {
    guestName: "홍길동",
    phone: "010-1234-5678",
    email: "test@example.com",
    checkIn: "2025-10-15 15:00",
    checkOut: "2025-10-16 15:00",
    guests: 2,
    totalPrice: 130000,
  };

  return (
    <MainLayout>
      <div className="flex justify-center gap-6 py-8">
        {/* 왼쪽 결제 영역 */}
        <div className="flex flex-col bg-white rounded-2xl shadow-md p-6 w-[55%]">
          <PaymentStepIndicator currentStep={2} />
          <PaymentMethodSelect />
          <PaymentInfoSection info={rsvInfo} />
          <div className="text-right mt-8">
            <PaymentButton amount={amount} buyer={buyer} onSuccess={handlePaymentSuccess} />
          </div>
        </div>

        {/* 오른쪽 숙소 요약 카드 */}
        <div className="w-[35%]">
          <AccRoomSummaryCard info={accInfo} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AccPaymentPage;
