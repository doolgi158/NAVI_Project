import api, { API_SERVER_HOST } from "./naviApi"

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
  try {
    const res = await api.get(`${host}`);
    return res.data?.data || [];
  } catch (err) {
    console.error("❌ getMyPlans() 요청 실패:", err);
    throw err;
  }
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
    const res = await api.put(`${host}/${planId}`, planData, {
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

/** ⚠️ (보류) 내 여행 공유 — 백엔드 미구현 */
export const sharePlan = async (planId) => {
  console.warn("⚠️ sharePlan() 백엔드 엔드포인트 미구현");
  return null;
};

/** ✅ 여행지 목록 조회 */
export const getAllTravels = async () => {
  try {
    const res = await api.get(`/travel/list`);

    // 응답 구조 자동 감지 (배열 or 객체.data)
    const travels = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    console.log("[getAllTravels] travels loaded:", travels.length);
    return travels;
  } catch (err) {
    console.error("❌ getAllTravels() 요청 실패:", err);
    return [];
  }
};

//** ✅ 숙소 목록 조회 (응답 구조 자동 인식) */
export const getAllStays = async () => {
  try {
    const res = await api.get(`/stay/list`);

    // 응답 구조 자동 인식 (배열 or 객체.data)
    const stays = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    const filtered = stays.map(stay => ({
      accId: stay.accId,
      title: stay.title,
      address: stay.address,
      mapx: stay.mapx,
      mapy: stay.mapy,
      image: stay.image || null, // 필요하면 유지
    }));

    console.log("[getAllStays] stays loaded:", filtered.length);
    return filtered;

  } catch (err) {
    console.error("❌ getAllStays() 요청 실패:", err);
    return [];
  }
};


