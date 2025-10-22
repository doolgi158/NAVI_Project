import { useEffect, useState } from "react";
import {
    Layout, Form, Input, InputNumber, Switch, Button, Space,
    Typography, message, Spin, Card
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { SaveOutlined, RollbackOutlined } from "@ant-design/icons";

const { Title } = Typography;

const AdminAccFormPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { accNo } = useParams(); // 수정 모드일 때 URL 파라미터
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(!!accNo);

    // 숙소 상세 불러오기 (수정모드)
    useEffect(() => {
        if (!accNo) return; // 등록모드일 때 스킵
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("accessToken");
                const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations/edit/${accNo}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res?.data?.data;
                if (!data) throw new Error("숙소 정보를 불러올 수 없습니다.");

                form.setFieldsValue(data);
                setIsEdit(true);
            } catch (err) {
                console.error("숙소 조회 실패:", err);
                message.error("숙소 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [accNo, form]);

    // 등록 / 수정 요청
    const handleSubmit = async (values) => {
        try {
            const token = localStorage.getItem("accessToken");
            setLoading(true);

            if (isEdit) {
                await axios.put(`${API_SERVER_HOST}/api/adm/accommodations/edit/${accNo}`, values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success("숙소 정보가 수정되었습니다.");
            } else {
                await axios.post(`${API_SERVER_HOST}/api/adm/accommodations/new`, values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success("새 숙소가 등록되었습니다.");
            }

            navigate("/adm/accommodations");
        } catch (err) {
            console.error("저장 실패:", err);
            message.error("저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminSiderLayout />
            <Layout style={{ padding: "24px" }}>
                <div style={{ padding: 24, background: "#fff", minHeight: "100%" }}>
                    <Space align="center" style={{ marginBottom: 20 }}>
                        <Title level={3}>{isEdit ? "숙소 수정" : "숙소 등록"}</Title>
                    </Space>

                    {loading ? (
                        <Spin tip="불러오는 중..." />
                    ) : (
                        <Card>
                            <Form
                                layout="vertical"
                                form={form}
                                onFinish={handleSubmit}
                                initialValues={{
                                    category: "미확인",
                                    checkInTime: "15:00",
                                    checkOutTime: "11:00",
                                    hasCooking: false,
                                    hasParking: false,
                                    active: true,
                                    deletable: false,
                                }}
                            >
                                {/* 숙소 기본 정보 */}
                                <Form.Item
                                    label="숙소명"
                                    name="title"
                                    rules={[{ required: true, message: "숙소명을 입력하세요" }]}
                                >
                                    <Input placeholder="예: 제주 힐스테이" />
                                </Form.Item>

                                <Form.Item
                                    label="숙소 유형"
                                    name="category"
                                    rules={[{ required: true, message: "숙소 유형을 입력하세요" }]}
                                >
                                    <Input placeholder="예: 호텔, 펜션, 게스트하우스 등" />
                                </Form.Item>

                                <Form.Item
                                    label="전화번호"
                                    name="tel"
                                    rules={[{ required: true, message: "전화번호를 입력하세요" }]}
                                >
                                    <Input placeholder="예: 064-123-4567" />
                                </Form.Item>

                                <Form.Item
                                    label="주소"
                                    name="address"
                                    rules={[{ required: true, message: "주소를 입력하세요" }]}
                                >
                                    <Input placeholder="예: 제주특별자치도 제주시 애월읍 곽지리 123" />
                                </Form.Item>

                                <Form.Item
                                    label="숙소 설명"
                                    name="overview"
                                    rules={[{ required: false }]}
                                >
                                    <Input.TextArea rows={4} placeholder="숙소에 대한 설명을 입력하세요" />
                                </Form.Item>

                                <Form.Item
                                    label="지역 ID"
                                    name="townshipId"
                                    rules={[{ required: true, message: "지역 ID를 입력하세요" }]}
                                >
                                    <InputNumber min={1} placeholder="예: 5" style={{ width: "100%" }} />
                                </Form.Item>

                                <Form.Item
                                    label="로컬 이미지 경로"
                                    name="localImagePath"
                                    tooltip="서버에서 관리되는 로컬 이미지 경로입니다."
                                >
                                    <Input placeholder="예: /uploads/hotel123.jpg" />
                                </Form.Item>

                                <Form.Item label="체크인 시간" name="checkInTime">
                                    <Input placeholder="15:00" />
                                </Form.Item>

                                <Form.Item label="체크아웃 시간" name="checkOutTime">
                                    <Input placeholder="11:00" />
                                </Form.Item>

                                <Form.Item label="취사 가능" name="hasCooking" valuePropName="checked">
                                    <Switch checkedChildren="가능" unCheckedChildren="불가" />
                                </Form.Item>

                                <Form.Item label="주차 가능" name="hasParking" valuePropName="checked">
                                    <Switch checkedChildren="가능" unCheckedChildren="불가" />
                                </Form.Item>

                                <Form.Item label="운영 상태" name="active" valuePropName="checked">
                                    <Switch checkedChildren="운영중" unCheckedChildren="중단" />
                                </Form.Item>

                                <Form.Item label="삭제 가능" name="deletable" valuePropName="checked">
                                    <Switch checkedChildren="가능" unCheckedChildren="불가" />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<SaveOutlined />}
                                            loading={loading}
                                        >
                                            {isEdit ? "수정하기" : "등록하기"}
                                        </Button>
                                        <Button
                                            icon={<RollbackOutlined />}
                                            onClick={() => navigate("/admin/accommodation/list")}
                                        >
                                            목록으로
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Card>
                    )}
                </div>
            </Layout>
        </Layout>
    );
};

export default AdminAccFormPage;