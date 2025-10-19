import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message, Typography, Select } from "antd";
import { ReloadOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const API = "http://localhost:8080/api/admin/reservations";

const AdminReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ 항공편 목록 불러오기 (필터용)
  const fetchFlights = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/flights");
      setFlights(res.data);
    } catch {
      message.error("항공편 목록을 불러오지 못했습니다.");
    }
  };

  // ✅ 예약 목록 불러오기
  const fetchReservations = async (flightId) => {
    setLoading(true);
    try {
      const url = flightId ? `${API}?flightId=${flightId}` : API;
      const res = await axios.get(url);
      setReservations(res.data);
    } catch {
      message.error("예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchReservations();
  }, []);

  // ✅ 예약 상태별 색상 표시
  const renderStatusTag = (status) => {
    const colorMap = {
      PENDING: "orange",
      PAID: "green",
      CANCELLED: "red",
      REFUNDED: "blue",
      FAILED: "gray",
    };
    const labelMap = {
      PENDING: "대기중",
      PAID: "결제완료",
      CANCELLED: "취소됨",
      REFUNDED: "환불완료",
      FAILED: "실패",
    };
    return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
  };

  // ✅ 예약 취소 처리
  const handleCancel = async (rsvId) => {
    try {
      await axios.put(`${API}/${rsvId}/cancel`);
      message.success("예약이 취소되었습니다.");
      fetchReservations(selectedFlight);
    } catch {
      message.error("예약 취소 중 오류가 발생했습니다.");
    }
  };

  const columns = [
    { title: "예약번호", dataIndex: "rsvId", key: "rsvId", width: 150 },
    {
      title: "항공편",
      dataIndex: "flight",
      key: "flight",
      render: (flight) =>
        flight ? `${flight.flightId} (${flight.depAirport?.airportName}→${flight.arrAirport?.airportName})` : "-",
    },
    {
      title: "예약자",
      dataIndex: "user",
      key: "user",
      render: (user) => user?.name || "-",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status),
    },
    {
      title: "결제금액",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => (v ? `${v.toLocaleString()}원` : "-"),
    },
    {
      title: "예약일시",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "관리",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<StopOutlined />}
            danger
            disabled={record.status === "CANCELLED" || record.status === "FAILED"}
            onClick={() => handleCancel(record.rsvId)}
          >
            취소
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>항공편 예약 관리</Title>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="항공편 선택"
          style={{ width: 250 }}
          value={selectedFlight}
          onChange={(v) => {
            setSelectedFlight(v);
            fetchReservations(v);
          }}
          allowClear
        >
          {flights.map((f) => (
            <Option key={f.flightId} value={f.flightId}>
              {`${f.flightId} (${f.depAirport?.airportName} → ${f.arrAirport?.airportName})`}
            </Option>
          ))}
        </Select>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchReservations(selectedFlight)}
          disabled={loading}
        >
          새로고침
        </Button>
      </Space>

      <Table
        rowKey="rsvId"
        loading={loading}
        columns={columns}
        dataSource={reservations}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminReservationPage;
