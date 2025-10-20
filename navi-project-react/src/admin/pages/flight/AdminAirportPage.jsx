import { Table, Button, Input, Space, Modal, Form, message, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/airports";

const AdminAirportPage = () => {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null); // ✅ 수정 모드 여부
    const [form] = Form.useForm();

    // ✅ 공항 목록 조회
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

    // ✅ 공항 등록 또는 수정
    const handleSubmit = async (values) => {
        try {
            if (editing) {
                // ✏️ 수정 요청
                await axios.put(`${API}/${editing.airportCode}`, values);
                message.success("공항 정보가 수정되었습니다.");
            } else {
                // ➕ 등록 요청
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

    // ✅ 수정 버튼 클릭 시
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue(record);
        setOpen(true);
    };

    // ✅ 공항 삭제
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

    // ✅ 테이블 컬럼
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
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.airportCode)}
                    />
                </Space>
            ),
        },
    ];

    // ✅ 검색 필터링
    const filtered = airports.filter((a) =>
        a.airportName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Title level={4} style={{ margin: 0 }}>
                    공항 관리
                </Title>

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
                    >
                        공항 등록
                    </Button>
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={filtered}
                loading={loading}
                rowKey="airportCode"
                pagination={false}
                size="small"
                bordered
            />

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

                    <Button type="primary" htmlType="submit" block>
                        {editing ? "수정" : "등록"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminAirportPage;
