import api, { API_SERVER_HOST } from "../../common/api/naviApi";

const host = `${API_SERVER_HOST}/api/plans`;

/** ✅ 여행계획 저장 */
export const savePlan = async (planData) => {
  try {
    const res = await api.post(`${host}`, planData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("❌ savePlan() 요청 실패:", err);
    throw err;
  }
};

/** ✅ 내 여행계획 목록 조회 */
export const getMyPlans = async () => {
  const res = await api.get("/plans");
  return res.data;
};

/** ✅ 개별 계획 상세 조회 */
export const getPlanDetail = async (planId) => {
  if (!planId || planId === "null" || planId === "undefined") {
    console.warn("⚠️ getPlanDetail 호출 중단: 잘못된 planId =", planId);
    return null;
  }

  try {
    const res = await api.get(`${host}/${planId}`);
    if (!res.data) {
      console.warn(`⚠️ getPlanDetail 응답이 비어있음 (planId=${planId})`);
      return null;
    }
    return res.data;
  } catch (err) {
    console.error(`❌ getPlanDetail(${planId}) 요청 실패:`, err);
    return null;
  }
};

/** ✅ 여행계획 수정 */
export const updatePlan = async (planId, planData) => {
  if (!planId || planId === "null" || planId === "undefined") {
    console.warn("⚠️ updatePlan 호출 중단: 잘못된 planId =", planId);
    return null;
  }

  try {
    const res = await api.put(`${host}/schedule/${planId}`, planData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error(`❌ updatePlan(${planId}) 요청 실패:`, err);
    throw err;
  }
};

/** ✅ 내 여행 삭제 */
export const deletePlan = async (planId) => {
  if (!planId || planId === "null" || planId === "undefined") {
    console.warn("⚠️ deletePlan 호출 중단: 잘못된 planId =", planId);
    return null;
  }

  try {
    const res = await api.delete(`${host}/${planId}`);
    return res.data;
  } catch (err) {
    console.error(`❌ deletePlan(${planId}) 요청 실패:`, err);
    throw err;
  }
};

/** ✅ 내 여행 공유 */
export const sharePlan = async (planId) => {
  if (!planId || planId === "null" || planId === "undefined") {
    console.warn("⚠️ sharePlan 호출 중단: 잘못된 planId =", planId);
    return null;
  }

  try {
    const res = await api.post(`${host}/${planId}/share`);
    return res.data;
  } catch (err) {
    console.error(`❌ sharePlan(${planId}) 요청 실패:`, err);
    throw err;
  }
};

/** ✅ 여행지 목록 조회 */
export const getAllTravels = async () => {
  try {
    const res = await api.get(`/travel/list`);
    return res.data;
  } catch (err) {
    console.error("❌ getAllTravels() 요청 실패:", err);
    return [];
  }
};

/** ✅ 숙소 목록 조회 */
export const getAllStays = async () => {
  try {
    const res = await api.get(`/stay/list`);
    return res.data;
  } catch (err) {
    console.error("❌ getAllStays() 요청 실패:", err);
    return [];
  }
};
