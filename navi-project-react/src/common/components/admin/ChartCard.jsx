import { Card } from "antd";
import { ResponsiveContainer } from "recharts";

const ChartCard = ({ title, extra, children }) => (
    <Card title={title} extra={extra} bodyStyle={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
            {children}
        </ResponsiveContainer>
    </Card>
);

export default ChartCard;