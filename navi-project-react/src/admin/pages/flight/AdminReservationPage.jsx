import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Typography,
  Modal,
  Select,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";
import AdminSearchBar from "../../layout/flight/AdminSearchBar";

const { Option } = Select;
const { Title } = Typography;
const API = "http://localhost:8080/api/admin/flight-reservations";

const AdminReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /** ✅ 예약 목록 조회 */
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(res.data || []);
    } catch {
      message.error("예약 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  /** ✅ 예약 삭제 */
  const handleDelete = (rsvId) => {
    Modal.confirm({
      title: "예약 삭제",
      content: "정말로 이 예약을 삭제하시겠습니까?",
      okText: "삭제",
      okButtonProps: { danger: true },
      cancelText: "취소",
      onOk: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${API}/${rsvId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("삭제되었습니다.");
          fetchReservations();
        } catch {
          message.error("삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /** ✅ 상태 변경 처리 */
  const handleStatusChange = async (frsvId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        `${API}/${frsvId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("상태가 변경되었습니다.");
      fetchReservations();
    } catch {
      message.error("상태 변경 실패");
    }
  };

  /** ✅ 상태 Select + 색상 Tag 렌더링 */
  const renderStatus = (status, record) => (
    <Select
      value={status}
      onChange={(value) => handleStatusChange(record.rsvId, value)}
      style={{ width: 120 }}
    >
      <Option value="PENDING">
        <Tag color="orange">대기중</Tag>
      </Option>
      <Option value="PAID">
        <Tag color="blue">결제완료</Tag>
      </Option>
      <Option value="CANCELLED">
        <Tag color="red">취소됨</Tag>
      </Option>
      <Option value="FAILED">
        <Tag color="default">실패</Tag>
      </Option>
      <Option value="COMPLETED">
        <Tag color="green">완료</Tag>
      </Option>
    </Select>
  );

  /** ✅ 테이블 컬럼 */
  const columns = [
    {
      title: "예약번호",
      dataIndex: "rsvId",
      align: "center",
      width: 180,
      render: (t) => <b>{t}</b>,
    },
    {
      title: "사용자",
      dataIndex: "userName",
      align: "center",
      width: 120,
    },
    {
      title: "항공편명",
      dataIndex: "flightId",
      align: "center",
      width: 120,
    },
    {
      title: "출발지",
      dataIndex: "depAirport",
      align: "center",
      width: 100,
    },
    {
      title: "도착지",
      dataIndex: "arrAirport",
      align: "center",
      width: 100,
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      align: "center",
      width: 180,
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "예약상태",
      dataIndex: "status",
      align: "center",
      width: 150,
      render: renderStatus,
    },
    {
      title: "결제금액",
      dataIndex: "totalPrice",
      align: "center",
      width: 140,
      render: (v) =>
        v ? <Tag color="purple">{v.toLocaleString()}원</Tag> : "-",
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.rsvId)}
            style={{ borderRadius: 8 }}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  /** ✅ 검색 필터 */
  const filtered = reservations.filter((r) => {
    const id = r?.rsvId?.toLowerCase() || "";
    const user = r?.userName?.toLowerCase() || "";
    const flight = r?.flightId?.toLowerCase() || "";
    const keyword = search.toLowerCase();

    return (
      id.includes(keyword) ||
      user.includes(keyword) ||
      flight.includes(keyword)
    );
  });

  return (
    <div style={{ padding: 24 }}>
      <AdminSectionCard
        title="항공편 예약 관리"
        extra={
          <Space>
            <AdminSearchBar
              placeholder="예약번호 / 항공편명 / 사용자 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchReservations}
              style={{ borderRadius: 8 }}
            >
              새로고침
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          loading={loading}
          rowKey="rsvId"
          bordered
          pagination={{
            pageSize: 10,
            showTotal: (total) => `총 ${total.toLocaleString()}건 예약`,
          }}
        />
      </AdminSectionCard>
    </div>
  );
};

export default AdminReservationPage;
