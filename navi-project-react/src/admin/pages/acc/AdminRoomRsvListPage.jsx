import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
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
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import dayjs from "dayjs";

const { Title } = Typography;

const AdminRoomRsvListPage = () => {
  const { filter, keyword } = useOutletContext(); // ✅ 상위 탭에서 넘어오는 값
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();

  /* === 관리자용 객실 예약 목록 조회 === */
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

  /* ✅ 필터 / 검색어 변경 시 자동 재조회 */
  useEffect(() => {
    fetchList(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, keyword]);

  /* === 예약 삭제 === */
  const handleDelete = (reserveId, reserverName) => {
    Modal.confirm({
      title: "예약 삭제 확인",
      content: `정말 "${reserverName}" 예약을 삭제하시겠습니까?`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${API_SERVER_HOST}/api/adm/room/reserve/${reserveId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("예약이 삭제되었습니다.");
          fetchList(pagination.current, pagination.pageSize);
        } catch (err) {
          console.error("삭제 실패:", err);
          message.error("예약 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /* === 페이지네이션 === */
  const handlePageChange = (page, pageSize) => {
    fetchList(page, pageSize);
  };

  /* === 컬럼 구성 === */
  const columns = [
    { title: "예약 ID", dataIndex: "reserveId", align: "center", width: 160 },
    { title: "객실 ID", dataIndex: "roomId", align: "center", width: 120 },
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
    { title: "숙박일수", dataIndex: "nights", align: "center", width: 90 },
    { title: "인원", dataIndex: "guestCount", align: "center", width: 80 },
    { title: "객실 수", dataIndex: "quantity", align: "center", width: 90 },
    {
      title: "금액",
      dataIndex: "price",
      align: "right",
      width: 120,
      render: (v) => (v ? `${Number(v).toLocaleString()}원` : "-"),
    },
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
          REFUNDED: "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    { title: "예약자명", dataIndex: "reserverName", align: "center", width: 130 },
    { title: "연락처", dataIndex: "reserverTel", align: "center", width: 150 },
    { title: "이메일", dataIndex: "reserverEmail", align: "center", width: 220 },
    {
      title: "관리",
      align: "center",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/adm/room/reserve/detail/${record.reserveId}`)}
          >
            상세
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.reserveId, record.reserverName)}
          >
            삭제
          </Button>
        </Space>
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
              객실 예약 목록
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
            scroll={{ x: 1500 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
              showTotal: (total) => `총 ${total.toLocaleString()} 건`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminRoomRsvListPage;
