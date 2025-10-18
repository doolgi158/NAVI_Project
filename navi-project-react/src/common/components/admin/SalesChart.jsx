import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const money = (v) => `₩${(v || 0).toLocaleString()}`;

const DashboardSalesChart = ({ data }) => (
    <ChartCard title="매출 & 환불 현황">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(v, n) => (n.includes("환불") || n.includes("매출") ? money(v) : v)} />
            <Legend />
            <Bar yAxisId="left" dataKey="sales" name="매출" barSize={20} fill={COLORS[2]} />
            <Line yAxisId="left" type="monotone" dataKey="refunds" name="환불" stroke={COLORS[4]} />
            <Line yAxisId="right" type="monotone" dataKey="count" name="결제건수" stroke={COLORS[0]} />
        </ComposedChart>
    </ChartCard>
);

export default DashboardSalesChart;