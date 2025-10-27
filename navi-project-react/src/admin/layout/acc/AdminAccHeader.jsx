import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Space, Input, Select, Typography, Button } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;

/* ==========================================================
   [AdminAccHeader]
   - 숙소 관리 페이지 상단 Header
   - 숙소/예약 탭 이동, 검색, 필터링 제어
   - ✅ 초기화 버튼 추가
   - ✅ 숙소예약 탭일 때 RsvStatus 필터 세트로 변경
========================================================== */
const AdminAccHeader = ({ onTabChange, onSearch, onFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("API");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");

  // ✅ URL 변화 시 탭 동기화
  useEffect(() => {
    if (location.pathname.includes("/accommodations/reservations")) {
      setActiveTab("RSV");
    } else if (location.pathname.includes("/accommodations")) {
      setActiveTab("API");
    }
  }, [location.pathname]);

  // ✅ 검색 실행
  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  // ✅ 필터 변경
  const handleFilterChange = (value) => {
    setFilterValue(value);
    onFilter?.(value);
  };

  // ✅ 탭 변경
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchValue("");
    setFilterValue("ALL");
    onSearch?.("");
    onFilter?.("ALL");

    if (key === "RSV") {
      navigate("/adm/accommodations/reservations");
    } else {
      onTabChange?.(key);
      navigate("/adm/accommodations/list");
    }
  };

  // ✅ 초기화 버튼
  const handleReset = () => {
    setSearchValue("");
    setFilterValue("ALL");
    onSearch?.("");
    onFilter?.("ALL");
  };

  // ✅ 필터 옵션 (탭에 따라 다르게 표시)
  const filterOptions =
    activeTab === "RSV"
      ? [
          { label: "전체", value: "ALL" },
          { label: "예약 중", value: "PENDING" },
          { label: "결제 완료", value: "PAID" },
          { label: "예약 취소", value: "CANCELLED" },
          { label: "환불 완료", value: "REFUNDED" },
          { label: "예약 실패", value: "FAILED" },
          //{ label: "이용 완료 (COMPLETE)", value: "COMPLETE" },
        ]
      : [
          { label: "전체", value: "ALL" },
          { label: "운영중", value: "ACTIVE" },
          { label: "비활성", value: "INACTIVE" },
        ];

  return (
    <div className="bg-white shadow-md rounded-xl p-5 mb-4 border border-gray-100">
      {/* 상단 타이틀 */}
      <div className="flex justify-between items-center mb-3">
        <Title
          level={3}
          style={{
            margin: 0,
            fontWeight: 700,
            color: "#1f2937",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          숙소 관리
        </Title>
      </div>

      {/* 탭 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarStyle={{ marginBottom: 12 }}
        items={[
          {
            key: "API",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "API" ? "#1677ff" : "#333",
                }}
              >
                TourAPI 숙소
              </span>
            ),
          },
          {
            key: "SELF",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "SELF" ? "#1677ff" : "#333",
                }}
              >
                자체 등록 숙소
              </span>
            ),
          },
          {
            key: "RSV",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "RSV" ? "#1677ff" : "#333",
                }}
              >
                숙소 예약 관리
              </span>
            ),
          },
        ]}
      />

      {/* 검색 + 필터 + 초기화 */}
      <Space
        wrap
        style={{
          marginTop: 8,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* 검색창 */}
        <Input
          prefix={<SearchOutlined />}
          placeholder={
            activeTab === "RSV"
              ? "예약자명 / 숙소명 / 예약 ID 검색"
              : "숙소명 / 주소 / 숙소 ID 검색"
          }
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={handleSearch}
          style={{
            width: 320,
            height: 40,
            borderRadius: 8,
          }}
        />

        <Space wrap>
          {/* 필터 */}
          <Select
            value={filterValue}
            style={{ width: 200, height: 40 }}
            options={filterOptions}
            onChange={handleFilterChange}
          />

          {/* 초기화 버튼 */}
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{
              height: 40,
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            초기화
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default AdminAccHeader;
