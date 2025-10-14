/** 내 여행 목록 조회 */
export const getMyPlans = async () => {
  const res = await api.get(`/plans/my`);
  return res.data;
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
