import { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Typography,
  Modal,
  Select,
  Input,
  Form,
  InputNumber,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";
import AdminSearchBar from "../../layout/flight/AdminSearchBar";

const { Option } = Select;
const { Title } = Typography;
const API = "http://localhost:8080/api/admin/flight-reservations";
const SEAT_API = "http://localhost:8080/api/admin/seats/available";

const AdminFlightReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();
  const searchInput = useRef(null);

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
      content: "결제 완료된 예약은 삭제할 수 없습니다. 계속하시겠습니까?",
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
        } catch (err) {
          message.error(err.response?.data?.message || "삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /** ✅ 항공편별 예약 가능한 좌석 조회 */
  const fetchAvailableSeats = async (flightId, depTime) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${SEAT_API}?flightId=${flightId}&depTime=${depTime}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSeats(res.data || []);
    } catch {
      message.error("예약 가능한 좌석 목록을 불러오지 못했습니다.");
    }
  };

  /** ✅ 개별 수정 모달 열기 */
  const openEditModal = (record) => {
    setSelected(record);
    form.setFieldsValue({
      seatId: record.seatId || null,
      status: record.status,
      totalPrice: record.totalPrice || 0,
    });
    fetchAvailableSeats(record.flightId, record.depTime);
    setEditModal(true);
  };

  /** ✅ 수정 저장 */
  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      const token = localStorage.getItem("accessToken");
      await axios.put(`${API}/${selected.rsvId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("예약 정보가 수정되었습니다.");
      setEditModal(false);
      fetchReservations();
    } catch {
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 컬럼 검색 필터 */
  const getColumnSearchProps = (dataIndex, label) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`${label} 검색`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
          >
            검색
          </Button>
          <Button onClick={() => clearFilters()} size="small">
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
      title: "예약번호",
      dataIndex: "rsvId",
      align: "center",
      width: 160,
      sorter: (a, b) => a.rsvId.localeCompare(b.rsvId),
      render: (t) => <b>{t}</b>,
    },
    {
      title: "사용자",
      dataIndex: "userName",
      align: "center",
      width: 120,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      ...getColumnSearchProps("userName", "사용자"),
    },
    {
      title: "항공편명",
      dataIndex: "flightId",
      align: "center",
      width: 120,
      sorter: (a, b) => a.flightId.localeCompare(b.flightId),
    },
    {
      title: "출발지",
      dataIndex: "depAirport",
      align: "center",
      width: 100,
      sorter: (a, b) => a.depAirport.localeCompare(b.depAirport),
    },
    {
      title: "도착지",
      dataIndex: "arrAirport",
      align: "center",
      width: 100,
      sorter: (a, b) => a.arrAirport.localeCompare(b.arrAirport),
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      align: "center",
      width: 180,
      sorter: (a, b) => new Date(a.depTime) - new Date(b.depTime),
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      align: "center",
      width: 180,
      sorter: (a, b) => new Date(a.arrTime) - new Date(b.arrTime),
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "좌석번호",
      dataIndex: "seatNo",
      align: "center",
      width: 100,
      sorter: (a, b) => a.seatNo.localeCompare(b.seatNo),
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: "좌석등급",
      dataIndex: "seatClass",
      align: "center",
      width: 120,
      sorter: (a, b) => a.seatClass.localeCompare(b.seatClass),
      render: (v) => {
        const color = v === "ECONOMY" ? "green" : v === "PRESTIGE" ? "gold" : "default";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "예약상태",
      dataIndex: "status",
      align: "center",
      width: 120,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (v) => {
        const color =
          v === "PENDING"
            ? "blue"
            : v === "PAID"
              ? "purple"
              : v === "CANCELLED"
                ? "volcano"
                : v === "FAILED"
                  ? "red"
                  : "default";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "결제금액",
      dataIndex: "totalPrice",
      align: "center",
      width: 140,
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
      render: (v) => (v ? <Tag color="purple">{v.toLocaleString()}원</Tag> : "-"),
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      align: "center",
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      align: "center",
      width: 180,
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "관리",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size={"small"}>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
            style={{ borderRadius: 8 }}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.rsvId)}
            size="small"
            style={{ borderRadius: 8 }}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  /** ✅ 전체 검색 필터 */
  const filtered = reservations.filter((r) => {
    const id = r?.rsvId?.toLowerCase() || "";
    const user = r?.userName?.toLowerCase() || "";
    const flight = r?.flightId?.toLowerCase() || "";
    const keyword = search.toLowerCase();
    return id.includes(keyword) || user.includes(keyword) || flight.includes(keyword);
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
          style={{
            minWidth: "100%",
            tableLayout: "auto",  // ✅ 자동 폭 계산
            whiteSpace: "nowrap", // ✅ 줄바꿈 방지
          }}
          scroll={{ x: "max-content" }}
        />
      </AdminSectionCard>

      {/* ✅ 개별 수정 모달 */}
      <Modal
        title={`예약 수정 - ${selected?.rsvId || ""}`}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={handleSave}
        okText="저장"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="좌석 변경" name="seatId">
            <Select placeholder="예약 가능한 좌석 선택" allowClear>
              {availableSeats.map((seat) => (
                <Option key={seat.seatId} value={seat.seatId}>
                  {seat.seatNo} ({seat.seatClass})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="상태" name="status">
            <Select>
              <Option value="PENDING">대기중</Option>
              <Option value="PAID">결제완료</Option>
              <Option value="CANCELLED">취소됨</Option>
              <Option value="FAILED">실패</Option>
            </Select>
          </Form.Item>

          <Form.Item label="결제금액" name="totalPrice">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminFlightReservationPage;
