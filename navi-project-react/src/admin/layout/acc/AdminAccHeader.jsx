import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Space, Input, Select, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

/* ==========================================================
   [AdminAccHeader]
   - 숙소 관리 페이지 상단 Header
   - 숙소/예약 탭 이동, 검색, 필터링 제어
========================================================== */
const AdminAccHeader = ({ onTabChange, onSearch, onFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("API");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");

  // ✅ 현재 URL에 따라 초기 탭 상태 동기화
  useEffect(() => {
    if (location.pathname.includes("/accommodations/reservations")) {
      setActiveTab("RSV");
    } else if (location.pathname.includes("/accommodations")) {
      // 기본은 숙소 목록 (type 상태로 구분됨)
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

    if (key === "RSV") {
      // ✅ 숙소 예약 관리 탭 클릭 → 예약 페이지로 이동
      navigate("/adm/accommodations/reservations");
    } else {
      // ✅ 숙소 탭 클릭 → 숙소 목록 페이지로 이동
      onTabChange?.(key);
      navigate("/adm/accommodations/list");
    }
  };

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

      {/* 상단 탭 */}
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

      {/* 🔍 검색 & 필터 */}
      <Space
        wrap
        style={{
          marginTop: 8,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="숙소명 / 주소 / 숙소 ID 검색"
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
          <Select
            value={filterValue}
            style={{ width: 160, height: 40 }}
            options={[
              { label: "전체", value: "ALL" },
              { label: "운영중", value: "ACTIVE" },
              { label: "비활성", value: "INACTIVE" },
            ]}
            onChange={handleFilterChange}
          />
        </Space>
      </Space>
    </div>
  );
};

export default AdminAccHeader;
