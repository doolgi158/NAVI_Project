import { useEffect, useState } from "react";
import {
    Table,
    Typography,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Form,
    InputNumber,
    DatePicker,
    Select,
    Input,
} from "antd";
import {
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

const { Option } = Select;
const API = "http://localhost:8080/api/admin/deliveries/reservations";

const AdminDeliveryReservationPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    /** ✅ 예약 목록 불러오기 */
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
    }, []);

    /** ✅ 수정 모달 열기 */
    const openModal = (record) => {
        setEditing(record);
        form.setFieldsValue({
            ...record,
            deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
        });
        setModalVisible(true);
    };

    /** ✅ 수정 요청 */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                deliveryDate: values.deliveryDate?.format("YYYY-MM-DD"),
            };

            await axios.put(`${API}/${editing.drsvId}`, payload);
            message.success("예약 정보가 수정되었습니다.");

            setModalVisible(false);
            fetchReservations();
        } catch {
            message.error("처리 중 오류가 발생했습니다.");
        }
    };

    /** ✅ 예약 삭제 */
    const handleDelete = async (drsvId) => {
        Modal.confirm({
            title: "예약 삭제",
            content: "정말로 이 예약을 삭제하시겠습니까?",
            okText: "삭제",
            cancelText: "취소",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await axios.delete(`${API}/${drsvId}`);
                    message.success("예약이 삭제되었습니다.");
                    fetchReservations();
                } catch {
                    message.error("삭제 중 오류가 발생했습니다.");
                }
            },
        });
    };

    /** ✅ 카카오 주소검색 (모달 대응 버전) */
    const handleAddressSearch = (field) => {
        setTimeout(() => {
            new window.daum.Postcode({
                oncomplete: (data) => {
                    const fullAddress = data.address;
                    setTimeout(() => {
                        form.setFieldsValue({ [field]: fullAddress });
                    }, 100);
                },
            }).open();
        }, 0);
    };

    /** ✅ 수정 모달 내부 Form */
    const renderModalForm = () => (
        <Form form={form} layout="vertical">
            <Form.Item label="회원 번호" name="userNo">
                <InputNumber disabled style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="회원명" name="userName">
                <Input disabled />
            </Form.Item>

            {/* ✅ 가방 정보 (JSON 표시용) */}
            <Form.Item label="가방 정보 (JSON)">
                <Input.TextArea
                    rows={3}
                    value={editing?.bagsJson || ""}
                    readOnly
                    style={{ backgroundColor: "#fafafa" }}
                />
            </Form.Item>

            {/* ✅ 주소 입력 */}
            <Form.Item label="출발지 주소" required>
                <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                        name="startAddr"
                        noStyle
                        rules={[{ required: true, message: "출발지 주소를 입력하세요." }]}
                    >
                        <Input readOnly placeholder="주소를 검색하세요" />
                    </Form.Item>
                    <Button
                        type="default"
                        onClick={() => handleAddressSearch("startAddr")}
                        style={{ minWidth: 70 }}
                    >
                        검색
                    </Button>
                </Space.Compact>
            </Form.Item>

            <Form.Item label="도착지 주소" required>
                <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                        name="endAddr"
                        noStyle
                        rules={[{ required: true, message: "도착지 주소를 입력하세요." }]}
                    >
                        <Input readOnly placeholder="주소를 검색하세요" />
                    </Form.Item>
                    <Button
                        type="default"
                        onClick={() => handleAddressSearch("endAddr")}
                        style={{ minWidth: 70 }}
                    >
                        검색
                    </Button>
                </Space.Compact>
            </Form.Item>

            <Form.Item
                label="배송일"
                name="deliveryDate"
                rules={[{ required: true, message: "배송일을 선택하세요." }]}
            >
                <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
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

    /** ✅ 테이블 컬럼 정의 */
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
            title: "가방 정보",
            dataIndex: "bagsJson",
            key: "bagsJson",
            width: 180,
            render: (v) => (v ? v : "-"),
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
                <Button icon={<ReloadOutlined />} onClick={fetchReservations}>
                    새로고침
                </Button>
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

            {/* ✅ 수정 모달 */}
            <Modal
                open={modalVisible}
                title="예약 수정"
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                okText="수정"
            >
                {renderModalForm()}
            </Modal>
        </AdminSectionCard>
    );
};

export default AdminDeliveryReservationPage;
