import { useEffect, useState } from "react";
import { Table, Button, Input, Space, Tag, message, Typography } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/flights";

const AdminFlightListPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  // ✅ 목록 조회
  const fetchFlights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setFlights(res.data || []);
    } catch (e) {
      message.error("항공편 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchFlights(); }, []);

  // ✅ 공통 검색 필터
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`${placeholder} 검색`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} size="small" icon={<SearchOutlined />} style={{ width: 80 }}>
            검색
          </Button>
          <Button onClick={() => clearFilters?.()} size="small" style={{ width: 80 }}>
            초기화
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  // ✅ 삭제
  const handleDelete = async (flightId, depTime) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API}/${flightId}/${depTime}`, { headers: { Authorization: `Bearer ${token}` } });
      message.success("삭제되었습니다.");
      fetchFlights();
    } catch (e) {
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 테이블 컬럼 (검색 + 등록일/수정일 복원)
  const columns = [
    {
      title: "항공편명",
      dataIndex: "flightId",
      key: "flightId",
      align: "center",
      width: 120,
      render: (t) => <b>{t}</b>,
      ...getColumnSearchProps("flightId", "항공편명"),
    },
    {
      title: "항공사명",
      dataIndex: "airlineNm",
      key: "airlineNm",
      align: "center",
      width: 150,
      ...getColumnSearchProps("airlineNm", "항공사명"),
    },
    {
      title: "출발공항",
      dataIndex: "depAirportNm",
      key: "depAirportNm",
      align: "center",
      width: 120,
      ...getColumnSearchProps("depAirportNm", "출발공항"),
    },
    {
      title: "도착공항",
      dataIndex: "arrAirportNm",
      key: "arrAirportNm",
      align: "center",
      width: 120,
      ...getColumnSearchProps("arrAirportNm", "도착공항"),
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      key: "depTime",
      align: "center",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.depTime) - new Date(b.depTime),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      key: "arrTime",
      align: "center",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.arrTime) - new Date(b.arrTime),
    },
    {
      title: "일반석 요금",
      dataIndex: "economyCharge",
      key: "economyCharge",
      align: "center",
      width: 140,
      render: (v) => <Tag color="green">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.economyCharge - b.economyCharge,
    },
    {
      title: "비즈니스 요금",
      dataIndex: "prestigeCharge",
      key: "prestigeCharge",
      align: "center",
      width: 140,
      render: (v) => <Tag color="blue">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.prestigeCharge - b.prestigeCharge,
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
    },
    {
      title: "관리",
      key: "actions",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/adm/flight/edit/${record.flightId}/${record.depTime}`)
            }
          >
            수정
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.flightId, record.depTime)}
            style={{ borderRadius: 8 }}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>항공편 목록</Title>
        <Button
          type="primary"
          onClick={() => navigate("/adm/flight/new")}
          style={{ background: "#2563eb", border: "none", borderRadius: 8, fontWeight: 600 }}
        >
          + 항공편 등록
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={flights}
        loading={loading}
        rowKey={(r) => `${r.flightId}_${r.depTime}`}
        bordered
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: flights.length,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          showTotal: (total) => `총 ${total.toLocaleString()}건 등록됨`,
        }}
      />
    </div>
  );
};

export default AdminFlightListPage;
