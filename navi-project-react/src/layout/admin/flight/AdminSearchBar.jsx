// src/admin/layout/AdminSearchBar.jsx
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

/**
 * ✅ 관리자 공통 검색바
 * @param {string} placeholder - 입력 힌트
 * @param {string} value - 현재 검색어
 * @param {Function} onChange - 입력 변경 핸들러
 */
const AdminSearchBar = ({ placeholder, value, onChange }) => {
    return (
        <Input
            placeholder={placeholder || "검색어를 입력하세요."}
            prefix={<SearchOutlined />}
            value={value}
            onChange={onChange}
            style={{ width: 220 }}
            allowClear
        />
    );
};

export default AdminSearchBar;
