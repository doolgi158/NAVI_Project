import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Typography, Divider, Button, message, Spin, Row, Col, Carousel, DatePicker, InputNumber } from "antd";
import { useKakaoMap } from "../../../common/hooks/useKakaoMap";
import { setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { setReserveData } from "../../../common/slice/paymentSlice";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const AccDetailPage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	/* Redux */
	const selectedAcc = useSelector((state) => state.acc.selectedAcc);      // 숙소 객체
  	const selectedAccId = useSelector((state) => state.acc.selectedAccId);  // 숙소 ID (문자열)


	/* 로컬 상태 */
	const [accId, setAccId] = useState(selectedAccId || null);	// 숙소 ID
	const [accData, setAccData] = useState(null);				// 숙소 정보
	const [rooms, setRooms] = useState([]);						// 객실 리스트
	const [loading, setLoading] = useState(true);				// 로딩

	/* 검색 조건 상태 */
	const [dateRange, setDateRange] = useState(null);			// 기간
	const [guestCount, setGuestCount] = useState(1);			// 인원수
	const [roomCount, setRoomCount] = useState(1);				// 객실수

	/* Kakao 지도 */
	const { isMapLoaded, updateMap, resetMap } = useKakaoMap("kakao-detail-map-container");

	/* 숙소 ID 유지(새로고침 방어) */
	useEffect(() => {
		if (selectedAccId) {
			localStorage.setItem("selectedAccId", selectedAccId);
			setAccId(selectedAccId);
		} else {
			const savedId = localStorage.getItem("selectedAccId");
			if (savedId) {
				setAccId(savedId);
				dispatch(setSelectedAcc(savedId));
			}
		}
	}, [selectedAccId, dispatch]);

	/* 숙소 기본 데이터 로드 */
	useEffect(() => {
		if (!accId) return;	// 숙소 ID 필수

		const fetchData = async () => {
			try {
				setLoading(true);	// 로딩 스피너 ON
				const res = await axios.get(`/api/accommodations/${accId}`);
				const data = res.data;
				setAccData(data);
			} catch (err) {
				console.error("숙소 상세 조회 실패: ", err);
				message.error("숙소 정보를 불러오지 못했습니다.");
			} finally {
				setLoading(false);	// 로딩 스피너 OFF
			}
		};

		fetchData();

		return () => resetMap();	// 지도 초기화
	}, [accId, navigate, resetMap]);

	/* Kakao 지도 업데이트 */
	useEffect(() => {
		if (isMapLoaded && accData?.mapx && accData?.mapy) {
			updateMap({
				title: accData.title,
				latitude: accData.mapx,
				longitude: accData.mapy,
			});
		}
	}, [isMapLoaded, accData, updateMap]);

	/* 검색 조건 복원(뒤로가기 방어) */
	useEffect(() => {
		const stored = localStorage.getItem("searchState");
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (parsed.dateRange && parsed.dateRange.length === 2) {
					setDateRange([
						dayjs(parsed.dateRange[0]),	// 체크인
						dayjs(parsed.dateRange[1]),	// 체크아웃
					]);
				}
				if (parsed.guestCount) setGuestCount(parsed.guestCount);	// 인원수
				if (parsed.roomCount) setRoomCount(parsed.roomCount);		// 객실수
			} catch (e) {
				console.warn("검색 조건 복원 실패:", e);
			}
		}
	}, []);

	/* 조건 기반 객실 데이터 로드 */
	const fetchRooms = useCallback(async () => {
		if (!accId || !dateRange) return;

		try {
			const checkIn = dateRange[0].format("YYYY-MM-DD");
			const checkOut = dateRange[1].format("YYYY-MM-DD");

			const res = await axios.get(`/api/rooms/${accId}`, {
				params: { checkIn, checkOut, guestCount, roomCount },
			});

			setRooms(res.data);
		} catch (err) {
			console.error("객실 목록 조회 실패:", err);
			message.error("객실 정보를 불러오지 못했습니다.");
		}
	}, [accId, dateRange, guestCount, roomCount]);

	/* 날짜 변경 시 자동 객실 갱신 */
	useEffect(() => {
		if (dateRange) fetchRooms();
	}, [dateRange, guestCount, roomCount, fetchRooms]);

	/* 예약 과정 */
	const handleReserve = async (room) => {
		if (!dateRange || dateRange.length !== 2) {
			message.warning("체크인 및 체크아웃 날짜를 선택해주세요.");
			return;
		}

		const checkIn = dateRange[0].format("YYYY-MM-DD");				// 체크인 날짜
		const checkOut = dateRange[1].format("YYYY-MM-DD");				// 체크아웃 날짜
		const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");		// 숙박일수
		const totalAmount = room.weekdayFee * roomCount * nights		// [ TODO ] : 평일 가격 기준 총 금액

		// 결제 시 사용할 예약 폼 데이터(preFormData)
		const preFormData = {
			reserveId: null,									// 예약ID
			userNo: 2,											// [ TODO ] : 사용자 연결
			roomId: room.roomId,								// 객실ID
			checkIn,											// 체크인 날짜
			checkOut,											// 체크아웃 날짜
			guestCount,											// 인원수
			roomCount,											// 객실수
			totalAmount,										// 총금액
			roomName: room.roomName,							// 객실명
			nights,												// 숙박일수
		};

		// 임시 숙소 예약ID 생성(객실 선점)
		try {
			// 백엔드에 넘길 RequestDTO
			// [ TODO ] : 아직 객실 단일 예약 밖에 안됨
			const dtoList = [
				{
					reserveId: preFormData.reserveId, 	// null
					userNo: 2, 							// [ TODO ] : 사용자 연결
					roomId: room.roomId,				// 객실ID
					startDate: checkIn,					// 체크인 날짜
					endDate: checkOut,					// 체크아웃 날짜
					nights: nights,						// 숙박일수
					quantity: preFormData.roomCount,	// 객실수량
					price: room.weekdayFee,				// [ TODO ] : 객실단가 (임시적으로 평일만 적용)
				},
			];

			const res = await axios.post(`/api/room/reserve/pending`, dtoList);

			// 예약ID 추출
			const generatedReserveId = res.data?.reserveId || (Array.isArray(res.data) && res.data[0]?.reserveId);
			console.log(res.data?.reserveId, generatedReserveId);

			if (!generatedReserveId) {
				console.warn("⚠️ 서버 응답:", res.data);
				message.error("예약 ID 생성에 실패했습니다.");
				return;
			} else {
				// formData에 저장
				const formData = {
					...preFormData,
					reserveId: generatedReserveId,
				};

				// 숙소 및 객실 정보(UI 용)
				const itemData = {
					accId,
					accName: accData.title,
					address: accData.address,
					thumbnail: accData.accImages?.[0] || null,
					room,
				};

				// 결제 DTO 매핑용
				const items = [
					{
						reserveId: generatedReserveId,
						amount: room.weekdayFee,
					},
				]

				dispatch(
					setReserveData({
						rsvType: "ACC",
						itemData: itemData,   		// 숙소 + 객실 정보
						items,						// reserveId + amount
						formData, 					// reserveId 갱신한 formData
					})
				);

				// 예약 정보 입력 페이지로 이동
				navigate("/accommodations/detail/reservation", {
					state: {
						rsvType: "ACC",
						itemData,
						items,
						formData,
					},
				});
			}
		} catch (err) {
			console.error("❌ 예약 임시 생성 실패:", err);
			message.error("예약 생성 중 오류가 발생했습니다.");
		}
	};

	/* 로딩 상태 */
	if (loading) {
		return (
			<MainLayout>
				<div className="flex justify-center items-center min-h-screen">
					<Spin tip="숙소 정보를 불러오는 중..." />
				</div>
			</MainLayout>
		);
	}

	if (!accData) {
		return (
			<MainLayout>
				<div className="flex justify-center items-center min-h-screen text-lg">
					숙소 정보를 찾을 수 없습니다.
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<div className="min-h-screen flex justify-center pt-8 pb-10 px-6">
				<div className="w-full max-w-6xl">
					<div className="bg-white shadow-md rounded-2xl p-6">
						{/* 숙소명 + 주소 */}
						<div className="mb-5">
							<Title level={3} className="text-gray-900 font-bold mb-1">
								{accData.title}
							</Title>
							<Text className="text-sm text-gray-600">{accData.address}</Text>
						</div>

						{/* 이미지 + 지도 */}
						<Row gutter={[16, 16]} className="mb-6">
							<Col xs={24} lg={14}>
								{accData.accImages?.length > 0 ? (
									<Carousel autoplay autoplaySpeed={3000} dots className="rounded-xl overflow-hidden">
										{accData.accImages.map((img, idx) => {
											// ✅ 경로 자동 처리
											const resolvedSrc = img.startsWith("/uploads/")
												? `${API_SERVER_HOST}${img}`
												: img.startsWith("http")
													? img
													: `${API_SERVER_HOST}${img}`;

											return (
												<div key={idx}>
													<img
														src={resolvedSrc}
														alt={`${accData.title} 이미지 ${idx + 1}`}
														className="w-full h-[260px] object-cover rounded-xl"
														onError={(e) => {
															e.target.style.display = "none";
															const fallback = document.createElement("div");
															fallback.className =
																"h-[260px] w-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm";
															fallback.textContent = "이미지 준비중";
															e.target.parentNode.appendChild(fallback);
														}}
													/>
												</div>
											);
										})}
									</Carousel>
								) : (
									<div className="bg-gray-100 rounded-xl h-[260px] flex items-center justify-center text-gray-500 text-sm">
										이미지 준비중
									</div>
								)}
							</Col>

							<Col xs={24} lg={10}>
								<div
									id="kakao-detail-map-container"
									className="w-full h-[260px] rounded-xl border border-gray-200 shadow-inner"
								/>
							</Col>
						</Row>

						{/* 숙소 소개 */}
						<div className="mb-6">
							<Title level={5} className="text-gray-800 mb-2 font-semibold">
								숙소 소개
							</Title>
							<Paragraph className="text-base text-gray-600 leading-relaxed">
								{accData.overview || "숙소 소개 정보가 없습니다."}
							</Paragraph>
						</div>

						{/* 숙박 조건 선택 */}
						<Divider />
						<Title level={5} className="text-gray-800 mb-5 font-semibold">
							숙박 조건 선택
						</Title>

						<div className="flex flex-wrap gap-4 mb-8 items-end">
							<div className="flex flex-col">
								<Text className="text-sm text-gray-600 mb-2 font-medium">
									숙박 일정
								</Text>
								<RangePicker
									format="YYYY-MM-DD"
									placeholder={["체크인", "체크아웃"]}
									value={dateRange}
									size="large"
									onChange={(v) => setDateRange(v)}
									disabledDate={(current) => {
										// ✅ 오늘 이전 날짜 비활성화
										const today = dayjs().startOf("day");
										return current && current < today;
									}}
									onCalendarChange={(dates) => {
										if (dates && dates[0] && dates[1]) {
											const diff = dayjs(dates[1]).diff(dayjs(dates[0]), "day");
											if (diff > 7) {
												message.warning("최대 7박까지만 예약할 수 있습니다.");
												setDateRange(null);
											}
										}
									}}
								/>
							</div>

							<div className="flex flex-col">
								<Text className="text-sm text-gray-600 mb-2 font-medium">
									인원 수
								</Text>
								<InputNumber
									min={1}
									max={30}
									value={guestCount}
									onChange={setGuestCount}
									size="large"
								/>
							</div>

							<div className="flex flex-col">
								<Text className="text-sm text-gray-600 mb-2 font-medium">
									객실 수
								</Text>
								<InputNumber
									min={1}
									max={10}
									value={roomCount}
									onChange={setRoomCount}
									size="large"
								/>
							</div>

							<Button type="primary" onClick={fetchRooms} className="h-[40px]">
								객실 조회
							</Button>
						</div>

						{/* 객실 목록 */}
						<Divider className="my-6" />
						<Title level={5} className="text-gray-800 mb-4 font-semibold">
							객실 정보
						</Title>

						{rooms?.length > 0 ? (
							<div className="space-y-4">
								{rooms.map((room) => (
									<div
										key={room.roomId}
										className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
									>
										{/* 객실 이미지 */}
										{room.thumbnailImage ? (
											<img
												src={`${API_SERVER_HOST}${room.thumbnailImage}`}
												alt={room.roomName}
												className="md:w-1/4 w-full h-40 object-cover"
											/>
										) : (
											<div className="md:w-1/4 w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
												이미지 없음
											</div>
										)}

										{/* ✅ 객실 정보 + 버튼 */}
										<div className="flex flex-col justify-between p-4 flex-1 bg-white">
											<div>
												<Title level={5} className="text-gray-900 mb-1">
													{room.roomName}
												</Title>
												<Text className="block text-gray-600 text-sm mb-1">
													최대 인원 {room.maxCnt}명
												</Text>
												<Text className="block text-[#006D77] font-semibold text-base mb-1">
													{room.weekdayFee
														? `${room.weekdayFee.toLocaleString()}원 / 1박`
														: "가격 미정"}
												</Text>
											</div>

											<div className="flex justify-between items-end">
												{room.remainCount !== null && (
													<Text
														type={room.remainCount <= 3 ? "danger" : "secondary"}
														className={`font-medium ${room.remainCount <= 3
															? "text-red-500 font-semibold"
															: "text-gray-600"
															}`}
													>
														잔여 객실 {room.remainCount}개
													</Text>
												)}

												<Button
													type="primary"
													size="large"
													className="w-28 font-semibold"
													onClick={() => handleReserve(room)}
													disabled={room.remainCount !== null && room.remainCount <= 0}
												>
													{room.remainCount !== null && room.remainCount <= 0
														? "예약 마감"
														: "예약하기"}
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<Text className="text-gray-500 text-sm">
								조건에 맞는 객실이 없습니다.
							</Text>
						)}
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

export default AccDetailPage;
