import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const DashboardUsageChart = ({ data }) => (
    <ChartCard title="이용량 트렌드 (조회/예약)">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="travelViews" name="여행지 조회" stroke={COLORS[0]} fill="url(#g1)" />
            <Area type="monotone" dataKey="accViews" name="숙소 조회" stroke={COLORS[2]} fill="url(#g2)" />
            <Line type="monotone" dataKey="flightResv" name="항공 예약" stroke={COLORS[1]} strokeWidth={2} />
            <Line type="monotone" dataKey="deliveryResv" name="짐배송 예약" stroke={COLORS[3] || "#FF9800"} strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
    </ChartCard>
);

export default DashboardUsageChart;