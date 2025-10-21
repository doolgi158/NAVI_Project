// src/admin/pages/delivery/AdminBagPage.jsx
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Typography, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard"; // 경로 확인 (common 폴더면 수정)

// ✅ 상수
const { Title } = Typography;
const API = "http://localhost:8080/api/admin/deliveries/bags";

const AdminBagPage = () => {
    const [bags, setBags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    // ✅ 목록 조회
    const fetchBags = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setBags(res.data);
        } catch {
            message.error("가방 요금표를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBags();
    }, []);

    // ✅ 등록 / 수정
    const handleSave = async (values) => {
        try {
            if (editing) {
                await axios.put(`${API}/${editing.bagId}`, values);
                message.success("가방 요금이 수정되었습니다.");
            } else {
                await axios.post(API, values);
                message.success("가방 요금이 등록되었습니다.");
            }
            fetchBags();
            setIsModalOpen(false);
            setEditing(null);
            form.resetFields();
        } catch {
            message.error("저장 중 오류가 발생했습니다.");
        }
    };

    // ✅ 삭제
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/${id}`);
            message.success("삭제 완료");
            fetchBags();
        } catch {
            message.error("삭제 실패");
        }
    };

    // ✅ 컬럼 정의
    const columns = [
        { title: "ID", dataIndex: "bagId", key: "bagId", width: 80, align: "center" },
        { title: "분류 코드", dataIndex: "bagCode", key: "bagCode", align: "center" },
        { title: "가방 크기", dataIndex: "bagName", key: "bagName", align: "center" },
        { title: "가격(₩)", dataIndex: "price", key: "price", align: "center" },
        {
            title: "생성일",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            render: (val) => (val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-"),
        },
        {
            title: "수정일",
            dataIndex: "updatedAt",
            key: "updatedAt",
            align: "center",
            render: (val) => (val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-"),
        },
        {
            title: "관리",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    >
                        수정
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.bagId)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AdminSectionCard
            title="가방 요금표 관리"
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null);
                        setIsModalOpen(true);
                        form.resetFields();
                    }}
                >
                    새 가방 추가
                </Button>
            }
        >
            <Table
                rowKey="bagId"
                loading={loading}
                dataSource={bags}
                columns={columns}
                bordered
            />

            <Modal
                title={editing ? "가방 요금 수정" : "새 가방 등록"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditing(null);
                }}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item label="가방 코드" name="bagCode" rules={[{ required: true }]}>
                        <Input placeholder="예: S, M, L" />
                    </Form.Item>
                    <Form.Item label="가방 이름" name="bagName" rules={[{ required: true }]}>
                        <Input placeholder="예: 소형 수하물" />
                    </Form.Item>
                    <Form.Item label="가격(₩)" name="price" rules={[{ required: true }]}>
                        <InputNumber min={0} step={1000} style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminSectionCard>
    );
};

export default AdminBagPage;
