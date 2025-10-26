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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import axios from "axios";

const { Title } = Typography;

const AdminAccListPage = () => {
  // ✅ Root에서 전달받는 상태
  const { type, filter, keyword } = useOutletContext();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();

  /* === 숙소 목록 조회 === */
  const fetchList = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      // ✅ type → sourceType 변환 (SELF=0, API=1)
      const sourceType = type === "SELF" ? 0 : type === "API" ? 1 : null;

      const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations`, {
        params: {
          keyword,
          sourceType,
          activeFilter: filter,
          page,
          size,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ 백엔드 응답 구조: { data: { data: [...], total: 123 } }
      const result = res?.data?.data || {};
      setRows(result.data || []);

      setPagination({
        current: page,
        pageSize: size,
        total: result.total || 0,
      });
    } catch (err) {
      console.error("❌ 숙소 데이터 로드 실패:", err);
      message.error("숙소 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ 탭/검색/필터 변경 시 자동 새로 조회 */
  useEffect(() => {
    fetchList(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, filter, keyword]);

  /* === 숙소 삭제 === */
  const handleDelete = (accNo, title) => {
    Modal.confirm({
      title: "숙소 삭제 확인",
      content: `정말 "${title}" 숙소를 삭제하시겠습니까?`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${API_SERVER_HOST}/api/adm/accommodations/${accNo}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("숙소가 삭제되었습니다.");
          fetchList(pagination.current, pagination.pageSize);
        } catch (err) {
          console.error("삭제 실패:", err);
          message.error("숙소 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /* === 페이지네이션 핸들러 === */
  const handlePageChange = (page, pageSize) => {
    fetchList(page, pageSize);
  };

  /* === 테이블 컬럼 === */
  const columns = [
    { title: "번호", dataIndex: "accNo", align: "center", width: 80 },
    { title: "숙소 ID", dataIndex: "accId", align: "center", width: 100 },
    { title: "숙소명", dataIndex: "title", align: "center", width: 180 },
    { title: "유형", dataIndex: "category", align: "center", width: 120 },
    { title: "주소", dataIndex: "address", width: 300 },
    { title: "전화번호", dataIndex: "tel", align: "center", width: 150 },
    {
      title: "운영",
      dataIndex: "isActive",
      align: "center",
      width: 100,
      render: (v) => (
        <Tag color={v ? "blue" : "default"}>{v ? "운영중" : "중단"}</Tag>
      ),
    },
    {
      title: "관리",
      align: "center",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/adm/accommodations/edit/${record.accNo}`)
            }
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.accNo, record.title)}
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
              {type === "API" ? "TourAPI 숙소 목록" : "자체 등록 숙소 목록"}
            </Title>
          </Space>
        }
        extra={
          <Space>
            {type === "SELF" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/adm/accommodations/new")}
              >
                숙소 등록
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
              새로고침
            </Button>
          </Space>
        }
      >
        {loading ? (
          <Spin
            tip="데이터 불러오는 중..."
            style={{ display: "block", marginTop: 50 }}
          />
        ) : (
          <Table
            rowKey="accNo"
            columns={columns}
            dataSource={rows}
            bordered
            scroll={{ x: 1300 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
              showTotal: (total) => `총 ${total.toLocaleString()} 개 숙소`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminAccListPage;
