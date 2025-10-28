import { Table, Button, Input, Space, Modal, Form, message, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminSectionCard from "../../layout/flight/AdminSectionCard"; // ✅ 추가

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/airports";

const AdminAirportPage = () => {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    /** ✅ 공항 목록 조회 */
    const fetchAirports = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setAirports(res.data);
        } catch {
            message.error("공항 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAirports();
    }, []);

    /** ✅ 등록/수정 */
    const handleSubmit = async (values) => {
        try {
            if (editing) {
                await axios.put(`${API}/${editing.airportCode}`, values);
                message.success("공항 정보가 수정되었습니다.");
            } else {
                await axios.post(API, values);
                message.success("공항이 등록되었습니다.");
            }
            setOpen(false);
            form.resetFields();
            setEditing(null);
            fetchAirports();
        } catch {
            message.error("요청 처리 중 오류가 발생했습니다.");
        }
    };

    /** ✅ 수정 버튼 */
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue(record);
        setOpen(true);
    };

    /** ✅ 삭제 */
    const handleDelete = (code) => {
        Modal.confirm({
            title: "공항 삭제",
            content: "정말 삭제하시겠습니까?",
            okText: "삭제",
            okButtonProps: { danger: true },
            cancelText: "취소",
            onOk: async () => {
                try {
                    await axios.delete(`${API}/${code}`);
                    message.success("삭제되었습니다.");
                    fetchAirports();
                } catch {
                    message.error("삭제 실패");
                }
            },
        });
    };

    /** ✅ 컬럼 정의 */
    const columns = [
        {
            title: "공항코드",
            dataIndex: "airportCode",
            align: "center",
            width: 120,
            render: (text) => <b>{text}</b>,
        },
        {
            title: "공항명",
            dataIndex: "airportName",
            align: "center",
        },
        {
            title: "관리",
            key: "actions",
            align: "center",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        수정
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.airportCode)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    /** ✅ 검색 필터 */
    const filtered = airports.filter((a) =>
        a.airportName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <AdminSectionCard
                title="공항 관리"
                extra={
                    <Space>
                        <Input
                            placeholder="공항명 검색"
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditing(null);
                                form.resetFields();
                                setOpen(true);
                            }}
                            style={{
                                borderRadius: 8,
                                fontWeight: 600,
                                border: "none",
                            }}
                        >
                            공항 등록
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filtered}
                    loading={loading}
                    rowKey="airportCode"
                    pagination={false}
                    size="middle"
                    bordered
                    style={{
                        minWidth: "100%",
                        tableLayout: "auto",
                        whiteSpace: "nowrap",
                    }}
                />
            </AdminSectionCard>

            {/* ✅ 등록/수정 모달 */}
            <Modal
                title={editing ? "공항 수정" : "공항 등록"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="공항 코드"
                        name="airportCode"
                        rules={[{ required: true, message: "공항 코드를 입력하세요." }]}
                    >
                        <Input placeholder="예: CJU" disabled={!!editing} />
                    </Form.Item>

                    <Form.Item
                        label="공항명"
                        name="airportName"
                        rules={[{ required: true, message: "공항명을 입력하세요." }]}
                    >
                        <Input placeholder="예: 제주" />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        style={{
                            borderRadius: 8,
                            background: "#2563eb",
                            border: "none",
                            height: 40,
                            fontWeight: 600,
                        }}
                    >
                        {editing ? "수정" : "등록"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminAirportPage;
