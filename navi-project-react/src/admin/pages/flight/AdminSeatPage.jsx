import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Button, Space, Tag, message, Popconfirm, Segmented } from "antd";
import {
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    RetweetOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";
import AdminSearchBar from "../../layout/flight/AdminSearchBar";
import dayjs from "dayjs";

const API = "http://localhost:8080/api/admin/seats";

const AdminSeatPage = () => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [seatFilter, setSeatFilter] = useState("ALL");
    const [rsvFilter, setRsvFilter] = useState("ALL");
    const [flightInfo, setFlightInfo] = useState({ flightId: "", depTime: "" });
    const [page, setPage] = useState({ current: 1, pageSize: 20 }); // ✅ 페이지네이션 상태
    const location = useLocation();

    /** ✅ URL에서 flightId, depTime 읽기 */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const flightId = params.get("flightId");
        const depTime = params.get("depTime");

        if (flightId && depTime) {
            setFlightInfo({ flightId, depTime });
            fetchSeats(flightId, depTime);
        } else {
            setFlightInfo({ flightId: "", depTime: "" });
            fetchAllSeats();
        }
    }, [location.search]);

    /** ✅ 전체 조회 */
    const fetchAllSeats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API}/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSeats(res.data || []);
        } catch {
            message.error("좌석 전체 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 항공편별 조회 */
    const fetchSeats = async (flightId, depTime) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${token}` },
                params: { flightId, depTime },
            });
            setSeats(res.data || []);
        } catch {
            message.error("좌석 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 좌석 추가 */
    const handleAdd = async () => {
        if (!flightInfo.flightId) return message.warning("항공편을 먼저 선택하세요.");
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(`${API}/flight/${flightInfo.flightId}/auto`, null, {
                params: { depTime: flightInfo.depTime },
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("좌석이 자동으로 추가되었습니다.");
            fetchSeats(flightInfo.flightId, flightInfo.depTime);
        } catch (e) {
            message.error(e.response?.data?.message || "좌석 추가 실패");
        }
    };

    /** ✅ 예약 상태 토글 */
    const handleEdit = async (seat) => {
        const updated = { reserved: !seat.reserved };
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put(`${API}/single/${seat.seatId}`, updated, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("예약 상태가 변경되었습니다.");
            flightInfo.flightId
                ? fetchSeats(flightInfo.flightId, flightInfo.depTime)
                : fetchAllSeats();
        } catch {
            message.error("수정 실패");
        }
    };

    /** ✅ 개별 삭제 */
    const handleDelete = async (seatId) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${API}/single/${seatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("좌석이 삭제되었습니다.");
            flightInfo.flightId
                ? fetchSeats(flightInfo.flightId, flightInfo.depTime)
                : fetchAllSeats();
        } catch {
            message.error("삭제 실패");
        }
    };

    /** ✅ 전체 삭제 */
    const handleDeleteAll = async () => {
        if (!flightInfo.flightId)
            return message.warning("항공편을 선택하지 않은 상태에서는 전체 삭제 불가합니다.");
        if (!window.confirm("이 항공편의 모든 좌석을 삭제하시겠습니까?")) return;
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${API}/flight/${flightInfo.flightId}`, {
                params: { depTime: flightInfo.depTime },
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("항공편의 모든 좌석이 삭제되었습니다.");
            fetchSeats(flightInfo.flightId, flightInfo.depTime);
        } catch {
            message.error("전체 삭제 실패");
        }
    };

    /** ✅ 초기화 */
    const handleReset = async () => {
        if (!flightInfo.flightId)
            return message.warning("항공편을 선택하지 않은 상태에서는 초기화 불가합니다.");
        if (!window.confirm("좌석을 초기화하시겠습니까? (삭제 후 재생성)")) return;
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post(`${API}/flight/${flightInfo.flightId}/reset`, null, {
                params: { depTime: flightInfo.depTime },
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("좌석이 초기화되었습니다.");
            fetchSeats(flightInfo.flightId, flightInfo.depTime);
        } catch {
            message.error("초기화 실패");
        }
    };

    /** ✅ 컬럼 스타일 */
    const cellStyle = {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    };

    /** ✅ 컬럼 정의 */
    const columns = [
        {
            title: "항공편명",
            dataIndex: "flightId",
            align: "center",
            sorter: (a, b) => a.flightId.localeCompare(b.flightId),
            render: (v) => <div style={cellStyle}>{v}</div>,
        },
        {
            title: "좌석번호",
            dataIndex: "seatNo",
            align: "center",
            render: (v) => <div style={cellStyle}>{v}</div>,
        },
        {
            title: "등급",
            dataIndex: "seatClass",
            align: "center",
            sorter: (a, b) => a.seatClass.localeCompare(b.seatClass),
            render: (cls) => (
                <Tag color={cls === "ECONOMY" ? "green" : "blue"}>
                    {cls === "ECONOMY" ? "일반석" : "프레스티지석"}
                </Tag>
            ),
        },
        {
            title: "예약상태",
            dataIndex: "reserved",
            align: "center",
            sorter: (a, b) => (a.reserved === b.reserved ? 0 : a.reserved ? -1 : 1),
            render: (r) => (
                <Tag color={r ? "red" : "default"}>{r ? "예약됨" : "가능"}</Tag>
            ),
        },
        {
            title: "추가요금",
            dataIndex: "extraPrice",
            align: "center",
            sorter: (a, b) => a.extraPrice - b.extraPrice,
            render: (v) => <div style={cellStyle}>{v?.toLocaleString()}원</div>,
        },
        {
            title: "출발시간",
            dataIndex: "depTime",
            align: "center",
            sorter: (a, b) => dayjs(a.depTime).unix() - dayjs(b.depTime).unix(),
            render: (v) => (
                <div style={cellStyle}>{dayjs(v).format("YYYY-MM-DD HH:mm")}</div>
            ),
        },
        {
            title: "관리",
            align: "center",
            render: (_, seat) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        type="primary"
                        onClick={() => handleEdit(seat)}
                    >
                        예약토글
                    </Button>
                    <Popconfirm
                        title="삭제하시겠습니까?"
                        onConfirm={() => handleDelete(seat.seatId)}
                        okText="삭제"
                        cancelText="취소"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    /** ✅ 검색 + 필터 적용 */
    const filtered = seats
        .filter(
            (s) =>
                s.seatNo.toLowerCase().includes(search.toLowerCase()) ||
                s.seatClass.toLowerCase().includes(search.toLowerCase())
        )
        .filter((s) => (seatFilter === "ALL" ? true : s.seatClass === seatFilter))
        .filter((s) => {
            if (rsvFilter === "ALL") return true;
            if (rsvFilter === "RESERVED") return s.reserved === true;
            if (rsvFilter === "AVAILABLE") return s.reserved === false;
            return true;
        });

    /** ✅ 필터/검색 변경 시 페이지 리셋 */
    useEffect(() => {
        setPage((p) => ({ ...p, current: 1 }));
    }, [search, seatFilter, rsvFilter, seats]);

    return (
        <div style={{ padding: 24 }}>
            <AdminSectionCard
                title={
                    flightInfo.flightId
                        ? `좌석 관리 (${flightInfo.flightId} / ${dayjs(
                            flightInfo.depTime
                        ).format("YYYY-MM-DD HH:mm")})`
                        : "전체 좌석 관리"
                }
                extra={
                    <Space wrap>
                        <AdminSearchBar
                            placeholder="좌석번호 / 등급 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Segmented
                            options={[
                                { label: "전체등급", value: "ALL" },
                                { label: "일반석", value: "ECONOMY" },
                                { label: "프레스티지", value: "PRESTIGE" },
                            ]}
                            value={seatFilter}
                            onChange={setSeatFilter}
                        />
                        <Segmented
                            options={[
                                { label: "전체상태", value: "ALL" },
                                { label: "예약가능", value: "AVAILABLE" },
                                { label: "예약됨", value: "RESERVED" },
                            ]}
                            value={rsvFilter}
                            onChange={setRsvFilter}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() =>
                                flightInfo.flightId
                                    ? fetchSeats(flightInfo.flightId, flightInfo.depTime)
                                    : fetchAllSeats()
                            }
                        >
                            새로고침
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            style={{ background: "#2563eb", border: "none" }}
                            disabled={!flightInfo.flightId}
                        >
                            좌석 추가
                        </Button>
                        <Button
                            icon={<RetweetOutlined />}
                            onClick={handleReset}
                            style={{ background: "#22c55e", color: "#fff" }}
                            disabled={!flightInfo.flightId}
                        >
                            초기화
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteAll}
                            disabled={!flightInfo.flightId}
                        >
                            전체삭제
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="seatId"
                    loading={loading}
                    bordered
                    scroll={{ x: true }}
                    pagination={{
                        current: page.current,
                        pageSize: page.pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        showTotal: (t) => `총 ${t.toLocaleString()} 좌석`,
                        onChange: (current, pageSize) => setPage({ current, pageSize }),
                        onShowSizeChange: (current, size) =>
                            setPage({ current: 1, pageSize: size }),
                    }}
                />
            </AdminSectionCard>
        </div>
    );
};

export default AdminSeatPage;
