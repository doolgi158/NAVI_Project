import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { API_SERVER_HOST } from "@/common/api/naviApi";

const { Title } = Typography;

const AdminAccommodationListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 숙소 데이터 로드
    const fetchAccommodations = async (page = 1, keyword = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_SERVER_HOST}/api/admin/accommodations`, {
                params: { page: page - 1, size: pagination.pageSize, keyword },
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = res.data.data;
            setData(result.content || []);
            setPagination({
                ...pagination,
                total: result.totalElements || 0,
                current: result.number + 1,
            });
        } catch (err) {
            console.error("숙소 데이터 로드 실패:", err);
            message.error("숙소 데이터를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccommodations();
    }, []);

    // 등록 버튼 클릭
    const handleAdd = () => {
        form.resetFields();
        setSelectedAcc(null);
        setEditMode(false);
        setModalVisible(true);
    };

    // 수정 버튼 클릭
    const handleEdit = (record) => {
        setSelectedAcc(record);
        setEditMode(true);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    // 삭제 버튼 클릭
    const handleDelete = async (accNo) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${API_SERVER_HOST}/api/admin/accommodations/${accNo}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("숙소가 삭제되었습니다.");
            fetchAccommodations(pagination.current);
        } catch (err) {
            console.error("삭제 실패:", err);
            message.error("숙소 삭제에 실패했습니다.");
        }
    };

    // 등록 / 수정 제출
    const handleSubmit = async (values) => {
        try {
            const token = localStorage.getItem("accessToken");

            if (editMode && selectedAcc) {
                await axios.put(
                    `${API_SERVER_HOST}/api/admin/accommodations/${selectedAcc.accNo}`,
                    values,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success("숙소 정보가 수정되었습니다.");
            } else {
                await axios.post(`${API_SERVER_HOST}/api/admin/accommodations`, values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success("숙소가 등록되었습니다.");
            }

            setModalVisible(false);
            fetchAccommodations(pagination.current, searchKeyword);
        } catch (err) {
            console.error("등록/수정 실패:", err);
            message.error("요청 처리 중 오류가 발생했습니다.");
        }
    };

    // 테이블 컬럼 정의
    const columns = [
        {
            title: "번호",
            dataIndex: "accNo",
            width: 80,
            align: "center",
        },
        {
            title: "숙소명",
            dataIndex: "title",
            render: (text) => <b>{text}</b>,
        },
        {
            title: "카테고리",
            dataIndex: "category",
            width: 120,
        },
        {
            title: "주소",
            dataIndex: "address",
        },
        {
            title: "전화번호",
            dataIndex: "tel",
            width: 140,
        },
        {
            title: "관리",
            align: "center",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        수정
                    </Button>
                    <Popconfirm
                        title="삭제 확인"
                        description="이 숙소를 삭제하시겠습니까?"
                        okText="예"
                        cancelText="아니오"
                        onConfirm={() => handleDelete(record.accNo)}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminSiderLayout>
            <div style={{ padding: 24 }}>
                <Space align="center" style={{ marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        숙소 관리
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        style={{ marginLeft: 10 }}
                    >
                        숙소 등록
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchAccommodations(pagination.current, searchKeyword)}
                    >
                        새로고침
                    </Button>
                    <Input.Search
                        placeholder="숙소명 검색"
                        onSearch={(v) => {
                            setSearchKeyword(v);
                            fetchAccommodations(1, v);
                        }}
                        allowClear
                        style={{ width: 250, marginLeft: 20 }}
                    />
                </Space>

                <Table
                    rowKey="accNo"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        total: pagination.total,
                        pageSize: pagination.pageSize,
                        onChange: (page) => fetchAccommodations(page, searchKeyword),
                    }}
                    bordered
                />

                {/* 등록/수정 모달 */}
                <Modal
                    open={modalVisible}
                    title={editMode ? "숙소 수정" : "숙소 등록"}
                    okText={editMode ? "수정" : "등록"}
                    cancelText="취소"
                    onCancel={() => setModalVisible(false)}
                    onOk={() => form.submit()}
                >
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleSubmit}
                        initialValues={{
                            title: "",
                            category: "",
                            address: "",
                            tel: "",
                        }}
                    >
                        <Form.Item
                            label="숙소명"
                            name="title"
                            rules={[{ required: true, message: "숙소명을 입력하세요" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="카테고리"
                            name="category"
                            rules={[{ required: true, message: "카테고리를 입력하세요" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="주소"
                            name="address"
                            rules={[{ required: true, message: "주소를 입력하세요" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="전화번호"
                            name="tel"
                            rules={[{ required: true, message: "전화번호를 입력하세요" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminSiderLayout>
    );
};

export default AdminAccommodationListPage;