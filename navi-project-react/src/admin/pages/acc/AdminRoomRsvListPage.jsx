import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Tag,
  Modal,
  Descriptions,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";
import axios from "axios";

const { Title } = Typography;

const AdminRoomRsvListPage = () => {
  const { filter, keyword } = useOutletContext();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [reserverModal, setReserverModal] = useState({
    visible: false,
    data: null,
  });

  /* === 목록 조회 === */
  useEffect(() => {
    fetchList(1, pagination.pageSize);
  }, [filter, keyword]);

  const fetchList = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${API_SERVER_HOST}/api/adm/room/reserve/list`, {
        params: {
          page,
          size,
          status: filter || "ALL",
          keyword: keyword || "",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = res?.data?.data || {};
      setRows(result.data || []);
      setPagination({
        current: page,
        pageSize: size,
        total: result.total || 0,
      });
    } catch (err) {
      console.error("❌ 예약 데이터 로드 실패:", err);
      message.error("예약 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* === 예약 삭제 === */
  const handleDelete = (reserveId, rsvStatus) => {
    if (rsvStatus !== "CANCELLED") {
      message.warning(`예약 취소 상태일 때만 삭제할 수 있습니다.`);
      return;
    }

    Modal.confirm({
      title: "예약 삭제 확인",
      content: `정말 예약을 삭제하시겠습니까?`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await axios.delete(`${API_SERVER_HOST}/api/adm/room/reserve/${reserveId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.status === 200) {
            message.success("예약이 삭제되었습니다.");
            fetchList(pagination.current, pagination.pageSize);
          } else {
            message.error(res.data?.message || "예약 삭제 중 오류가 발생했습니다.");
          }
        } catch (err) {
          console.error("삭제 실패:", err);
          message.error("예약 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };


  /* === 대표 예약자 정보 보기 === */
  const showReserverDetail = (record) => {
    setReserverModal({ visible: true, data: record });
  };

  /* === 컬럼 구성 === */
  const columns = [
    { title: "예약 ID", dataIndex: "reserveId", align: "center", width: 160 },
    { title: "숙소명", dataIndex: "title", align: "center", width: 250 },
    { title: "객실명", dataIndex: "roomName", align: "center", width: 180 },
    {
      title: "상태",
      dataIndex: "rsvStatus",
      align: "center",
      width: 120,
      render: (status) => {
        const colorMap = {
          PENDING: "orange",
          PAID: "green",
          CANCELLED: "red",
          REFUNDED: "purple",
          FAILED: "volcano"
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "대표 예약자",
      dataIndex: "reserverName",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Button
          type="link"
          icon={<UserOutlined />}
          onClick={() => showReserverDetail(record)}
        >
          {record.reserverName}
        </Button>
      ),
    },
    {
      title: "체크인",
      dataIndex: "startDate",
      align: "center",
      width: 120,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "체크아웃",
      dataIndex: "endDate",
      align: "center",
      width: 120,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
    },
    { title: "숙박일수", dataIndex: "nights", align: "center", width: 100 },
    { title: "인원", dataIndex: "guestCount", align: "center", width: 80 },
    { title: "객실 수", dataIndex: "quantity", align: "center", width: 100 },
    {
      title: "금액",
      dataIndex: "price",
      align: "center",
      width: 120,
      render: (v) => (v ? `${Number(v).toLocaleString()}원` : "-"),
    },
    {
      title: "생성일",
      dataIndex: "createdAt",
      align: "center",
      width: 180,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      align: "center",
      width: 180,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "관리",
      align: "center",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.reserveId, record.rsvStatus)}
        >
          삭제
        </Button>
      ),
    },
  ];

  /* === 렌더링 === */
  return (
    <div style={{ paddingTop: 8 }}>
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              숙소 예약 목록
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
              새로고침
            </Button>
          </Space>
        }
      >
        {loading ? (
          <Spin tip="데이터 불러오는 중..." style={{ display: "block", marginTop: 50 }} />
        ) : (
          <Table
            rowKey="reserveId"
            columns={columns}
            dataSource={rows}
            bordered
            scroll={{ x: 1700 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              onChange: (p, s) => fetchList(p, s),
              onShowSizeChange: (p, s) => fetchList(p, s),
              showTotal: (t) => `총 ${t.toLocaleString()} 건`,
            }}
          />
        )}
      </Card>

      {/* ✅ 대표 예약자 모달 */}
      <Modal
        title="대표 예약자 정보"
        open={reserverModal.visible}
        onCancel={() => setReserverModal({ visible: false, data: null })}
        footer={null}
        centered
      >
        {reserverModal.data ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="이름">
              {reserverModal.data.reserverName}
            </Descriptions.Item>
            <Descriptions.Item label="전화번호">
              {reserverModal.data.reserverTel}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
              {reserverModal.data.reserverEmail}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>정보 없음</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminRoomRsvListPage;
