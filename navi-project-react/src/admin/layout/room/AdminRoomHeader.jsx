import React, { useState } from "react";
import {
  Space,
  Input,
  Typography,
  Button,
  DatePicker,
  message,
  Divider,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminRoomHeader = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState([]);

  // ✅ 검색 버튼 클릭
  const handleSearch = () => {
    if (!keyword.trim()) {
      message.warning("숙소명 또는 숙소 ID를 입력해주세요.");
      return;
    }
    onSearch?.({ keyword, dateRange });
  };

  // ✅ 초기화 버튼 클릭
  const handleReset = () => {
    setKeyword("");
    setDateRange([]);
    onSearch?.({ keyword: "", dateRange: [] });
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
      {/* 상단 타이틀 */}
      <div className="flex justify-between items-center mb-4">
        <Title
          level={3}
          style={{
            margin: 0,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          객실 관리
        </Title>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* 검색 조건 영역 */}
      <Space size="middle" wrap>
        <Input
          placeholder="숙소명 또는 숙소 ID 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
          size="large"
          allowClear
        />

        {/* <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates || [])}
          placeholder={["시작일", "종료일"]}
          size="large"
        /> */}

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          size="large"
        >
          검색
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          size="large"
        >
          초기화
        </Button>
      </Space>
    </div>
  );
};

export default AdminRoomHeader;
