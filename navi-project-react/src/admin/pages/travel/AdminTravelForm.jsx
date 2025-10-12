import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveAdminTravel, fetchAdminTravelDetail } from "../../../common/api/adminTravelApi";
import { Form, Input, InputNumber, Checkbox, Button, Alert, Card, Row, Col, message, AutoComplete } from "antd";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";
import Layout from "antd/es/layout/layout";
import TravelEditor from "./TravelEditor";
import dayjs from "dayjs";


/** ✅ 제주 하위 지역 목록 */
const JEJU_SUBREGIONS = {
  제주시: ["제주시내", "애월", "한림", "한경", "조천", "구좌", "우도", "추자"],
  서귀포시: ["성산", "서귀포시내", "대정", "안덕", "중문", "남원", "표선"],
};

const initialForm = {
  travelId: null,
  title: "",
  introduction: "",
  description: "", // ✅ 본문 추가
  region1Name: "",
  region2Name: "",
  address: "",
  roadAddress: "",
  longitude: 0.0,
  latitude: 0.0,
  imagePath: "",
  thumbnailPath: "",
  tag: "",
  phoneNo: "",
  homepage: "",
  parking: "",
  fee: "",
  hours: "",
  state: true,
};

/** ✅ Kakao SDK 준비 */
function ensureKakaoReady() {
  return new Promise((resolve, reject) => {
    const hasScript = !!document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (!hasScript) {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAOMAP_KEY
      }&libraries=services&autoload=false`;
      script.async = true;
      script.onerror = () => reject(new Error("Kakao SDK load error"));
      document.head.appendChild(script);
    }

    const wait = () => {
      if (window.kakao && window.kakao.maps) {
        try {
          window.kakao.maps.load(() => {
            if (window.kakao.maps.services) resolve();
            else reject(new Error("Kakao services not available"));
          });
        } catch {
          if (window.kakao.maps.services) resolve();
          else setTimeout(wait, 100);
        }
      } else {
        setTimeout(wait, 100);
      }
    };
    wait();
  });
}

/** 읍/면/동 앞까지만 남기기 */
function trimEupMyeonDong(name) {
  if (!name) return "";
  const m = name.match(/^(.*?)(읍|면|동)/);
  return m ? m[1] : name;
}

const AdminTravelForm = () => {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoOptions, setAutoOptions] = useState([]);
  const isEditMode = !!travelId;
  const [form] = Form.useForm();

  /** ✅ 수정 모드 데이터 불러오기 */
  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    fetchAdminTravelDetail(travelId)
      .then((res) => {
        const data = res.data;
        // AntD Form.Item에 맞게 setFieldsValue 대신 setFormData를 사용
        setFormData({
          ...data,
          description: data.description || "",
        });
      })
      .catch((err) => {
        console.error("❌ 데이터 불러오기 실패:", err);
        message.error("데이터 불러오기 실패");
      })
      .finally(() => setLoading(false));
  }, [isEditMode, travelId]);

  /** ✅ 지역1 변경 */
  const handleRegion1Change = (e) => {
    const value = e.target.value.trim();
    setFormData((prev) => ({ ...prev, region1Name: value, region2Name: "" }));

    if (value === "제주시")
      setAutoOptions(JEJU_SUBREGIONS["제주시"].map((v) => ({ value: v })));
    else if (value === "서귀포시")
      setAutoOptions(JEJU_SUBREGIONS["서귀포시"].map((v) => ({ value: v })));
    else setAutoOptions([]);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** ✅ 주소검색 → 좌표 변환 */
  const handleAddressSearch = useCallback(() => {
    if (!window.daum?.Postcode) {
      message.error("주소검색 모듈을 불러올 수 없습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: async (data) => {
        const fullAddr = data.address;
        const roadAddr = data.roadAddress || "";
        const jibunAddr = data.jibunAddress || "";

        try {
          await ensureKakaoReady();
        } catch (err) {
          message.error("지도 모듈 로드 실패");
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(fullAddr, (results, status) => {
          if (status !== window.kakao.maps.services.Status.OK || !results.length) {
            message.warning("주소 좌표 변환 실패");
            setFormData((prev) => ({
              ...prev,
              address: jibunAddr || fullAddr,
              roadAddress: roadAddr || fullAddr,
            }));
            return;
          }

          const r = results[0];
          const { x, y } = r;
          const a = r.address;

          let region1 = a?.region_1depth_name || "";
          let region2 = a?.region_2depth_name || "";
          let region3 = a?.region_3depth_name || "";

          let region1Name = region1;
          let region2Name = region2;

          if (region1 === "제주특별자치도") {
            region1Name = region2;
            region2Name = trimEupMyeonDong(region3);
          } else {
            region2Name = trimEupMyeonDong(region2);
          }

          if (region1Name && region2Name && region1Name === region2Name) region2Name = "";

          setFormData((prev) => ({
            ...prev,
            address: jibunAddr || fullAddr,
            roadAddress: roadAddr || fullAddr,
            region1Name,
            region2Name,
            longitude: parseFloat(x) || 0.0,
            latitude: parseFloat(y) || 0.0,
          }));

          if (region1Name === "제주시")
            setAutoOptions(JEJU_SUBREGIONS["제주시"].map((v) => ({ value: v })));
          else if (region1Name === "서귀포시")
            setAutoOptions(JEJU_SUBREGIONS["서귀포시"].map((v) => ({ value: v })));
          else setAutoOptions([]);
        });
      },
    }).open();
  }, []);

  /** ✅ 유효성 검사 */
  const validateForm = () => {
    const { title, region1Name, region2Name } = formData;
    if (!title?.trim()) return message.error("제목은 필수 항목입니다."), false;
    if (!region1Name?.trim()) return message.error("지역1(시/군)을 입력해주세요."), false;
    if (!region2Name?.trim()) return message.error("지역2(읍/면/동)을 입력해주세요."), false;

    if (region1Name === "제주시" && !JEJU_SUBREGIONS["제주시"].includes(region2Name))
      return message.error("제주시의 하위 지역명이 올바르지 않습니다."), false;
    if (region1Name === "서귀포시" && !JEJU_SUBREGIONS["서귀포시"].includes(region2Name))
      return message.error("서귀포시의 하위 지역명이 올바르지 않습니다."), false;

    return true;
  };

  /** ✅ 저장 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await saveAdminTravel({
        ...formData,
        state: formData.state ? 1 : 0,
      });
      message.success(isEditMode ? "수정 완료" : "등록 완료");
      navigate("/adm/travel");
    } catch (err) {
      console.error("저장 오류:", err);
      message.error("저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <AdminSiderLayout />
      <Layout>
        <Header className="px-6 shadow text-xl font-bold" style={{ background: "#fefce8" }}>
          NAVI 관리자 페이지
        </Header>

        <Content style={{ minHeight: "100vh", padding: "24px", background: "#fefce843" }}>
          <div style={{ padding: "24px" }}>
            <Card
              title={isEditMode ? `여행지 수정 (${formData.title || travelId})` : "새 여행지 등록"}
              extra={
                <Button onClick={() => navigate("/adm/travel")} disabled={loading}>
                  목록으로
                </Button>
              }
            >
              {isEditMode && (
                <div style={{ marginBottom: 16, fontSize: 14, color: "#666" }}>
                  <span>
                    🕓 등록일:{" "}
                    {formData.createdAt
                      ? dayjs(formData.createdAt).format("YYYY-MM-DD HH:mm")
                      : "-"}
                  </span>
                  <span style={{ marginLeft: 20 }}>
                    🔄 수정일:{" "}
                    {formData.updatedAt
                      ? dayjs(formData.updatedAt).format("YYYY-MM-DD HH:mm")
                      : "-"}
                  </span>
                </div>
              )}

              {error && (
                <Alert
                  message="오류"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: 20 }}
                />
              )}

              <Form layout="vertical" onSubmitCapture={handleSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="제목" required>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="공개 상태">
                      <Checkbox
                        checked={formData.state}
                        onChange={(e) => handleChange("state", e.target.checked)}
                      >
                        공개
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="소개">
                  <Input.TextArea
                    rows={4}
                    value={formData.introduction}
                    onChange={(e) => handleChange("introduction", e.target.value)}
                    placeholder="간단한 한줄 소개를 입력하세요"
                  />
                </Form.Item>

                {/* ✅ 여행지 본문 (ReactQuill 에디터) */}
                <Form.Item label="본문 (상세 소개 / 블로그 형식)">
                    {formData.description !== undefined && (
                        <TravelEditor
                          // key={formData.travelId || "new"} // ❌ key prop 제거: 컴포넌트 재마운트 방지
                          value={formData.description || ""} // ✅ value prop 사용
                          onChange={(val) => handleChange("description", val)}
                        />
                    )}
                    </Form.Item>
                

                {/* ✅ 이하 부분 그대로 유지 */}
                <Card title="주소 / 지역" size="small" style={{ marginBottom: 20 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="주소">
                        <Input
                          readOnly
                          value={formData.roadAddress || formData.address}
                          placeholder="주소를 검색해주세요"
                          addonAfter={<Button onClick={handleAddressSearch}>주소검색</Button>}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="지역1 (시/군)">
                        <Input
                          value={formData.region1Name}
                          onChange={handleRegion1Change}
                          placeholder="예: 제주시 / 서귀포시"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="지역2 (읍/면/동)">
                        <AutoComplete
                          options={autoOptions}
                          value={formData.region2Name}
                          onChange={(v) => handleChange("region2Name", v)}
                          placeholder="예: 애월, 성산 등"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="경도(Longitude)">
                        <InputNumber
                          style={{ width: "100%" }}
                          value={formData.longitude}
                          onChange={(v) => handleChange("longitude", v)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="위도(Latitude)">
                        <InputNumber
                          style={{ width: "100%" }}
                          value={formData.latitude}
                          onChange={(v) => handleChange("latitude", v)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* ✅ 기타 필드 */}
                <Form.Item label="태그">
                  <Input
                    value={formData.tag}
                    onChange={(e) => handleChange("tag", e.target.value)}
                    placeholder="쉼표로 구분 (예: 가족, 데이트, 산책)"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="대표 이미지 (1개)">
                      <Input
                        value={formData.imagePath}
                        onChange={(e) => handleChange("imagePath", e.target.value)}
                        placeholder="대표 이미지 URL (한 개만 입력)"
                      />
                      {formData.imagePath && (
                        <img
                          src={formData.imagePath}
                          alt="대표 이미지 미리보기"
                          style={{
                            marginTop: 10,
                            width: "100%",
                            maxWidth: 400,
                            borderRadius: 8,
                            border: "1px solid #eee",
                          }}
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/400x250/EAEAEA/333333?text=No+Image")
                          }
                        />
                      )}
                    </Form.Item>
                    <Form.Item label="썸네일 이미지 (여러 개)">
                      <Input.TextArea
                        rows={4}
                        value={formData.thumbnailPath}
                        onChange={(e) => handleChange("thumbnailPath", e.target.value)}
                        placeholder="썸네일 이미지 URL을 여러 줄로 입력하거나 쉼표로 구분하세요."
                      />
                      {formData.thumbnailPath && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginTop: 10,
                          }}
                        >
                          {formData.thumbnailPath
                            .split(",")
                            .map((url) => url.trim())
                            .filter(Boolean)
                            .map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`썸네일-${i}`}
                                style={{
                                  width: 100,
                                  height: 100,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #eee",
                                }}
                                onError={(e) =>
                                  (e.target.src =
                                    "https://placehold.co/100x100/EAEAEA/333333?text=No+Img")
                                }
                              />
                            ))}
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="전화번호">
                      <Input
                        value={formData.phoneNo}
                        onChange={(e) => handleChange("phoneNo", e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="홈페이지">
                      <Input
                        value={formData.homepage}
                        onChange={(e) => handleChange("homepage", e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="주차정보">
                      <Input.TextArea
                        rows={3}
                        value={formData.parking}
                        onChange={(e) => handleChange("parking", e.target.value)}
                        placeholder="주차 가능 여부, 요금, 위치 등을 자유롭게 입력하세요."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="입장료">
                      <Input.TextArea
                        rows={3}
                        value={formData.fee}
                        onChange={(e) => handleChange("fee", e.target.value)}
                        placeholder="이용요금 정보를 여러 줄로 입력할 수 있습니다."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="이용시간">
                      <Input.TextArea
                        rows={3}
                        value={formData.hours}
                        onChange={(e) => handleChange("hours", e.target.value)}
                        placeholder="이용시간 정보를 여러 줄로 입력할 수 있습니다."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ textAlign: "right" }}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {isEditMode ? "수정 완료" : "등록"}
                  </Button>
                  <Button
                    onClick={() => navigate("/adm/travel")}
                    style={{ marginLeft: 8 }}
                    disabled={loading}
                  >
                    목록으로
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminTravelForm;