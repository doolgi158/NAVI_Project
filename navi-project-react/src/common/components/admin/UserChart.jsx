import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";
import { formatTickLabel } from "@/common/util/dateFormat";

const UserChart = ({ data, range = "monthly" }) => (
    <ChartCard title="사용자 성장 추이">
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={(v) => formatTickLabel(v, range)} />
                <YAxis />
                <Tooltip
                    formatter={(v, name) => {
                        const labels = {
                            join: "신규가입",
                            leave: "탈퇴",
                            active: "활성 사용자",
                        };
                        return [`${v.toLocaleString()}명`, labels[name] || name];
                    }}
                />
                <Legend />
                <Bar dataKey="join" name="신규가입" barSize={18} fill={COLORS[0]} />
                <Bar dataKey="leave" name="탈퇴" barSize={18} fill={COLORS[4]} />
                <Line type="monotone" dataKey="active" name="활성" stroke={COLORS[1]} strokeWidth={2} />
            </ComposedChart>
        </ResponsiveContainer>
    </ChartCard>
);

export default UserChart;