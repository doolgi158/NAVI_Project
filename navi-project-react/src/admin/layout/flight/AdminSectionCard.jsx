// src/admin/layout/AdminSectionCard.jsx
import { Card, Space, Typography } from "antd";

const { Title } = Typography;

/*
 * 관리자 페이지 공통 카드 레이아웃
 * @param {string} title - 제목
 * @param {ReactNode} extra - 우측 버튼/검색바 등 추가 요소
 * @param {ReactNode} children - 내부 콘텐츠 (테이블, 폼 등)
 */
const AdminSectionCard = ({ title, extra, children }) => {
    return (
        <Card
            bordered
            style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                padding: "16px 20px",
            }}
        >
            {/* 상단 제목 + 우측 버튼 */}
            <div className="flex justify-between items-center mb-4">
                <Title level={4} style={{ margin: 0 }}>
                    {title}
                </Title>
                <Space>{extra}</Space>
            </div>

            {/* 본문 콘텐츠 */}
            {children}
        </Card>
    );
};

export default AdminSectionCard;
