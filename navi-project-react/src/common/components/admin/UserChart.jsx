import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const UserChart = ({ data = [] }) => {
    const safeData = data.map((d, i) => ({
        ...d,
        name: d.name || d.period || `2025-${String(i + 1).padStart(2, "0")}`,
    }));

    return (
        <ChartCard title="사용자 성장 추이">
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tickFormatter={(v) => (v?.includes("-") ? `${Number(v.split("-")[1])}월` : v)}
                    />
                    <YAxis />
                    <Tooltip
                        formatter={(v, name) => {
                            const labels = {
                                join: "신규가입",
                                leave: "탈퇴",
                            };
                            return [`${v.toLocaleString()}명`, labels[name] || name];
                        }}
                    />
                    <Legend />
                    <Bar dataKey="join" name="신규가입" barSize={18} fill={COLORS[0]} />
                    <Bar dataKey="leave" name="탈퇴" barSize={18} fill={COLORS[4]} />
                </ComposedChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

export default UserChart;