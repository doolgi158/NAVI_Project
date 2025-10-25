import axios from "axios";
import { API_SERVER_HOST } from "../api/naviApi";

/* JWT 토큰을 가져와 요청 헤더로 포함시키는 함수 */
const getAuthHeader = () => {
	const token = localStorage.getItem("accessToken");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

/* 결제 마스터 테이블 INSERT - 결제 ID 생성 */
export const preparePayment = async (data) => {
	console.log("🟢 preparePayment data:", data);
	const res = await axios.post(
		`${API_SERVER_HOST}/api/payment/prepare`,
		data,
		{ headers: { ...getAuthHeader() } }
	);
	return res.data;
};

/* 결제 검증 요청 */
export const verifyPayment = async (data) => {
	const res = await axios.post(
		`${API_SERVER_HOST}/api/payment/verify`,
		data,
		{ headers: { ...getAuthHeader() } }
	);
	return res.data;
};