import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const DashboardUserChart = ({ data }) => (
    <ChartCard title="사용자 성장 추이">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Tooltip />
            <Legend />
            <Bar dataKey="join" name="신규가입" barSize={18} fill={COLORS[0]} />
            <Bar dataKey="leave" name="탈퇴" barSize={18} fill={COLORS[4]} />
            <Line type="monotone" dataKey="active" name="활성" stroke={COLORS[1]} strokeWidth={2} />
        </ComposedChart>
    </ChartCard>
);

export default DashboardUserChart;