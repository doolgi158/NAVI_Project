// src/admin/pages/flight/AdminSeatPage.jsx
import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Typography, Modal } from "antd";
import { SearchOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";
import AdminSearchBar from "../../layout/flight/AdminSearchBar";
import dayjs from "dayjs";

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/seats";

const AdminSeatPage = () => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    /* 좌석 목록 조회 */
    const fetchSeats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSeats(res.data || []);
        } catch {
            message.error("좌석 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeats();
    }, []);

    /* 좌석 삭제 */
    const handleDelete = (seatId) => {
        Modal.confirm({
            title: "좌석 삭제",
            content: "정말 삭제하시겠습니까?",
            okText: "삭제",
            okButtonProps: { danger: true },
            cancelText: "취소",
            onOk: async () => {
                try {
                    const token = localStorage.getItem("accessToken");
                    await axios.delete(`${API}/${seatId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    message.success("삭제되었습니다.");
                    fetchSeats();
                } catch {
                    message.error("삭제 실패");
                }
            },
        });
    };

    /* 테이블 컬럼 */
    const columns = [
        {
            title: "좌석 ID",
            dataIndex: "seatId",
            align: "center",
            width: 160,
            render: (t) => <b>{t}</b>,
        },
        {
            title: "항공편명",
            dataIndex: "flightId",
            align: "center",
            width: 140,
        },
        {
            title: "좌석번호",
            dataIndex: "seatNo",
            align: "center",
            width: 100,
        },
        {
            title: "좌석등급",
            dataIndex: "seatClass",
            align: "center",
            width: 120,
            render: (cls) => (
                <Tag color={cls === "ECONOMY" ? "green" : "blue"}>
                    {cls === "ECONOMY" ? "일반석" : "비즈니스석"}
                </Tag>
            ),
        },
        {
            title: "예약여부",
            dataIndex: "reserved",
            align: "center",
            width: 100,
            render: (v) =>
                v ? <Tag color="red">예약됨</Tag> : <Tag color="default">가능</Tag>,
        },
        {
            title: "등록일",
            dataIndex: "createdAt",
            align: "center",
            width: 180,
            render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
        },
        {
            title: "관리",
            align: "center",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.seatId)}
                        style={{ borderRadius: 8 }}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    /* 검색 필터 */
    const filteredSeats = seats.filter(
        (s) =>
            s.flightId.toLowerCase().includes(search.toLowerCase()) ||
            s.seatNo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <AdminSectionCard
                title="좌석 관리"
                extra={
                    <Space>
                        <AdminSearchBar
                            placeholder="항공편명 / 좌석번호 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchSeats}
                            style={{ borderRadius: 8 }}
                        >
                            새로고침
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredSeats}
                    loading={loading}
                    rowKey="seatId"
                    bordered
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `총 ${total.toLocaleString()}개 좌석`,
                    }}
                />
            </AdminSectionCard>
        </div>
    );
};

export default AdminSeatPage;
