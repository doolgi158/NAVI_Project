import React, { useState } from "react";
import { Tabs, Space, Input, DatePicker, Select, Typography, Button } from "antd";
import { SearchOutlined, CalendarOutlined, ReloadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const AdminPaymentHeader = ({ onTabChange, onSearch, onFilter }) => {
  const [activeTab, setActiveTab] = useState("ACC");
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
          }}
        >
          결제 관리
        </Title>
      </div>

      {/* 상단 탭 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarStyle={{ marginBottom: 12 }}
        items={[
          {
            key: "ACC",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "ACC" ? "#1677ff" : "#333",
                }}
              >
                숙소 결제
              </span>
            ),
          },
          {
            key: "FLY",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "FLY" ? "#1677ff" : "#333",
                }}
              >
                항공 결제
              </span>
            ),
          },
          {
            key: "DLV",
            label: (
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: activeTab === "DLV" ? "#1677ff" : "#333",
                }}
              >
                짐배송 결제
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
          placeholder="결제번호 / 예약ID 검색"
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
          <RangePicker
            suffixIcon={<CalendarOutlined />}
            style={{ height: 40, borderRadius: 8 }}
          />
          <Select
            value={filterValue}
            style={{ width: 160, height: 40 }}
            options={[
              { label: "전체", value: "ALL" },
              { label: "결제완료", value: "PAID" },
              { label: "환불완료", value: "REFUNDED" },
              { label: "결제실패", value: "FAILED" },
            ]}
            onChange={handleFilterChange}
          />
        </Space>
      </Space>
    </div>
  );
};

export default AdminPaymentHeader;
