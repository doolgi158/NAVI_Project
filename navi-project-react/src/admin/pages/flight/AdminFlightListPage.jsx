import { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Button,
  Popconfirm,
  Space,
  message,
  Typography,
  Card,
  Tag,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";

const { Content, Sider, Header } = Layout;
const { Title, Text } = Typography;

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightListPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("accessToken");
      if (!token) {
        message.warning("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const list = Array.isArray(res.data) ? res.data : res.data.data || [];
      setFlights(list);
    } catch (err) {
      console.error("❌ 항공편 목록 오류:", err);
      message.error("항공편 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) {
        message.warning("로그인이 필요합니다.");
        return;
      }

      const { flightId, depTime } = record;
      await axios.delete(`${API}/${flightId}/${depTime}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("항공편이 삭제되었습니다.");
      fetchFlights();
    } catch (err) {
      console.error("❌ 삭제 오류:", err);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const columns = [
    { title: "항공편명", dataIndex: "flightId", key: "flightId" },
    { title: "항공사", dataIndex: "airlineNm", key: "airlineNm" },
    { title: "출발공항", dataIndex: "depAirportNm", key: "depAirportNm" },
    { title: "도착공항", dataIndex: "arrAirportNm", key: "arrAirportNm" },
    {
      title: "출발시간",
      dataIndex: "depTime",
      key: "depTime",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      key: "arrTime",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "일반석 요금",
      dataIndex: "economyCharge",
      key: "economyCharge",
      render: (val) => (
        <Tag color="green" style={{ fontWeight: 500 }}>
          {val?.toLocaleString()}원
        </Tag>
      ),
    },
    {
      title: "비즈니스 요금",
      dataIndex: "prestigeCharge",
      key: "prestigeCharge",
      render: (val) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {val?.toLocaleString()}원
        </Tag>
      ),
    },
    {
      title: "관리",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            style={{ color: "#1d4ed8", fontWeight: 500 }}
            onClick={() =>
              navigate(`/adm/flight/edit/${record.flightId}/${record.depTime}`)
            }
          >
            수정
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            okText="삭제"
            cancelText="취소"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* ✅ 사이드바 */}
      <Sider
        width={240}
        style={{
          background: "#fff",
          borderRight: "1px solid #eee",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <AdminSiderLayout />
      </Sider>

      <Layout>
        {/* ✅ 상단 헤더 */}
        <Header
          style={{
            background: "#001F54",
            color: "#fff",
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            ✈️ NAVI 관리자 시스템
          </Title>
          <Button
            type="primary"
            style={{
              background: "#FFCC00",
              color: "#001F54",
              border: "none",
              fontWeight: 600,
            }}
            onClick={() => navigate("/adm/flight/new")}
          >
            + 항공편 등록
          </Button>
        </Header>

        {/* ✅ 콘텐츠 */}
        <Content style={{ padding: "40px 60px" }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Title level={4} style={{ margin: 0, color: "#001F54" }}>
                항공편 목록
              </Title>
              <Text type="secondary">
                총 {flights.length.toLocaleString()}건의 항공편이 등록됨
              </Text>
            </div>

            <Table
              columns={columns}
              dataSource={Array.isArray(flights) ? flights : []}
              rowKey={(record) => `${record.flightId}_${record.depTime}`}
              loading={loading}
              bordered
              pagination={{ pageSize: 10 }}
              style={{
                borderRadius: 8,
                overflow: "hidden",
              }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminFlightListPage;
