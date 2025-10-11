import { Layout, Table, Typography } from "antd";
import AdminSiderLayout from "../layout/AdminSiderLayout";

const { Content } = Layout;
const { Title } = Typography;

const columns = [
  { title: "번호", dataIndex: "user_no", key: "user_no", align: "center", width: 80 },
  { title: "아이디", dataIndex: "user_id", key: "user_id", align: "center", width: 120 },
  { title: "이름", dataIndex: "user_name", key: "user_name", align: "center", width: 100 },
  { title: "성별", dataIndex: "user_gender", key: "user_gender", align: "center", width: 80 },
  { title: "생년월일", dataIndex: "user_birth", key: "user_birth", align: "center", width: 120 },
  { title: "이메일", dataIndex: "user_email", key: "user_email", align: "center", width: 200 },
  { title: "연락처", dataIndex: "user_phone", key: "user_phone", align: "center", width: 140 },
  { title: "내/외국인", dataIndex: "user_local", key: "user_local", align: "center", width: 100 },
  { title: "가입일", dataIndex: "user_signup", key: "user_signup", align: "center", width: 160 },
  { title: "상태", dataIndex: "user_state", key: "user_state", align: "center", width: 100 },
];

// 샘플 데이터
const data = [
  {
    key: 1,
    user_no: 1,
    user_id: "navi001",
    user_name: "홍길동",
    user_gender: "남",
    user_birth: "1990-01-01",
    user_email: "hong@test.com",
    user_phone: "010-1234-5678",
    user_local: "내국인",
    user_signup: "2025-01-01",
    user_state: "정상",
  }];

const AdminUsersPage = () => {
    return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 좌측 메뉴 */}
      <AdminSiderLayout />

      {/* 우측 콘텐츠 */}
      <Layout style={{ padding: "20px" }}>
        <Content
          className="bg-white rounded-md shadow-md p-6"
          style={{ margin: "20px", minHeight: 360 }}
        >
          <Title level={4} style={{ marginBottom: "20px" }}>
            사용자 상세 목록
          </Title>

          <Table
            columns={columns}
            dataSource={data}
            bordered
            pagination={{
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "50", "100"]
            }}
            scroll={{ y: 500, x: 1200 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminUsersPage;