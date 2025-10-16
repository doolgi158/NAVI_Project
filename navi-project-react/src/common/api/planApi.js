import api from "@/common/api/naviApi"; 

/** 내 여행 목록 조회 */
export const getMyPlans = async () => {
  const res = await api.get(`/plans/myplans`);
  return res.data;
};

/** 내 여행 저장 */
import axios from "axios";

export const savePlan = async (planData) => {
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const response = await axios.post("/api/plans", planData, config);
  return response.data;
};


/** 내 여행 삭제 */
export const deletePlan = async (planId) => {
  const res = await api.delete(`/plans/${planId}`);
  return res.data;
};

/** 내 여행 공유 */
export const sharePlan = async (planId) => {
  const res = await api.post(`/plans/${planId}/share`);
  return res.data; // 서버가 공유 링크 반환한다고 가정
};


