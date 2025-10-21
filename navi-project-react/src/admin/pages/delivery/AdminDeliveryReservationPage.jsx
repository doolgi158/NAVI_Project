import { useEffect, useRef, useState } from "react";
import {
    Table,
    Typography,
    Button,
    Space,
    Tag,
    Input,
    message,
    Modal,
    Form,
    InputNumber,
    DatePicker,
    Select,
} from "antd";
import {
    ReloadOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

const { Option } = Select;
const API = "http://localhost:8080/api/admin/deliveries/reservations";
const BAG_API = "http://localhost:8080/api/admin/deliveries/bags"; // ✅ 가방 목록용

const AdminDeliveryReservationPage = () => {
    const [reservations, setReservations] = useState([]);
    const [bags, setBags] = useState([]); // ✅ 가방 목록 상태 추가
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // ✅ 가방 목록 불러오기
    const fetchBags = async () => {
        try {
            const res = await axios.get(BAG_API);
            const result = res.data;
            setBags(Array.isArray(result) ? result : []);
        } catch {
            message.error("가방 정보를 불러오지 못했습니다.");
        }
    };

    // ✅ 예약 목록 불러오기
    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            const result = res.data?.data;
            setReservations(Array.isArray(result) ? result : []);
        } catch {
            message.error("배송 예약 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchBags(); // ✅ 가방 목록도 함께 불러오기
    }, []);

    /** ✅ 등록 / 수정 모달 열기 */
    const openModal = (record = null) => {
        setEditing(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    /** ✅ 등록 / 수정 요청 */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                deliveryDate: values.deliveryDate?.format("YYYY-MM-DD"),
            };

            if (editing) {
                await axios.put(`${API}/${editing.drsvId}`, payload);
                message.success("예약 정보가 수정되었습니다.");
            } else {
                await axios.post(API, payload);
                message.success("예약이 등록되었습니다.");
            }

            setModalVisible(false);
            fetchReservations();
        } catch {
            message.error("처리 중 오류가 발생했습니다.");
        }
    };

    // ✅ 수정/등록 모달 내부 Form
    const renderModalForm = () => (
        <Form form={form} layout="vertical">
            {!editing && (
                <>
                    <Form.Item
                        label="예약 ID"
                        name="drsvId"
                        rules={[{ required: true, message: "예약 ID를 입력하세요." }]}
                    >
                        <Input placeholder="예: D202510210001" />
                    </Form.Item>
                    <Form.Item
                        label="회원 번호"
                        name="userNo"
                        rules={[{ required: true, message: "회원 번호를 입력하세요." }]}
                    >
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </>
            )}

            {editing && (
                <>
                    <Form.Item label="회원 번호" name="userNo">
                        <InputNumber disabled style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="회원명" name="userName">
                        <Input disabled />
                    </Form.Item>
                </>
            )}

            {/* ✅ 가방 선택 */}
            <Form.Item
                label="가방 선택"
                name="bagId"
                rules={[{ required: true, message: "가방을 선택하세요." }]}
            >
                <Select placeholder="가방을 선택하세요">
                    {bags.map((bag) => (
                        <Option key={bag.bagId} value={bag.bagId}>
                            {`${bag.bagName} - ${bag.price.toLocaleString()}원`}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="출발지 주소"
                name="startAddr"
                rules={[{ required: true, message: "출발지 주소를 입력하세요." }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="도착지 주소"
                name="endAddr"
                rules={[{ required: true, message: "도착지 주소를 입력하세요." }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="배송일"
                name="deliveryDate"
                rules={[{ required: true, message: "배송일을 선택하세요." }]}
            >
                <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
                label="총 금액"
                name="totalPrice"
                rules={[{ required: true, message: "총 금액을 입력하세요." }]}
            >
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
                label="상태"
                name="status"
                rules={[{ required: true, message: "상태를 선택하세요." }]}
            >
                <Select>
                    <Option value="PENDING">PENDING</Option>
                    <Option value="PAID">PAID</Option>
                    <Option value="CANCELLED">CANCELLED</Option>
                    <Option value="FAILED">FAILED</Option>
                </Select>
            </Form.Item>
        </Form>
    );

    // ✅ Table 컬럼 정의 (return 위에 추가)
    const columns = [
        {
            title: "예약 ID",
            dataIndex: "drsvId",
            key: "drsvId",
            width: 160,
            sorter: (a, b) => a.drsvId.localeCompare(b.drsvId),
        },
        {
            title: "회원명",
            dataIndex: "userName",
            key: "userName",
            width: 120,
            sorter: (a, b) => a.userName.localeCompare(b.userName),
        },
        {
            title: "출발지",
            dataIndex: "startAddr",
            key: "startAddr",
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.startAddr.localeCompare(b.startAddr),
        },
        {
            title: "도착지",
            dataIndex: "endAddr",
            key: "endAddr",
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.endAddr.localeCompare(b.endAddr),
        },
        {
            title: "가방명",
            dataIndex: "bagName",
            key: "bagName",
            width: 140,
            render: (v, record) =>
                record.bagName
                    ? `${record.bagName} (${record.bagPrice?.toLocaleString()}원)`
                    : "-",
        },
        {
            title: "총 금액",
            dataIndex: "totalPrice",
            key: "totalPrice",
            width: 120,
            align: "right",
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (v) => (v ? v.toLocaleString() + "원" : "-"),
        },
        {
            title: "배송일",
            dataIndex: "deliveryDate",
            key: "deliveryDate",
            width: 140,
            align: "center",
            render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
        },
        {
            title: "상태",
            dataIndex: "status",
            key: "status",
            width: 120,
            align: "center",
            render: (value) => {
                const statusColors = {
                    PENDING: "default",
                    PAID: "blue",
                    CANCELLED: "volcano",
                    FAILED: "red",
                    COMPLETED: "green",
                };
                return <Tag color={statusColors[value]}>{value}</Tag>;
            },
        },
        {
            title: "액션",
            key: "action",
            width: 180,
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
                        수정
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.drsvId)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AdminSectionCard
            title="배송 예약 관리"
            extra={
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchReservations}>
                        새로고침
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                        예약 등록
                    </Button>
                </Space>
            }
        >
            <Table
                rowKey="drsvId"
                loading={loading}
                dataSource={reservations}
                columns={columns}
                bordered
                scroll={{ x: 1300 }}
            />

            {/* ✅ 등록 / 수정 모달 */}
            <Modal
                open={modalVisible}
                title={editing ? "예약 수정" : "예약 등록"}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                okText={editing ? "수정" : "등록"}
            >
                {renderModalForm()}
            </Modal>
        </AdminSectionCard>
    );
};

export default AdminDeliveryReservationPage;
