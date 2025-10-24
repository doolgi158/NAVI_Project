import MainLayout from "../../layout/MainLayout";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Typography, Steps, Button, Radio, Divider, Space, message } from "antd";
import { setPaymentData } from "../../../common/slice/paymentSlice";
import { usePayment } from "../../../common/hooks/usePayment";

/* 예약 타입별 컴포넌트 */
import AccRsvInfo from "../../../common/components/reservation/AccRsvInfo";
import FlyRsvInfo from "../../../common/components/reservation/FlyRsvInfo";
import DlvRsvInfo from "../../../common/components/reservation/DlvRsvInfo";

/* 우측 요약 카드 */
import AccSumCard from "../../../common/components/reservation/AccRsvSumCard";
import FlySumCard from "../../../common/components/reservation/FlyRsvSumCard";
import DlvSumCard from "../../../common/components/reservation/DlvRsvSumCard";

const { Title, Text } = Typography;

const PaymentPage = () => {
	const { executePayment } = usePayment();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [paymentMethod, setPaymentMethod] = useState("KAKAOPAY");
	const [loading, setLoading] = useState(false);

	// ✅ Redux에서 모든 결제 데이터 불러오기
	const { rsvType, items, itemData, formData, totalAmount } = useSelector(
		(state) => state.payment
	);

	// ✅ 데이터 유효성 검사
	useEffect(() => {
		if (!rsvType || !formData || !items?.length) {
			message.warning("결제 정보가 유효하지 않습니다. 메인으로 이동합니다.");
			navigate("/");
		}
	}, [rsvType, formData, items, navigate]);

	// ✅ 예약 유형별 Info 컴포넌트
	const InfoComponent = useMemo(() => {
		switch (rsvType) {
			case "ACC":
				return AccRsvInfo;
			case "FLY":
				return FlyRsvInfo;
			case "DLV":
				return DlvRsvInfo;
			default:
				return null;
		}
	}, [rsvType]);

	// ✅ 우측 요약 카드
	const SummaryCard = useMemo(() => {
		switch (rsvType) {
			case "ACC":
				return <AccSumCard totalAmount={formData?.totalPrice || totalAmount} />;
			case "FLY":
				return (
					<FlySumCard
						selectedOutbound={itemData?.selectedOutbound}
						selectedInbound={itemData?.selectedInbound}
						totalAmount={formData?.totalPrice || totalAmount}
					/>
				);
			case "DLV":
				return <DlvSumCard totalAmount={formData?.totalPrice || totalAmount} />;
			default:
				return null;
		}
	}, [rsvType, itemData, formData, totalAmount]);

	// ✅ 결제 처리
	const handlePayment = async () => {
		if (loading) return;
		setLoading(true);

		try {
			dispatch(
				setPaymentData({
					rsvType,
					totalAmount: formData?.totalPrice || totalAmount,
					paymentMethod,
				})
			);

			// 약간의 딜레이 후 실제 결제 요청
			await new Promise((resolve) => setTimeout(resolve, 150));

			await executePayment({
				rsvType,
				items,
				totalAmount: formData?.totalPrice || totalAmount,
				paymentMethod,
			});
		} catch (error) {
			console.error("❌ [PaymentPage] 결제 처리 실패:", error);
			message.error("결제 처리 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	// ✅ 로딩 / 유효성 처리
	if (!rsvType || !formData) {
		return (
			<MainLayout>
				<div className="min-h-screen flex items-center justify-center">
					<Text type="secondary">결제 정보를 불러오는 중입니다...</Text>
				</div>
			</MainLayout>
		);
	}

	// ✅ 렌더링
	return (
		<MainLayout>
			<div className="min-h-screen flex justify-center pt-10 pb-12 px-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
					{/* === 좌측 결제 영역 === */}
					<Card
						className="lg:col-span-2"
						style={{ borderRadius: 16, backgroundColor: "#FFFFFF" }}
					>
						<Steps
							current={1}
							items={[
								{ title: "정보 입력" },
								{ title: "결제 진행" },
								{ title: "완료" },
							]}
							style={{ marginBottom: 40 }}
						/>

						<Title level={3}>결제 진행</Title>

						{/* ✅ 결제 수단 선택 */}
						<div className="mb-8">
							<Title level={5}>결제 수단 선택</Title>
							<Radio.Group
								onChange={(e) => setPaymentMethod(e.target.value)}
								value={paymentMethod}
							>
								<Space direction="vertical">
									<Radio value="KAKAOPAY">카카오페이</Radio>
									<Radio value="TOSSPAY">토스페이</Radio>
									<Radio value="KGINIPAY">KG이니시스</Radio>
								</Space>
							</Radio.Group>
						</div>

						<Divider />

						{/* ✅ 타입별 상세 정보 */}
						{InfoComponent ? (
							<InfoComponent formData={formData} />
						) : (
							<Text type="secondary">결제 정보를 불러올 수 없습니다.</Text>
						)}
					</Card>

					{/* === 우측 요약 카드 === */}
					<div className="flex flex-col justify-between h-full">
						{SummaryCard}
						<Button
							type="primary"
							size="large"
							style={{ marginTop: 24, height: 56, borderRadius: 12 }}
							loading={loading}
							onClick={handlePayment}
						>
							결제하기
						</Button>
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

export default PaymentPage;
