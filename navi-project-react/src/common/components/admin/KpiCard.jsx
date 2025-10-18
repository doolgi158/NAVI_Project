import { Card, Space, Typography, Tag } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const pctColor = (n) => (n >= 0 ? "green" : "red");
const PCT_ICON = ({ v }) => (v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />);

const KpiCard = ({ title, value, suffix, diff, icon, color = "#111827" }) => (
    <Card>
        <Space align="center">
            <div style={{
                width: 40, height: 40, borderRadius: 10, display: "grid",
                placeItems: "center", background: "#f3f4f6",
            }}>
                {icon}
            </div>
            <div>
                <Text type="secondary">{title}</Text>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <Title level={3} style={{ margin: 0, color }}>
                        {value}
                        {suffix && <Text type="secondary" style={{ marginLeft: 6 }}>{suffix}</Text>}
                    </Title>
                    {typeof diff === "number" && (
                        <Tag color={pctColor(diff)} style={{ borderRadius: 6 }}>
                            <PCT_ICON v={diff} /> {Math.abs(diff)}%
                        </Tag>
                    )}
                </div>
            </div>
        </Space>
    </Card>
);

export default KpiCard;