import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Table, Tag, message, Space, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const API = "http://localhost:8080/api/admin/seats";

const AdminSeatListPage = () => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchFlightId, setSearchFlightId] = useState("");
    const [searchParams] = useSearchParams();
    const location = useLocation();

    /** ✅ 좌석 조회 */
    const fetchSeats = async (flightIdValue) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");

            const flightId =
                flightIdValue || searchFlightId || searchParams.get("flightId");
            const depTime = searchParams.get("depTime");

            console.log("[SeatList] 요청 준비:", { flightId, depTime });

            if (!flightId) {
                console.warn("[SeatList] flightId가 비어 있습니다. 요청 중단");
                return;
            }

            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${token}` },
                params: { flightId, depTime },
            });

            console.log("[SeatList] 응답 수신:", res.status, res.data);
            setSeats(res.data || []);
        } catch (err) {
            console.error("[SeatList] 좌석 조회 실패:", err);
            message.error("좌석 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 최초 진입 및 URL 변경 시 자동 호출 */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const flightIdParam = params.get("flightId");
        const depTimeParam = params.get("depTime");

        console.log("[SeatList] useEffect 실행:", { flightIdParam, depTimeParam });

        if (flightIdParam) {
            setSearchFlightId(flightIdParam);
            fetchSeats(flightIdParam);
        } else {
            console.warn("[SeatList] flightIdParam 없음, 요청 미실행");
        }
    }, [location.search]); // ✅ location.search를 직접 감지 (100% 동작)

    /** ✅ 테이블 컬럼 */
    const columns = [
        {
            title: "항공편ID",
            dataIndex: "flightId",
            align: "center",
            width: 130,
            render: (t) => <b>{t}</b>,
        },
        {
            title: "출발시각",
            dataIndex: "depTime",
            align: "center",
            width: 180,
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        { title: "좌석번호", dataIndex: "seatNo", align: "center", width: 100 },
        {
            title: "등급",
            dataIndex: "seatClass",
            align: "center",
            width: 100,
            render: (cls) => (
                <Tag color={cls === "ECONOMY" ? "blue" : "volcano"}>{cls}</Tag>
            ),
        },
        {
            title: "예약상태",
            dataIndex: "reserved",
            align: "center",
            width: 120,
            render: (r) => (
                <Tag color={r ? "red" : "green"}>{r ? "예약됨" : "빈좌석"}</Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2 className="text-lg font-semibold mb-4 whitespace-nowrap">전체 좌석 관리</h2>

            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="항공편ID 검색"
                    value={searchFlightId}
                    onChange={(e) => setSearchFlightId(e.target.value)}
                    style={{ width: 200 }}
                />
                <Button
                    icon={<SearchOutlined />}
                    type="primary"
                    onClick={() => fetchSeats(searchFlightId)}
                >
                    검색
                </Button>
                <Button
                    onClick={() => {
                        setSearchFlightId("");
                        setSeats([]);
                    }}
                >
                    초기화
                </Button>
            </Space>

            <Table
                rowKey={(r) => `${r.flightId}_${r.depTime}_${r.seatNo}`}
                loading={loading}
                columns={columns}
                dataSource={seats}
                bordered
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
};

export default AdminSeatListPage;
