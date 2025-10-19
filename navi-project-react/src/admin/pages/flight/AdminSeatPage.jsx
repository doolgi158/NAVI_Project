import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Select, message, Typography } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;
const API = "http://localhost:8080/api/admin/seats";

const AdminSeatPage = () => {
    const [seats, setSeats] = useState([]);
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ 항공편 목록 조회 (좌석 조회용)
    const fetchFlights = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/admin/flights");
            setFlights(res.data);
        } catch (err) {
            message.error("항공편 목록을 불러오지 못했습니다.");
        }
    };

    // ✅ 특정 항공편 좌석 목록 조회
    const fetchSeats = async (flightId) => {
        if (!flightId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}?flightId=${flightId}`);
            setSeats(res.data);
        } catch (err) {
            message.error("좌석 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const handleGenerateSeats = async () => {
        if (!selectedFlight) {
            message.warning("항공편을 먼저 선택하세요.");
            return;
        }
        try {
            await axios.post(`${API}/generate`, { flightId: selectedFlight });
            message.success("좌석이 자동 생성되었습니다.");
            fetchSeats(selectedFlight);
        } catch (err) {
            message.error("좌석 생성 중 오류가 발생했습니다.");
        }
    };

    const columns = [
        { title: "좌석번호", dataIndex: "seatNo", key: "seatNo", width: 100 },
        { title: "등급", dataIndex: "seatClass", key: "seatClass", width: 120 },
        {
            title: "상태",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "AVAILABLE" ? "green" : "red"}>
                    {status === "AVAILABLE" ? "예약가능" : "예약됨"}
                </Tag>
            ),
        },
        { title: "가격", dataIndex: "price", key: "price", render: (v) => v?.toLocaleString() + "원" },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={4}>좌석 관리</Title>

            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="항공편 선택"
                    style={{ width: 220 }}
                    onChange={(v) => {
                        setSelectedFlight(v);
                        fetchSeats(v);
                    }}
                    value={selectedFlight}
                >
                    {flights.map((f) => (
                        <Option key={f.flightId} value={f.flightId}>
                            {`${f.flightId} (${f.depAirport?.airportName} → ${f.arrAirport?.airportName})`}
                        </Option>
                    ))}
                </Select>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchSeats(selectedFlight)}
                    disabled={!selectedFlight}
                >
                    새로고침
                </Button>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleGenerateSeats}
                    disabled={!selectedFlight}
                >
                    좌석 자동 생성
                </Button>
            </Space>

            <Table
                rowKey="seatNo"
                loading={loading}
                columns={columns}
                dataSource={seats}
                bordered
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
};

export default AdminSeatPage;
