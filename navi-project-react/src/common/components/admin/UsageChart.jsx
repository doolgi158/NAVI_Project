import {
    AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    Line, ResponsiveContainer
} from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "@/admin/mockdata/dashboardMockData";

const DashboardUsageChart = ({ data }) => (
    <ChartCard title="이용량 트렌드 (조회/예약)">
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                {/* 그래디언트 정의 */}
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
                <XAxis
                    dataKey="name"
                    tickFormatter={(v) => {
                        // 일간일 경우 YYYY-MM-DD 포맷 단축
                        if (v?.includes("-")) return v.slice(5);
                        return v;
                    }}
                />
                <YAxis />
                <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name) => {
                        const labels = {
                            travelViews: "여행지 조회",
                            accViews: "숙소 조회",
                            flightResv: "항공 예약",
                            deliveryResv: "짐배송 예약",
                        };
                        return [`${value.toLocaleString()}건`, labels[name] || name];
                    }}
                />
                <Legend />

                {/* 여행지/숙소 조회 */}
                <Area
                    type="monotone"
                    dataKey="travelViews"
                    name="여행지 조회"
                    stroke={COLORS[0]}
                    fill="url(#g1)"
                />
                <Area
                    type="monotone"
                    dataKey="accViews"
                    name="숙소 조회"
                    stroke={COLORS[2]}
                    fill="url(#g2)"
                />

                {/* 항공/짐배송 예약 */}
                <Line
                    type="monotone"
                    dataKey="flightResv"
                    name="항공 예약"
                    stroke={COLORS[1]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
                <Line
                    type="monotone"
                    dataKey="deliveryResv"
                    name="짐배송 예약"
                    stroke={COLORS[3] || "#FF9800"}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    </ChartCard>
);

export default DashboardUsageChart;
