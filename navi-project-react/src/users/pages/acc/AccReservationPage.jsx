import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Typography, Form, Input, Button, Steps, Divider, Space, message } from "antd";
import { CalendarOutlined, TeamOutlined, HomeOutlined, DollarOutlined } from "@ant-design/icons";
import { setReserveData } from "../../../common/slice/paymentSlice";
import MainLayout from "../../layout/MainLayout";

const { Title, Text } = Typography;

const AccReservationPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [form] = Form.useForm();

	/* location.state */
	const { rsvType, items, itemData, formData } = location.state || {};
	
	// 유효성 검사
	if (!formData || !itemData) {
		message.error("예약 정보가 올바르지 않습니다. 다시 시도해주세요.");
		navigate("/accommodations");
		return null;
	}

	/* 결제 페이지 이동 */
	const onFinish = (values) => {
		// [ TODO ] : 현재 해당 항목들 저장할 컬럼 없음 - @CLOB 예정
		const updatedFormData = {
			...formData,
			name: values.name,		// 대표 예약자 이름
			phone: values.phone,	// 전화번호
			email: values.email,	// 이메일
		};

		dispatch(
			setReserveData({
				rsvType,   								// ACC        			
				reserveId: formData.reserveId,         	// 예약 ID
				itemData: itemData,   					// 숙소 + 객실 정보
				items: items,							// reserveId + amount
				formData: updatedFormData, 				// 예약자 정보까시 새롭게 포함한 formData
			})
		);
		
		navigate("/payment", {
			state: {
				rsvType: "ACC",
				itemData,	
				items,
				formData : updatedFormData,
			},
		});
	};

	return (
		<MainLayout>
		<div className="flex justify-center py-10 px-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
			{/* === 왼쪽: 예약자 입력 폼 === */}
			<Card
				className="lg:col-span-2"
				style={{
				borderRadius: 12,
				boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
				backgroundColor: "#fff",
				height: "fit-content",
				}}
			>
				<Steps
				current={0}
				items={[
					{ title: "예약 정보 입력" },
					{ title: "결제 진행" },
					{ title: "예약 완료" },
				]}
				style={{ marginBottom: 40 }}
				/>

				<Title level={3} className="mb-6 text-gray-800">
				대표 예약자 정보 입력
				</Title>

				<Form form={form} layout="vertical" onFinish={onFinish}>
				<Form.Item
					label="이름"
					name="name"
					rules={[{ required: true, message: "이름을 입력해주세요." }]}
				>
					<Input placeholder="홍길동" size="large" />
				</Form.Item>

				<Form.Item
					label="연락처"
					name="phone"
					rules={[{ required: true, message: "연락처를 입력해주세요." }]}
				>
					<Input placeholder="010-1234-5678" size="large" />
				</Form.Item>

				<Form.Item
					label="이메일"
					name="email"
					rules={[
					{ required: true, message: "이메일을 입력해주세요." },
					{ type: "email", message: "올바른 이메일 형식을 입력해주세요." },
					]}
					style={{ marginBottom: 0 }}
				>
					<Input placeholder="example@email.com" size="large" />
				</Form.Item>
				</Form>
			</Card>

			{/* === 오른쪽: 예약 요약 카드 === */}
			<div className="flex flex-col justify-between h-full">
				<Card
				style={{
					borderRadius: 12,
					boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
					backgroundColor: "#fafafa",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
				>
				<div>
					<div className="flex flex-col items-center text-center mb-6">
					<Title level={4} className="text-gray-900 mb-2">
						{itemData.accName || "숙소 이름"}
					</Title>
					<Text className="text-lg text-gray-700 font-medium mb-1">
						{itemData.room?.roomName || "객실 정보 없음"}
					</Text>
					<Text className="text-xl font-bold text-blue-600">
						{itemData.room?.weekdayFee
						? `${itemData.room.weekdayFee.toLocaleString()}원 / 1박`
						: "가격 미정"}
					</Text>
					</div>

					<Divider style={{ margin: "12px 0" }} />

					<Space
						direction="vertical"
						size="small"
						style={{ width: "100%", fontSize: "0.95rem" }}
					>
						<Text>
							<CalendarOutlined className="text-gray-600 mr-2" />
							<b>숙박 일정:</b>{" "}
							{formData.checkIn && formData.checkOut
							? `${formData.checkIn} ~ ${formData.checkOut} (${formData.nights}일)`
							: "선택되지 않음"}
						</Text>

						<Text>
							<TeamOutlined className="text-gray-600 mr-2" />
							<b>인원 수:</b> {formData.guestCount || 1}명
						</Text>

						<Text>
							<HomeOutlined className="text-gray-600 mr-2" />
							<b>객실 수:</b> {formData.roomCount || 1}개
						</Text>
					</Space>

					<Divider style={{ margin: "16px 0" }} />

					<Text
					className="block text-base font-semibold text-gray-900 text-center"
					>
					<DollarOutlined className="text-yellow-600 mr-2" />
					총 금액:{" "}
					<span className="text-blue-600 font-bold">
						{formData.totalAmount.toLocaleString()}원
					</span>
					</Text>
				</div>

				{/* ✅ 하단 버튼 */}
				<div className="mt-6">
					<Button
					type="primary"
					size="large"
					block
					style={{
						height: "50px",
						borderRadius: "10px",
						fontSize: "1.05rem",
						fontWeight: 600,
						marginTop: "20px",
					}}
					onClick={() => form.submit()}
					>
					결제하기
					</Button>
				</div>
				</Card>
			</div>
			</div>
		</div>
		</MainLayout>
	);
};

export default AccReservationPage;
