import axios from "axios";
import api, { API_SERVER_HOST } from "../../common/api/naviApi";

const host = `${API_SERVER_HOST}/api/plans`;

// ✅ 여행계획 저장
export const savePlan = async (planData) => {
  const res = await api.post(`${host}`, planData, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ 내 여행계획 목록 조회
export const getMyPlans = async () => {
  const res = await axios.get(`${host}`);
  return res.data;
};

// ✅ 개별 계획 상세 조회
export const getPlanDetail = async (planId) => {
  const res = await axios.get(`${host}/${planId}`);
  return res.data;
};

// ✅ 내 여행 삭제
export const deletePlan = async (planId) => {
  const res = await api.delete(`${host}/${planId}`);
  return res.data;
};

// ✅ 내 여행 공유
export const sharePlan = async (planId) => {
  const res = await api.post(`${host}/${planId}/share`);
  return res.data;
};

// ✅ 여행지 목록 조회
export const getAllTravels = async () => {
  const res = await api.get(`/travel/list`);
  return res.data;
};

// ✅ 숙소 목록 조회
export const getAllStays = async () => {
  const res = await api.get(`/stay/list`);
  return res.data;
};
