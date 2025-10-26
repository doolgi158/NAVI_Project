import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveAdminTravel, fetchAdminTravelDetail } from "../../../common/api/adminTravelApi";
import { Form, Input, InputNumber, Checkbox, Button, Alert, Card, Row, Col, message, AutoComplete, Radio, Layout } from "antd";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import TravelEditor from "./TravelEditor";
import dayjs from "dayjs";

const { Content, Header } = Layout;

/** ✅ 제주 하위 지역 목록 */
const JEJU_SUBREGIONS = {
    제주시: ["제주시내", "애월", "한림", "한경", "조천", "구좌", "우도", "추자"],
    서귀포시: ["성산", "서귀포시내", "대정", "안덕", "중문", "남원", "표선"],
};

/** ✅ 카테고리 목록 */
const CATEGORY_OPTIONS = ["관광지", "음식점", "쇼핑"];

const initialForm = {
    travelId: null,
    title: "",
    categoryName: "",
    introduction: "",
    description: "",
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
    const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

    return new Promise((resolve, reject) => {
        // services 객체와 load 함수가 모두 있는지 확인
        if (window.kakao?.maps?.services && window.kakao.maps.load) {
            console.log("✅ Kakao SDK (services) 이미 로드됨");
            resolve();
            return;
        }

        const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
        if (existingScript) {
            // 이미 스크립트가 있다면 load 함수가 있는지 확인하고 실행 (경우의 수를 단순화)
            if (window.kakao?.maps?.load) {
                console.log("⏳ Kakao SDK 스크립트 존재. load 함수 실행 대기 중...");
                window.kakao.maps.load(() => {
                    if (window.kakao.maps.services) {
                        console.log("✅ Kakao SDK load() 완료");
                        resolve();
                    } else {
                        reject(new Error("Kakao SDK load() 후 services 객체 없음"));
                    }
                });
            } else {
                reject(new Error("Kakao SDK 스크립트는 있으나 load 함수가 준비되지 않음"));
            }
            return;
        }

        const script = document.createElement("script");
        // 🚨 핵심 수정: autoload=false 추가
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`;
        // 🚨 수정: async 제거 (document.write 경고 방지 및 순서 보장)
        // script.async = true; 

        script.onload = () => {
            console.log("✅ Kakao SDK 스크립트 로드 완료. load 함수 실행.");

            // 로드가 완료되면 load 함수를 호출하여 Geocoder 서비스 초기화
            window.kakao.maps.load(() => {
                if (window.kakao.maps.services) {
                    console.log("✅ Kakao SDK load() 완료. Geocoder 사용 준비됨.");
                    resolve();
                } else {
                    console.error("❌ Kakao SDK load() 후 services 객체 생성 실패");
                    reject(new Error("Kakao SDK load() 후 services 객체 생성 실패"));
                }
            });
        };
        script.onerror = () => {
            console.error("❌ Kakao SDK 로드 실패 (onerror)");
            reject(new Error("Kakao SDK load error"));
        };
        document.head.appendChild(script);
    });
}

/** 읍/면/동 앞까지만 남기기 */
function trimEupMyeonDong(name) {
    if (!name) return "";
    const m = name.match(/^(.*?)(읍|면|동)/);
    return m ? m[1] : name;
}

export default function AdminTravelForm() {
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
                const travel = data.travel || data;
                const cleanedThumbnails = (travel.thumbnailPath || "")
                    .replace(/\n/g, "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(",");

                setFormData({
                    ...initialForm,
                    ...travel,
                    description: travel.description || "",
                    categoryName: travel.categoryName || "",
                    thumbnailPath: cleanedThumbnails,
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
        console.log("📍 주소 검색 시작"); // **[디버깅 포인트 1]**

        if (!window.daum?.Postcode) {
            message.error("주소검색 모듈을 불러올 수 없습니다.");
            console.error("❌ Daum Postcode 모듈 없음");
            return;
        }

        new window.daum.Postcode({
            oncomplete: async (data) => {
                console.log("✅ Daum Postcode 완료, 데이터:", data); // **[디버깅 포인트 2]**

                // ✅ 지번주소 → 도로명주소 → 기본주소 순서로 검색
                const fullAddr = data.jibunAddress || data.roadAddress || data.address;
                const roadAddr = data.roadAddress || "";
                const jibunAddr = data.jibunAddress || "";
                console.log("🎯 변환 대상 주소 (fullAddr):", fullAddr);

                try {
                    await ensureKakaoReady();
                    console.log("✅ Kakao SDK 준비 완료 (Geocoder 사용 가능)"); // **[디버깅 포인트 3]**
                } catch (err) {
                    message.error("지도 모듈 로드 실패");
                    console.error("❌ Kakao SDK 준비 실패:", err);
                    return;
                }

                const geocoder = new window.kakao.maps.services.Geocoder();

                // ✅ 성공 처리
                const handleSuccess = (r) => {
                    console.log("✅ Geocoder 변환 결과 (Raw Result):", r); // **[디버깅 포인트 5]**
                    const { x, y } = r;
                    const a = r.road_address || r.address;

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

                    console.log("📍 최종 변환 데이터:", { // **[디버깅 포인트 6]**
                        region1Name,
                        region2Name,
                        longitude: parseFloat(x),
                        latitude: parseFloat(y),
                    });

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
                };

                // ✅ 주소 변환 시도 (제주특별자치도 제거 재시도 포함)
                const trySearch = (query, retried = false) => {
                    console.log(`🔍 Geocoding 요청 시도 ${retried ? "(재시도)" : ""}:`, query); // **[디버깅 포인트 4]**

                    geocoder.addressSearch(query, (results, status) => {
                        console.log("🔍 Geocoder 응답 상태:", status);
                        console.log("🔍 Geocoder 응답 결과:", results);

                        if (status === window.kakao.maps.services.Status.OK && results.length) {
                            handleSuccess(results[0]);
                        } else if (!retried && query.includes("제주특별자치도")) {
                            const shorter = query.replace("제주특별자치도", "").trim();
                            console.warn("📍 재시도 (제주특별자치도 제거):", shorter);
                            trySearch(shorter, true);
                        } else {
                            console.error("❌ 주소 좌표 변환 실패:", query, status);
                            message.warning("주소 좌표 변환 실패");
                        }
                    });
                };

                trySearch(fullAddr);
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

                                <Form.Item label="카테고리 선택" required>
                                    <Radio.Group
                                        value={formData.categoryName}
                                        onChange={(e) => handleChange("categoryName", e.target.value)}
                                        buttonStyle="solid"
                                    >
                                        {CATEGORY_OPTIONS.map((cat) => (
                                            <Radio.Button key={cat} value={cat}>
                                                {cat}
                                            </Radio.Button>
                                        ))}
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item label="소개">
                                    <Input.TextArea
                                        rows={4}
                                        value={formData.introduction}
                                        onChange={(e) => handleChange("introduction", e.target.value)}
                                        placeholder="간단한 한줄 소개를 입력하세요"
                                    />
                                </Form.Item>

                                <Form.Item label="본문 (상세 소개 / 블로그 형식)">
                                    {formData.description !== undefined && (
                                        <TravelEditor
                                            value={formData.description || ""}
                                            onChange={(val) => handleChange("description", val)}
                                        />
                                    )}
                                </Form.Item>

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