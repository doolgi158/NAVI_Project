import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminTravelList,
  deleteAdminTravel,
  updateAdminTravelState,
} from "../../../common/api/adminTravelApi";
import {
  ConfigProvider,
  Table,
  Button,
  Space,
  Popconfirm,
  Tag,
  message,
  Typography,
  Input,
  Layout,
  Select,
  Card,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";

const { Title, Link } = Typography;
const { Option } = Select;

const NAVI_BLUE = "#0A3D91";

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

  // ✅ 최초 1회만 초기 로드 (중복 호출 방지)
  useEffect(() => {
    if (travelData.content.length === 0) {
      loadTravels(0, "", pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value) => {
    const trimmed = (value || "").replace(/\s+/g, ""); // 모든 공백 제거
    loadTravels(0, trimmed);
  };

  const handlePageChange = (pageNumber) => {
    loadTravels(pageNumber - 1, searchKeyword, pageSize, sortField, sortOrder);
  };

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
      message.error("상태 변경 중 오류가 발생했습니다. (콘솔 확인)");
    }
  };

  /** ✅ 테이블 정렬 핸들러 (정렬만 처리) */
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || "ascend");
      loadTravels(page, searchKeyword, pageSize, sorter.field, sorter.order);
    }
  };

  /** ✅ 컬럼 정의 (정렬 추가됨) */
  const columns = [
    {
      title: "No",
      key: "no",
      align: "center",
      width: 80,
      render: (_, __, index) => page * pageSize + (index + 1),
    },
    { title: "ID", dataIndex: "travelId", key: "travelId", align: "center", sorter: true, width: 100 },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      align: "left",
      sorter: true,
      render: (text, record) => (
        <Link
          onClick={() => handleTitleClick(record.travelId)}
          style={{ cursor: "pointer" }}
        >
          {text}
        </Link>
      ),
      ellipsis: true,
    },
    { title: "콘텐츠ID", dataIndex: "contentId", key: "contentId", align: "center", sorter: true, width: 120 },
    { title: "지역", dataIndex: "region2", key: "region2", align: "center", width: 120 },
    {
      title: "상태",
      dataIndex: "state",
      key: "state",
      align: "center",
      sorter: true,
      width: 100,
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
      align: "right",
      sorter: true,
      width: 110,
      render: (v) => formatNumber(v),
    },
    {
      title: "좋아요",
      dataIndex: "likeCount",
      key: "likeCount",
      align: "right",
      sorter: true,
      width: 110,
      render: (v) => formatNumber(v),
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: true,
      width: 160,
      render: formatDateTime,
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      sorter: true,
      width: 160,
      render: formatDateTime,
    },
    {
      title: "관리",
      key: "action",
      align: "center",
      fixed: "right",
      width: 190,
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: NAVI_BLUE,
          colorInfo: NAVI_BLUE,
          borderRadius: 12,
          controlHeight: 36,
          colorBgLayout: "#F7F8FB",
          fontSize: 14,
        },
        components: {
          Table: {
            borderRadius: 12,
            headerBg: "#F2F5FA",
            headerColor: "#1F2937",
            rowHoverBg: "#F7FAFF",
            cellPaddingBlock: 12,
            cellPaddingInline: 12,
          },
          Button: {
            borderRadius: 10,
          },
          Card: {
            borderRadiusLG: 14,
            headerBg: "#FFFFFF",
          },
          Tag: {
            borderRadiusSM: 8,
          },
          Input: {
            borderRadius: 10,
          },
          Select: {
            borderRadius: 10,
          },
        },
      }}
    >
      <Layout className="min-h-screen" style={{ background: "#F7F8FB" }}>
        <AdminSiderLayout />
        <Layout>
          <Header
            className="px-6 flex items-center"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
              height: 64,
            }}
          >
            <h2 style={{ margin: 0, color: NAVI_BLUE, fontWeight: 700 }}>
              NAVI 관리자 – 여행지
            </h2>
          </Header>

          <Content style={{ padding: 24 }}>
            <Card
              bordered={false}
              style={{ boxShadow: "0 6px 20px rgba(10,61,145,0.06)" }}
              bodyStyle={{ padding: 20 }}
            >
              {/* 헤더 툴바 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {/* 검색 */}
                <Input
                  placeholder="제목으로 검색 (공백 무시)"
                  prefix={<SearchOutlined />}
                  allowClear
                  value={inputKeyword}
                  onChange={(e) => setInputKeyword(e.target.value)}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 280 }}
                />
                <Button type="primary" onClick={() => handleSearch(inputKeyword)}>
                  검색
                </Button>

                <Divider type="vertical" />

                {/* 상태 일괄 변경 */}
                <Space.Compact>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleBatchStateChange(1)}
                    disabled={selectedRowKeys.length === 0}
                  >
                    공개
                  </Button>
                  <Button
                    icon={<EyeInvisibleOutlined />}
                    onClick={() => handleBatchStateChange(0)}
                    disabled={selectedRowKeys.length === 0}
                  >
                    비공개
                  </Button>
                </Space.Compact>

                <Divider type="vertical" />

                {/* 페이지 크기 */}
                <Select
                  value={pageSize}
                  onChange={(value) => setPageSize(value)}
                  style={{ width: 140 }}
                  options={sizeOptions.map((n) => ({
                    label: `${n}개씩 보기`,
                    value: n,
                  }))}
                />

                <div style={{ flex: 1 }} />

                {/* 신규 등록 */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/adm/travel/register")}
                >
                  새 여행지
                </Button>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {error && (
                <div
                  style={{
                    color: "#B91C1C",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    padding: "8px 12px",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={(travelData.content || []).map((item) => ({
                  ...item,
                  key: item.travelId,
                }))}
                size="middle"
                sticky
                tableLayout="fixed"
                rowHoverable
                bordered={false}
                scroll={{ x: 1400 }}
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
                // 줄무늬 & 호버 강조
                rowClassName={(_, index) =>
                  index % 2 === 0 ? "zebra-row" : ""
                }
              />
            </Card>
          </Content>
        </Layout>
      </Layout>

      {/* 테이블 줄무늬용 경량 스타일 */}
      <style>{`
        .zebra-row td {
          background: #FAFCFF;
        }
        .ant-typography a {
          color: ${NAVI_BLUE};
        }
        .ant-typography a:hover {
          opacity: .85;
        }
      `}</style>
    </ConfigProvider>
  );
}
