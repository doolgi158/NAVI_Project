import {
    AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    Line, ResponsiveContainer
} from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "@/admin/mockdata/dashboardMockData";
import { formatTickLabel } from "@/common/util/dateFormat";


const UsageChart = ({ data, range = "monthly" }) => (
    <ChartCard title="이용량 트렌드 (조회/예약)">
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={(v) => formatTickLabel(v, range)} />
                <YAxis />
                <Tooltip
                    formatter={(v, name) => {
                        const labels = {
                            travelViews: "여행지 조회",
                            accViews: "숙소 조회",
                            flightResv: "항공 예약",
                            deliveryResv: "짐배송 예약",
                        };
                        return [`${v.toLocaleString()}건`, labels[name] || name];
                    }}
                />
                <Legend />

                <Area type="monotone" dataKey="travelViews" name="여행지 조회" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} />
                <Area type="monotone" dataKey="accViews" name="숙소 조회" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.2} />
                <Line type="monotone" dataKey="flightResv" name="항공 예약" stroke={COLORS[1]} strokeWidth={2} />
                <Line type="monotone" dataKey="deliveryResv" name="짐배송 예약" stroke={COLORS[3]} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    </ChartCard>
);

export default UsageChart;
