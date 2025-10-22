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
    const [bags, setBags] = useState({ S: 0, M: 0, L: 0 });

    // ✅ 검색 관련 상태
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    /** ✅ JSON 보기좋게 */
    const formatBagsJson = (jsonString) => {
        if (!jsonString) return "-";
        try {
            const bags = JSON.parse(jsonString);
            const labels = { S: "소형", M: "중형", L: "대형" };
            return Object.entries(bags)
                .filter(([_, count]) => count > 0)
                .map(([k, v]) => `${labels[k]} ${v}개`)
                .join(" / ") || "-";
        } catch {
            return jsonString;
        }
    };

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

    /** ✅ 테이블 컬럼 정의 (검색 + 정렬 추가) */
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
                        onClick={() => console.log(record)}
                    >
                        수정
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => console.log(record)}
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
        </AdminSectionCard>
    );
};

export default AdminDeliveryReservationPage;
