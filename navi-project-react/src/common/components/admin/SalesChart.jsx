import {
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
    ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const money = (v) => `₩${(v || 0).toLocaleString()}`;

const SalesChart = ({ data = [] }) => {
    // 백엔드에서 [{ month, amount, count, refundCount }] 형태로 온다고 가정
    const safeData = data.map((d, i) => ({
        name: d.month ? `${Number(d.month.split("-")[1])}월` : `${i + 1}월`,
        sales: d.salesAmount || 0,
        refundsAmount: d.refundAmount || 0,
        paymentCount: d.paymentCount || 0,
        refundCount: d.refundCount || 0,
    }));

    return (
        <ChartCard title="매출 & 환불 현황">
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                        yAxisId="left"
                        label={{ value: "금액 (₩)", angle: -90, position: "insideLeft" }}
                        tickFormatter={(v) =>
                            v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
                        }
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: "건수 (회)", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip formatter={(v, name) =>
                        name.includes("금액") ? [money(v), name] : [`${v.toLocaleString()}건`, name]
                    } />
                    <Legend />

                    <Bar yAxisId="left" dataKey="sales" name="매출 금액" barSize={20} fill={COLORS[2]} />
                    <Bar yAxisId="left" dataKey="refundsAmount" name="환불 금액" barSize={20} fill={COLORS[5]} />
                    <Line yAxisId="right" type="monotone" dataKey="paymentCount" name="결제 건수" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="refundCount" name="환불 건수" stroke={COLORS[4]} strokeDasharray="5 3" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

export default SalesChart;