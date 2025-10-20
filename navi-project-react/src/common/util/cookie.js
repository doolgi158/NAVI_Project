import { Cookies } from "react-cookie";

const cookies = new Cookies();

/** ✅ 쿠키 저장 (JSON 데이터 대응 가능) */
export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days);

  // 문자열만 저장되도록 JSON 직렬화 + URI 인코딩
  const encodedValue = encodeURIComponent(
    typeof value === "object" ? JSON.stringify(value) : value
  );

  return cookies.set(name, encodedValue, { path: "/", expires });
};

/** ✅ 쿠키 읽기 (자동 디코딩 + JSON 파싱 지원) */
export const getCookie = (name) => {
  const rawValue = cookies.get(name);
  if (!rawValue) return null;

  try {
    const decoded = decodeURIComponent(rawValue);
    return JSON.parse(decoded);
  } catch {
    return rawValue; // 문자열인 경우 그대로 반환
  }
};

/** ✅ 쿠키 삭제 */
export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};