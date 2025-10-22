import { useEffect, useState, useRef } from "react";
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
    SearchOutlined,
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

    // ✅ 검색 관련 상태
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    /** ✅ 검색 필터 설정 */
    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={placeholder || `${dataIndex} 검색`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        검색
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        초기화
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : "",
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <span style={{ backgroundColor: "#ffc069", padding: 0 }}>{text}</span>
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

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

    /** ✅ 수정 버튼 클릭 시 모달 열기 */
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
            totalPrice: record.totalPrice,
            status: record.status,
        });
        setModalVisible(true);
    };

    /** ✅ 수정 확정 */
    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...editing,
                status: values.status,
            };
            await axios.put(`${API}/${editing.drsvId}`, payload);
            message.success("상태가 수정되었습니다.");
            setModalVisible(false);
            fetchReservations();
        } catch (err) {
            message.error("수정 실패");
        }
    };

    /** ✅ 삭제 */
    const handleDelete = async (record) => {
        Modal.confirm({
            title: "예약 삭제 확인",
            content: `예약 ID ${record.drsvId}를 정말 삭제하시겠습니까?`,
            okText: "삭제",
            okType: "danger",
            cancelText: "취소",
            async onOk() {
                try {
                    await axios.delete(`${API}/${record.drsvId}`);
                    message.success("삭제 완료");
                    fetchReservations();
                } catch {
                    message.error("삭제 실패");
                }
            },
        });
    };

    /** ✅ 테이블 컬럼 정의 */
    const columns = [
        {
            title: "예약 ID",
            dataIndex: "drsvId",
            key: "drsvId",
            width: 160,
            align: "center",
            sorter: (a, b) => a.drsvId.localeCompare(b.drsvId),
            ...getColumnSearchProps("drsvId", "예약 ID 검색"),
        },
        {
            title: "회원명",
            dataIndex: "userName",
            key: "userName",
            align: "center",
            sorter: (a, b) => a.userName.localeCompare(b.userName),
            ...getColumnSearchProps("userName", "회원명 검색"),
        },
        {
            title: "출발지",
            dataIndex: "startAddr",
            key: "startAddr",
            align: "center",
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.startAddr.localeCompare(b.startAddr),
            ...getColumnSearchProps("startAddr", "출발지 검색"),
        },
        {
            title: "도착지",
            dataIndex: "endAddr",
            key: "endAddr",
            align: "center",
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.endAddr.localeCompare(b.endAddr),
            ...getColumnSearchProps("endAddr", "도착지 검색"),
        },
        {
            title: "상태",
            dataIndex: "status",
            key: "status",
            align: "center",
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: [
                { text: "PENDING", value: "PENDING" },
                { text: "PAID", value: "PAID" },
                { text: "CANCELLED", value: "CANCELLED" },
                { text: "FAILED", value: "FAILED" },
                { text: "COMPLETE", value: "COMPLETE" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (value) => {
                const colors = {
                    PENDING: "default",
                    PAID: "blue",
                    CANCELLED: "volcano",
                    FAILED: "red",
                    COMPLETE: "green",
                };
                return <Tag color={colors[value]}>{value}</Tag>;
            },
        },
        {
            title: "배송일",
            dataIndex: "deliveryDate",
            align: "center",
            sorter: (a, b) =>
                new Date(a.deliveryDate) - new Date(b.deliveryDate),
            render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
        },
        {
            title: "총 금액",
            dataIndex: "totalPrice",
            align: "center",
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (v) => (v ? v.toLocaleString() + "원" : "-"),
        },
        {
            title: "등록일",
            dataIndex: "createdAt",
            align: "center",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
        },
        {
            title: "관리",
            key: "action",
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        상태변경
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record)}
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
            extra={<Button icon={<ReloadOutlined />} onClick={fetchReservations}>새로고침</Button>}
        >
            <Table
                rowKey="drsvId"
                loading={loading}
                dataSource={reservations}
                columns={columns}
                bordered
                style={{
                    minWidth: "100%",
                    tableLayout: "auto",
                    whiteSpace: "nowrap",
                }}
                scroll={{ x: "max-content" }}
            />

            {/* ✅ 상태 변경 모달 */}
            <Modal
                title="배송 예약 상태 변경"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleUpdate}
                okText="변경 완료"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="배송일" name="deliveryDate">
                        <DatePicker style={{ width: "100%" }} disabled />
                    </Form.Item>
                    <Form.Item label="총 금액" name="totalPrice">
                        <InputNumber style={{ width: "100%" }} disabled />
                    </Form.Item>
                    <Form.Item name="status" label="상태">
                        <Select>
                            <Option value="PENDING">PENDING</Option>
                            <Option value="PAID">PAID</Option>
                            <Option value="CANCELLED">CANCELLED</Option>
                            <Option value="FAILED">FAILED</Option>
                            <Option value="COMPLETE">COMPLETE</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </AdminSectionCard>
    );
};

export default AdminDeliveryReservationPage;
