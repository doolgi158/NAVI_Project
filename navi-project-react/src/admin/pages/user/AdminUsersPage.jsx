import { useEffect, useState } from "react";
import { Layout, Table, Typography, Input, Button, Space, Tag, message, Select } from "antd";
import { SearchOutlined, DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { API_SERVER_HOST } from "../../../common/api/naviApi";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchUsers(page, search, filterField, pageSize);
  }, [page, search, filterField, pageSize]);

  // 사용자 목록 가져오기
  const fetchUsers = async (pageNum = 1, keyword = "", field = "all", size = pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${API_SERVER_HOST}/api/adm/users`, {
        params: { page: pageNum - 1, size, keyword, field },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = res.data;
      setUsers(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      message.error("사용자 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, search, filterField, pageSize);
  };

  // 삭제 처리
  const handleDelete = async (userNo) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_SERVER_HOST}/api/admin/users/${userNo}`);
      message.success("삭제되었습니다.");
      fetchUsers(page, search, filterField);
    } catch (err) {
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const columns = [
    // 🧍 기본 정보
    { title: "번호", dataIndex: "userNo", key: "userNo", align: "center", width: 70, },
    { title: "아이디", dataIndex: "userId", key: "userId", align: "center", width: 120, },
    { title: "이름", dataIndex: "userName", key: "userName", align: "center", width: 100, },
    {
      title: "성별", dataIndex: "userGender", key: "userGender", align: "center", width: 80,
      render: (gender) => gender === "M" ? "남" : gender === "F" ? "여" : "-",
    },
    { title: "생년월일", dataIndex: "userBirth", key: "userBirth", align: "center", width: 120, },
    { title: "내/외국인", dataIndex: "userLocal", key: "userLocal", align: "center", width: 90, },

    // ✉️ 연락/계정 정보
    { title: "이메일", dataIndex: "userEmail", key: "userEmail", align: "center", width: 200, ellipsis: true, },
    { title: "연락처", dataIndex: "userPhone", key: "userPhone", align: "center", width: 130, },
    { title: "가입일", dataIndex: "userSignup", key: "userSignup", align: "center", width: 160, },

    // 🕓 접속/활동 정보
    {
      title: "상태", dataIndex: "userState", key: "userState", align: "center", width: 90,
      render: (state) => state === "NORMAL" ? (
        <Tag color="green">정상</Tag>
      ) : state === "SLEEP" ? (
        <Tag color="gray">휴면</Tag>
      ) : (
        <Tag color="red">탈퇴</Tag>
      ),
    },
    { title: "IP", dataIndex: "historyIp", key: "historyIp", align: "center", width: 130, },
    {
      title: "로그인 시간", dataIndex: "historyLogin", key: "historyLogin", align: "center", width: 160,
      render: (val) => val || "-",
    },
    {
      title: "로그아웃 시간", dataIndex: "historyLogout", key: "historyLogout", align: "center", width: 160,
      render: (val) => val || "-",
    },

    // ⚙️ 관리
    {
      title: "관리", key: "actions", align: "center", fixed: "right", width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.userNo)}
        >
          삭제
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 좌측 사이드 메뉴 */}
      <AdminSiderLayout />

      {/* 콘텐츠 */}
      <Layout style={{ padding: "20px" }}>
        <Content
          className="bg-white rounded-md shadow-md p-6"
          style={{ margin: "20px", minHeight: 360 }}
        >
          {/* 상단 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <Title level={4} style={{ margin: 0 }}>
              사용자 관리 목록
            </Title>
            <Space>
              {/* 필터 */}
              <Select
                value={filterField}
                onChange={(value) => setFilterField(value)}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">전체</Option>
                <Option value="userNo">번호</Option>
                <Option value="userId">아이디</Option>
                <Option value="userName">이름</Option>
                <Option value="userGender">성별</Option>
                <Option value="userEmail">이메일</Option>
                <Option value="userPhone">연락처</Option>
                <Option value="userLocal">내/외국인</Option>
                <Option value="userState">상태</Option>
                <Option value="userSignup">가입일</Option>
                <Option value="historyIp">IP</Option>
              </Select>

              {/* 검색 입력 */}
              <Input
                placeholder="검색어 입력"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 250 }}
              />

              {/* 검색 버튼 */}
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="bg-[#4A9E8C] hover:bg-[#3A8576]"
              >
                검색
              </Button>
            </Space>
          </div>

          {/* 테이블 */}
          <Table
            columns={columns}
            dataSource={users}
            bordered
            loading={loading}
            rowKey={(record) => record.userNo}
            pagination={{
              current: page,
              total,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
              showTotal: (t) => `총 ${t}명`,
              onChange: (p, size) => {
                if (size !== pageSize) {
                  setPageSize(size);
                  setPage(1);
                  fetchUsers(1, search, filterField, size);
                } else {
                  setPage(p);
                  fetchUsers(p, search, filterField, size);
                }
              },
            }}
            scroll={{ x: 1600, y: 600 }}
            sticky={{ offsetHeader: 64 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminUsersPage;
