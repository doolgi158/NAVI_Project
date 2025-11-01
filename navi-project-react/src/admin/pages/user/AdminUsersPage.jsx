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

  // 페이지 관련 상태 (클라이언트 페이지네이션)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAllUsers("", "all");
  }, []);

  // ✅ 전체 리스트 불러오기 (백엔드에서 한 번만)
  const fetchAllUsers = async (keyword = "", field = "all") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_SERVER_HOST}/api/adm/users`, {
        params: { page: 0, size: 10000, keyword, field }, // ← 전체 가져오기
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = res.data;
      setUsers(data?.content || data || []);
    } catch (err) {
      console.error(err);
      message.error("사용자 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      message.info("검색어를 입력해주세요.");
      return;
    }

    setLoading(true);
    setPage(1);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_SERVER_HOST}/api/adm/users`, {
        params: { page: 0, size: 10000, keyword: search, field: filterField },
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiData = res.data?.data;
      const list = Array.isArray(apiData)
        ? apiData
        : Array.isArray(apiData?.content)
          ? apiData.content
          : [];

      setUsers(list);

      if (list.length === 0) message.info("검색 결과가 없습니다.");
    } catch (err) {
      console.error(err);
      message.error("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userNo) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_SERVER_HOST}/api/adm/${userNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("삭제되었습니다.");
      fetchAllUsers(search, filterField);
    } catch (err) {
      console.error(err);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const columns = [
    { title: "번호", dataIndex: "userNo", key: "userNo", align: "center", width: 70 },
    { title: "아이디", dataIndex: "userId", key: "userId", align: "center", width: 120 },
    { title: "이름", dataIndex: "userName", key: "userName", align: "center", width: 100 },
    {
      title: "성별",
      dataIndex: "userGender",
      key: "userGender",
      align: "center",
      width: 80,
      render: (g) => (g === "M" ? "남" : g === "F" ? "여" : "-"),
    },
    { title: "생년월일", dataIndex: "userBirth", key: "userBirth", align: "center", width: 120 },
    { title: "내/외국인", dataIndex: "userLocal", key: "userLocal", align: "center", width: 90 },
    { title: "이메일", dataIndex: "userEmail", key: "userEmail", align: "center", width: 200, ellipsis: true },
    { title: "연락처", dataIndex: "userPhone", key: "userPhone", align: "center", width: 130 },
    { title: "가입일", dataIndex: "userSignup", key: "userSignup", align: "center", width: 160 },
    {
      title: "상태",
      dataIndex: "userState",
      key: "userState",
      align: "center",
      width: 90,
      render: (s) =>
        s === "NORMAL" ? <Tag color="green">정상</Tag> :
          s === "SLEEP" ? <Tag color="gray">휴면</Tag> :
            <Tag color="red">탈퇴</Tag>,
    },
    { title: "IP", dataIndex: "historyIp", key: "historyIp", align: "center", width: 130 },
    { title: "로그인 시간", dataIndex: "historyLogin", key: "historyLogin", align: "center", width: 160, render: (v) => v || "-" },
    { title: "로그아웃 시간", dataIndex: "historyLogout", key: "historyLogout", align: "center", width: 160, render: (v) => v || "-" },
    {
      title: "관리",
      key: "actions",
      align: "center",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button type="primary" danger onClick={() => handleDelete(record.userNo)}>
          삭제
        </Button>
      ),
    },
  ];

  // ✅ 클라이언트 사이드 페이지 슬라이싱
  const paginatedData = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSiderLayout />
      <Layout style={{ padding: "20px" }}>
        <Content className="bg-white rounded-md shadow-md p-6" style={{ margin: "20px", minHeight: 360 }}>
          {/* 상단 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <Title level={4} style={{ margin: 0 }}>사용자 관리 목록</Title>
            <Space>
              <Select
                value={filterField}
                onChange={setFilterField}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">전체</Option>
                <Option value="userId">아이디</Option>
                <Option value="userName">이름</Option>
                <Option value="userEmail">이메일</Option>
                <Option value="userPhone">연락처</Option>
                <Option value="userLocal">내/외국인</Option>
                <Option value="userState">상태</Option>
                <Option value="userSignup">가입일</Option>
              </Select>
              <Input
                placeholder="검색어 입력"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 250 }}
              />
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

          {/* ✅ 프론트 페이지네이션 Table */}
          <Table
            columns={columns}
            dataSource={paginatedData}
            bordered
            loading={loading}
            rowKey={(r) => r.userNo}
            pagination={{
              current: page,
              pageSize,
              total: users.length, // 전체 길이 기준
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
              showTotal: (t) => `총 ${t}명`,
              onChange: (p, s) => {
                setPage(p);
                setPageSize(s);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              onShowSizeChange: (_, s) => {
                setPage(1);
                setPageSize(s);
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