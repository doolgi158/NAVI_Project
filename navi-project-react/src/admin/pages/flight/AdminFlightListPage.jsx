import { useEffect, useState } from "react";
import { Table, Button, Input, Space, Tag, message, Typography } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

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

  /** ✅ 항공편 목록 조회 */
  const fetchFlights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlights(res.data || []);
    } catch {
      message.error("항공편 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  /** ✅ 삭제 */
  const handleDelete = async (flightId, depTime) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API}/${flightId}/${depTime}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("삭제되었습니다.");
      fetchFlights();
    } catch {
      message.error("예약이 있는 항공편은 삭제할 수 없습니다.");
    }
  };

  /** ✅ 컬럼별 검색 필터 */
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
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            icon={<SearchOutlined />}
            style={{ width: 80 }}
          >
            검색
          </Button>
          <Button onClick={() => clearFilters?.()} size="small" style={{ width: 80 }}>
            초기화
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  /** ✅ 테이블 컬럼 */
  const columns = [
    {
      title: "항공편명",
      dataIndex: "flightId",
      align: "center",
      width: 120,
      render: (t) => <b>{t}</b>,
      ...getColumnSearchProps("flightId", "항공편명"),
    },
    {
      title: "항공사명",
      dataIndex: "airlineNm",
      align: "center",
      width: 150,
      ...getColumnSearchProps("airlineNm", "항공사명"),
    },
    {
      title: "출발공항",
      dataIndex: "depAirportNm",
      align: "center",
      width: 120,
      ...getColumnSearchProps("depAirportNm", "출발공항"),
    },
    {
      title: "도착공항",
      dataIndex: "arrAirportNm",
      align: "center",
      width: 120,
      ...getColumnSearchProps("arrAirportNm", "도착공항"),
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      align: "center",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.depTime) - new Date(b.depTime),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      align: "center",
      width: 180,
      render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.arrTime) - new Date(b.arrTime),
    },
    {
      title: "일반석 요금",
      dataIndex: "economyCharge",
      align: "center",
      width: 140,
      render: (v) => <Tag color="green">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.economyCharge - b.economyCharge,
    },
    {
      title: "비즈니스 요금",
      dataIndex: "prestigeCharge",
      align: "center",
      width: 140,
      render: (v) => <Tag color="blue">{v.toLocaleString()}원</Tag>,
      sorter: (a, b) => a.prestigeCharge - b.prestigeCharge,
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      align: "center",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      align: "center",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
    },
    {
      title: "관리",
      align: "center",
      width: 150,
      fixed: "right", // ✅ 오른쪽 고정
      render: (_, record) => (
        <Space size={"small"}>
          {/* ✅ 좌석관리 버튼 수정 */}
          <Button
            type="default"
            size="small"
            style={{ borderRadius: 8 }}
            icon={<SettingOutlined />}
            onClick={() => {
              const depTime = encodeURIComponent(record.depTime);
              navigate(`/adm/flight/seats?flightId=${record.flightId}&depTime=${depTime}`);
            }}
          >
            좌석관리
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ borderRadius: 8 }}
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
            size="small"
            style={{ borderRadius: 8 }}
            onClick={() => handleDelete(record.flightId, record.depTime)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <AdminSectionCard
        title="항공편 목록"
        extra={
          <Button
            type="primary"
            onClick={() => navigate("/adm/flight/new")}
            style={{
              background: "#2563eb",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            + 항공편 등록
          </Button>
        }
      >
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
          style={{
            minWidth: "100%",
            tableLayout: "auto",  // ✅ 자동 폭 계산
            whiteSpace: "nowrap", // ✅ 줄바꿈 방지
          }}
          scroll={{ x: "max-content" }}
        />
      </AdminSectionCard>
    </div>
  );
};

export default AdminFlightListPage;
