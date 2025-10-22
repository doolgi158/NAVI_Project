import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminTravelList,
  deleteAdminTravel,
  updateAdminTravelState,
} from "../../../common/api/adminTravelApi";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Typography,
  Input,
  Image,
  Layout,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";

const { Title, Link } = Typography;
const { Option } = Select;

export default function AdminTravelList() {
  const navigate = useNavigate();
  const [travelData, setTravelData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputKeyword, setInputKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const sizeOptions = [10, 20, 50, 100];

  /** ✅ 목록 로드 */
  const loadTravels = async (
    pageToLoad,
    keyword = searchKeyword,
    size = pageSize,
    sort = sortField,
    order = sortOrder
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminTravelList(
        pageToLoad,
        size,
        keyword || "",
        sort,
        order
      );
      const data = response.data;

      if (!data || !Array.isArray(data.content))
        throw new Error("유효하지 않은 데이터 형식입니다.");
      setTravelData({
        content: data.content,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        number: data.number,
      });
      setPage(pageToLoad);
      setSearchKeyword(keyword || "");
      setInputKeyword(keyword || "");
    } catch (err) {
      console.error("관리자 여행지 목록 로딩 실패:", err);
      message.error("목록 로딩 실패: " + (err.message || "서버 오류"));
      setError("목록 로딩 실패");
      setTravelData({ content: [], totalPages: 0, totalElements: 0, number: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravels(0, "", pageSize);
  }, [pageSize]);

  const handleSearch = (value) => loadTravels(0, value);
  const handlePageChange = (pageNumber, newSize) =>
    loadTravels(pageNumber - 1, searchKeyword, newSize || pageSize);
  const handleTitleClick = (travelId) =>
    navigate(`/adm/travel/detail/${travelId}`);

  const handleDelete = async (travelId) => {
    try {
      await deleteAdminTravel(travelId);
      message.success(`ID ${travelId} 삭제 완료`);
      const newPage =
        travelData.content.length === 1 && page > 0 ? page - 1 : page;
      loadTravels(newPage, searchKeyword);
    } catch (err) {
      console.error("삭제 실패:", err);
      message.error(`삭제 실패: ${err.response?.data?.message || err.message}`);
    }
  };

  /** ✅ 날짜 포맷 함수 */
  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return (
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ` +
      `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`
    );
  };

  const formatNumber = (num) => (num ?? 0).toLocaleString("ko-KR");

  /** ✅ 다중 상태 변경 */
  const handleBatchStateChange = async (newState) => {
    if (selectedRowKeys.length === 0) {
      message.warning("먼저 항목을 선택하세요.");
      return;
    }
    try {
      await updateAdminTravelState(selectedRowKeys, newState);
      message.success(
        `선택한 ${selectedRowKeys.length}개 항목을 ${newState === 1 ? "공개" : "비공개"
        }로 변경했습니다.`
      );
      setSelectedRowKeys([]);
      loadTravels(page, searchKeyword);
    } catch (err) {
      console.error("상태 변경 실패:", err);
      message.error("상태 변경 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 테이블 정렬 핸들러 */
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || "ascend");
      loadTravels(page, searchKeyword, pageSize, sorter.field, sorter.order);
    }
  };

  /** ✅ 컬럼 정의 (정렬 추가됨) */
  const columns = [
    { title: "ID", dataIndex: "travelId", key: "travelId", align: "center", sorter: true },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      align: "center",
      sorter: true,
      render: (text, record) => (
        <Link
          onClick={() => handleTitleClick(record.travelId)}
          style={{ cursor: "pointer", color: "#1677ff" }}
        >
          {text}
        </Link>
      ),
    },
    { title: "콘텐츠ID", dataIndex: "contentId", key: "contentId", align: "center", sorter: true },
    { title: "지역", dataIndex: "region2", key: "region2", align: "center", sorter: true },
    {
      title: "공개상태",
      dataIndex: "state",
      key: "state",
      align: "center",
      sorter: true,
      render: (state) => (
        <Tag color={state === 1 ? "green" : "volcano"}>
          {state === 1 ? "공개" : "비공개"}
        </Tag>
      ),
    },
    {
      title: "조회수",
      dataIndex: "views",
      key: "views",
      align: "center",
      sorter: true,
      render: (views) => formatNumber(views),
    },
    {
      title: "좋아요",
      dataIndex: "likeCount",
      key: "likeCount",
      align: "center",
      sorter: true,
      render: (likes) => formatNumber(likes),
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: true,
      render: formatDateTime,
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      sorter: true,
      render: formatDateTime,
    },
    {
      title: "관리",
      key: "action",
      align: "center",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/adm/travel/edit/${record.travelId}`)}
          >
            수정
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.travelId)}
            okText="삭제"
            cancelText="취소"
          >
            <Button icon={<DeleteOutlined />} danger>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys) => setSelectedRowKeys(newSelectedKeys),
  };

  return (
    <Layout className="min-h-screen">
      <AdminSiderLayout />
      <Layout>
        <Header
          className="px-6 shadow flex items-center text-xl font-bold"
          style={{ background: "#fefce8" }}
        >
          NAVI 관리자 페이지
        </Header>
        <Content
          className="p-1"
          style={{ minHeight: "100vh", padding: "24px", background: "#fefce843" }}
        >
          <div style={{ padding: "24px" }}>
            <Title level={3} style={{ marginBottom: "24px" }}>
              여행지 관리 목록
            </Title>

            {/* 🔍 검색 & 등록 버튼 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                gap: "16px",
              }}
            >
              <Input.Search
                placeholder="제목 또는 지역으로 검색"
                enterButton="검색"
                size="large"
                onSearch={handleSearch}
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                style={{ flex: 1, maxWidth: 700 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/adm/travel/register")}
              >
                새 여행지 등록
              </Button>
            </div>

            {/* ✅ 일괄 상태 변경 */}
            <Space style={{ marginBottom: 16 }}>
              <Button
                icon={<EyeOutlined />}
                type="default"
                onClick={() => handleBatchStateChange(1)}
                disabled={selectedRowKeys.length === 0}
              >
                공개로 변경
              </Button>
              <Button
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleBatchStateChange(0)}
                disabled={selectedRowKeys.length === 0}
              >
                비공개로 변경
              </Button>

              <Select
                value={pageSize}
                onChange={(value) => setPageSize(value)}
                style={{ width: 120, marginLeft: 12 }}
              >
                {sizeOptions.map((num) => (
                  <Option key={num} value={num}>
                    {num}개씩 보기
                  </Option>
                ))}
              </Select>
            </Space>

            {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={(travelData.content || []).map((item) => ({
                ...item,
                key: item.travelId,
              }))}
              scroll={{ x: 1600 }}
              loading={loading}
              onChange={handleTableChange}
              pagination={{
                current: page + 1,
                pageSize: pageSize,
                total: travelData.totalElements,
                onChange: handlePageChange,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / 총 ${total}개`,
              }}
              rowKey="travelId"
              bordered
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
