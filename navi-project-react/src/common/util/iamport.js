/* 아임포트 결제 유틸 */
export const initIamport = () => {
  const { IMP } = window;

  if (!IMP) {
    throw new Error("아임포트 SDK가 로드되지 않았습니다. index.html을 확인하세요.");
  }

  // 아임포트 식별코드
  const iamportCode = import.meta.env.VITE_IAMPORT_CODE;
  IMP.init(iamportCode);

  return IMP;
};

