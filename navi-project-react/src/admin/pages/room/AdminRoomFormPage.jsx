import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Typography, Form, Input, InputNumber, Switch, Button, message, Space } from "antd";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";

const { Content } = Layout;
const { Title } = Typography;

const AdminRoomFormPage = () => {
    const { accNo, roomNo } = useParams(); // e.g., /admin/rooms/new/:accNo or /admin/rooms/edit/:roomNo
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!roomNo;

    // 수정 모드일 경우 기존 데이터 로드
    useEffect(() => {
        if (isEdit) {
            // 수정 모드
            const fetchRoom = async () => {
                try {
                    setLoading(true);
                    const res = await axios.get(`${API_SERVER_HOST}/api/adm/rooms/${roomNo}`);
                    if (res.data.status === 200 && res.data.data) {
                        const room = res.data.data;
                        console.log("🧾 불러온 room 데이터:", room);

                        form.setFieldsValue({
                            ...room,
                            hasWifi: !!room.hasWifi,
                            isActive: !!room.isActive,
                        });
                    } else {
                        message.error("객실 정보를 불러오지 못했습니다.");
                    }
                } catch {
                    message.error("객실 데이터 로드 실패");
                } finally {
                    setLoading(false);
                }
            };
            fetchRoom();
        } else {
            // 등록 모드
            form.setFieldsValue({
                roomCnt: 4,
                baseCnt: 2,
                maxCnt: 2,
                weekdayFee: 0,
                weekendFee: 0,
                hasWifi: true,
                isActive: true,
            });
        }
    }, [roomNo, isEdit]);

    // 제출 처리 (등록/수정 공용)
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            values.accNo = Number(accNo);

            console.log("🧾 전송 payload:", values);

            if (isEdit) {
                await axios.put(`${API_SERVER_HOST}/api/adm/rooms/edit/${roomNo}`, values);
                message.success("객실 수정 완료");
            } else {
                await axios.post(`${API_SERVER_HOST}/api/adm/rooms/new`, values);
                message.success("객실 등록 완료");
            }

            navigate("/adm/rooms", { state: { refresh: true } });
        } catch (err) {
            console.error(err);
            message.error("저장 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminSiderLayout />
            <Layout className="bg-gray-50">
                <Content className="p-6">
                    <Title level={3}>{isEdit ? "객실 수정" : "객실 등록"}</Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="객실명"
                            name="roomName"
                            rules={[{ message: "객실명을 입력해주세요." }]}
                        >
                            <Input placeholder="예: 더블룸" />
                        </Form.Item>

                        <Form.Item label="면적(㎡)" name="roomSize">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item label="객실 수" name="roomCnt">
                            <InputNumber min={1} />
                        </Form.Item>

                        <Space size="large">
                            <Form.Item label="기준 인원" name="baseCnt">
                                <InputNumber min={1} />
                            </Form.Item>

                            <Form.Item label="최대 인원" name="maxCnt">
                                <InputNumber min={1} />
                            </Form.Item>
                        </Space>

                        <Space size="large">
                            <Form.Item label="평일 요금" name="weekdayFee">
                                <InputNumber min={0} />
                            </Form.Item>

                            <Form.Item label="주말 요금" name="weekendFee">
                                <InputNumber min={0} />
                            </Form.Item>
                        </Space>

                        <Form.Item label="Wi-Fi 제공" name="hasWifi" valuePropName="checked">
                            <Switch checkedChildren="있음" unCheckedChildren="없음" />
                        </Form.Item>

                        <Form.Item label="활성화 여부" name="isActive" valuePropName="checked">
                            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
                        </Form.Item>

                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? "수정하기" : "등록하기"}
                            </Button>
                            <Button onClick={() => navigate(-1)}>취소</Button>
                        </Space>
                    </Form>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminRoomFormPage;