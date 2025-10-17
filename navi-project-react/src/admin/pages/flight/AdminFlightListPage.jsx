import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  message,
  Typography,
  Select,
} from "antd";
import { SearchOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
const { Option } = Select;
const API = "http://localhost:8080/api/admin/flights";

const AdminFlightListPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  /** ✅ 항공편 목록 조회 */
  const fetchFlights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlights(res.data || []);
    } catch (err) {
      console.error("❌ 항공편 조회 실패:", err);
      message.error("항공편 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  /** ✅ 공통 검색 필터 구성 */
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`${placeholder} 검색`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            icon={<SearchOutlined />}
            style={{ width: 80 }}
          >
            검색
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 80 }}>
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
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
  });

  /** ✅ 항공편 삭제 */
  const handleDelete = async (flightId, depTime) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API}/${flightId}/${depTime}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("삭제되었습니다.");
      fetchFlights();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  /* 테이블 컬럼 (전체 컬럼 포함) */
  const columns = [
    {
      title: "항공편명",
      dataIndex: "flightId",
      key: "flightId",
      width: 120,
      render: (t) => <b>{t}</b>,
      ...getColumnSearchProps("flightId", "항공편명"),
    },
    {
      title: "항공사명",
      dataIndex: "airlineNm",
      key: "airlineNm",
      width: 150,
      ...getColumnSearchProps("airlineNm", "항공사명"),
    },
    {
      title: "출발공항",
      dataIndex: "depAirportNm",
      key: "depAirportNm",
      width: 120,
      ...getColumnSearchProps("depAirportNm", "출발공항"),
    },
    {
      title: "도착공항",
      dataIndex: "arrAirportNm",
      key: "arrAirportNm",
      width: 120,
      ...getColumnSearchProps("arrAirportNm", "도착공항"),
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      key: "depTime",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.depTime) - new Date(b.depTime),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      key: "arrTime",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.arrTime) - new Date(b.arrTime),
    },
    {
      title: "일반석 요금",
      dataIndex: "economyCharge",
      key: "economyCharge",
      align: "right",
      render: (v) => <Tag color="green">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.economyCharge - b.economyCharge,
    },
    {
      title: "비즈니스 요금",
      dataIndex: "prestigeCharge",
      key: "prestigeCharge",
      align: "right",
      render: (v) => <Tag color="blue">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.prestigeCharge - b.prestigeCharge,
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
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
            style={{
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#1677ff",
              boxShadow: "0 2px 6px rgba(22, 119, 255, 0.3)",
            }}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.flightId, record.depTime)}
            style={{
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 2px 6px rgba(255, 77, 79, 0.25)",
            }}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: 8 }}
            >
              뒤로가기
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              항공편 목록
            </Title>
          </div>
          <Button
            type="primary"
            style={{
              background: "#2563eb",
              border: "none",
              fontWeight: "600",
              borderRadius: 8,
            }}
            onClick={() => navigate("/adm/flight/new")}
          >
            + 항공편 등록
          </Button>
        </div>

        {/* 📋 테이블 */}
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
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
            showTotal: (total) => `총 ${total.toLocaleString()}건 등록됨`,
          }}
        />
      </div>
    </div>
  );
};

export default AdminFlightListPage;
