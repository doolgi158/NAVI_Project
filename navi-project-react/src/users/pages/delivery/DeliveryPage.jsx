import MainLayout from "../../layout/MainLayout";
import { useState, useEffect } from "react";
import { Input, DatePicker, Button, message } from "antd";
import { useKakaoMap } from "../../../Common/hooks/useKakaoMap";
import dayjs from "dayjs";

const DeliveryPage = () => {
  const [form, setForm] = useState({
    senderName: "",
    phone: "",
    hotelName: "",
    address: "",
    deliveryDate: null,
    bagSize: "",
    bagCount: 1,
    memo: "",
  });

  // ✅ 지도 컨테이너 ID (오버레이 숨김)
  const MAP_CONTAINER_ID = "kakao-detail-map-container";
  const { isMapLoaded, updateMap, relayoutMap } = useKakaoMap(MAP_CONTAINER_ID);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  /** ✅ 카카오 주소 검색창 열기 */
  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      message.error("카카오 주소 검색 SDK가 아직 로드되지 않았어요.");
      return;
    }

    new window.daum.Postcode({
  oncomplete: function (data) {
    const addr = data.address;
    const building = data.buildingName || "";

    setForm((prev) => ({
      ...prev,
      address: addr,
      hotelName: building || prev.hotelName,
    }));

    if (window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(addr, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = result[0].y;
          const lng = result[0].x;

          updateMap({
            title: form.hotelName || building || "선택한 위치",
            latitude: lat,
            longitude: lng,
          });

          setTimeout(() => relayoutMap(), 500);
        } else {
          message.error("주소를 찾을 수 없습니다.");
        }
      });
    }
  },
}).open();

  };

  /** ✅ 예약 요청 */
  const handleSubmit = () => {
    const required = ["senderName", "phone", "address", "deliveryDate", "bagSize", "bagCount"];
    const missing = required.find((k) => !form[k]);
    if (missing) {
      message.warning("모든 필드를 입력해주세요.");
      return;
    }

    // ✅ 요청 데이터 확인
    const payload = {
      senderName: form.senderName,
      phone: form.phone,
      hotelName: form.hotelName,
      address: form.address,
      deliveryDate: form.deliveryDate,
      bagSize: form.bagSize,
      bagCount: Number(form.bagCount),
      memo: form.memo,
    };

    console.log("📦 예약 요청 데이터:", payload);
    message.success("예약 요청이 완료되었습니다!");
    // axios.post("/api/delivery", payload)
  };

  /** ✅ 기본 지도 표시 (제주공항) */
  useEffect(() => {
    if (isMapLoaded) {
      updateMap({
        title: "제주공항",
        latitude: 33.5055,
        longitude: 126.4950,
      });
      setTimeout(() => relayoutMap(), 400);
    }
  }, [isMapLoaded]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 입력폼 */}
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-center mb-6">짐배송 예약</h2>

          {/* 기본정보 */}
          <Input
            placeholder="이름"
            value={form.senderName}
            onChange={(e) => handleChange("senderName", e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="전화번호"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="숙소명"
            value={form.hotelName}
            onChange={(e) => handleChange("hotelName", e.target.value)}
            className="mb-3"
          />

          {/* 주소 검색 */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="숙소 주소"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            <Button onClick={handleSearchAddress}>주소 찾기</Button>
          </div>

          {/* 날짜 선택 */}
          <DatePicker
            className="w-full mb-4"
            value={form.deliveryDate ? dayjs(form.deliveryDate) : null}
            onChange={(date) => handleChange("deliveryDate", date)}
            placeholder="배송 희망 일자"
          />

          {/* 🧳 가방 정보 */}
          <h3 className="font-semibold text-gray-700 mt-4 mb-2">가방 정보</h3>
          <div className="flex gap-3 mb-3">
            <select
              className="border rounded-md p-2 w-1/2"
              value={form.bagSize || ""}
              onChange={(e) => handleChange("bagSize", e.target.value)}
            >
              <option value="">가방 크기 선택</option>
              <option value="S">소형 (S)</option>
              <option value="M">중형 (M)</option>
              <option value="L">대형 (L)</option>
            </select>

            <input
              type="number"
              min="1"
              className="border rounded-md p-2 w-1/2"
              placeholder="가방 개수"
              value={form.bagCount || ""}
              onChange={(e) => handleChange("bagCount", e.target.value)}
            />
          </div>

          {/* 요청사항 */}
          <textarea
            className="border rounded-md p-2 w-full mb-4"
            placeholder="요청사항을 입력하세요 (선택)"
            rows="2"
            value={form.memo || ""}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          <Button type="primary" block onClick={handleSubmit}>
            예약하기
          </Button>
        </div>

        {/* 오른쪽: 지도 */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <div
            id={MAP_CONTAINER_ID}
            style={{ width: "100%", height: "550px", borderRadius: "12px"}}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryPage;
