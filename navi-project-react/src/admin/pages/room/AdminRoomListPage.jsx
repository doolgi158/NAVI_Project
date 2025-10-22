import { useEffect, useState } from "react";
import {
    Layout, Table, Button, Space, Tag, Typography, Modal, message, Input, Select, Spin
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const AdminRoomListPage = () => {
    const [rooms, setRooms] = useState([]);
    const [displayRooms, setDisplayRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 30, total: 0 });
    const [accOptions, setAccOptions] = useState([]);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const navigate = useNavigate();

    // 숙소 목록 조회 (드롭다운용)
    const fetchAccOptions = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res?.data?.data || [];
            setAccOptions(data.map((a) => ({ label: a.title, value: a.accNo })));
        } catch (err) {
            console.error("숙소 목록 로드 실패:", err);
            message.error("숙소 목록을 불러오지 못했습니다.");
        }
    };

    // 객실 목록 조회
    const fetchRooms = async () => {
        if (!selectedAcc) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_SERVER_HOST}/api/adm/rooms`, {
                params: { accNo: selectedAcc, keyword },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res?.data?.data || [];
            setRooms(data);
            setDisplayRooms(data.slice(0, pagination.pageSize));
            setPagination((prev) => ({ ...prev, total: data.length, current: 1 }));
        } catch (err) {
            console.error("객실 데이터 로드 실패:", err);
            message.error("객실 데이터를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경
    const handlePageChange = (page, pageSize) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        setDisplayRooms(rooms.slice(start, end));
        setPagination({ current: page, pageSize, total: rooms.length });
    };

    // 삭제
    const handleDelete = (roomNo, roomName) => {
        Modal.confirm({
            title: "객실 삭제 확인",
            content: `정말 "${roomName}" 객실을 삭제하시겠습니까?`,
            okText: "삭제",
            okType: "danger",
            cancelText: "취소",
            async onOk() {
                try {
                    const token = localStorage.getItem("accessToken");
                    await axios.delete(`${API_SERVER_HOST}/api/adm/rooms/${roomNo}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    message.success("객실이 삭제되었습니다.");
                    fetchRooms();
                } catch (err) {
                    console.error("삭제 실패:", err);
                    message.error("객실 삭제 중 오류가 발생했습니다.");
                }
            },
        });
    };

    useEffect(() => {
        fetchAccOptions();
    }, []);

    // 테이블 컬럼 정의
    const columns = [
        { title: "번호", dataIndex: "roomNo", width: 80, align: "center" },
        { title: "코드", dataIndex: "roomId", width: 100, align: "center" },
        { title: "객실명", dataIndex: "roomName", width: 160 },
        { title: "면적(m²)", dataIndex: "roomSize", width: 100, align: "center" },
        { title: "기준/최대인원", render: (r) => `${r.baseCnt}/${r.maxCnt}`, width: 120, align: "center" },
        {
            title: "요금(평일/주말)",
            render: (r) => `${r.weekdayFee.toLocaleString()} / ${r.weekendFee.toLocaleString()}`,
            align: "right", width: 180,
        },
        {
            title: "와이파이",
            dataIndex: "hasWifi",
            width: 100,
            align: "center",
            render: (v) => (v ? <Tag color="green">O</Tag> : <Tag color="red">X</Tag>),
        },
        {
            title: "운영여부",
            dataIndex: "active",
            width: 120,
            align: "center",
            render: (v) => (v ? <Tag color="blue">운영중</Tag> : <Tag color="gray">중단</Tag>),
        },
        {
            title: "관리",
            align: "center",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/adm/rooms/edit/${record.roomNo}`)}
                    >
                        수정
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.roomNo, record.roomName)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminSiderLayout />
            <Layout style={{ padding: "24px" }}>
                <div style={{ padding: 24, background: "#fff", minHeight: "100%" }}>
                    <Space align="center" style={{ marginBottom: 16 }}>
                        <Title level={3} style={{ margin: 0 }}>객실 관리</Title>

                        <Select
                            showSearch
                            placeholder="숙소 선택"
                            style={{ width: 250 }}
                            options={accOptions}
                            onChange={(v) => setSelectedAcc(v)}
                        />

                        <Input.Search
                            placeholder="객실명 검색"
                            allowClear
                            style={{ width: 250 }}
                            onSearch={(kw) => {
                                setKeyword(kw);
                                fetchRooms();
                            }}
                        />

                        <Button icon={<ReloadOutlined />} onClick={fetchRooms}>새로고침</Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/adm/rooms/new")}
                        >
                            객실 등록
                        </Button>
                    </Space>

                    {loading ? (
                        <Spin tip="로딩 중..." />
                    ) : (
                        <Table
                            rowKey="roomNo"
                            columns={columns}
                            dataSource={displayRooms}
                            bordered
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "30", "50", "100"],
                                onChange: handlePageChange,
                                onShowSizeChange: handlePageChange,
                                showTotal: (total) => `총 ${total.toLocaleString()} 개 객실`,
                            }}
                        />
                    )}
                </div>
            </Layout>
        </Layout>
    );
};

export default AdminRoomListPage;