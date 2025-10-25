import React, { useState } from "react";
import { Tabs, Space, Input, DatePicker, Select, Typography, Button } from "antd";
import { SearchOutlined, CalendarOutlined, ReloadOutlined, HomeOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const AdminAccHeader = ({ onTabChange, onSearch, onFilter }) => {
  const [activeTab, setActiveTab] = useState("API");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("ALL");

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
    onTabChange?.(key);
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
