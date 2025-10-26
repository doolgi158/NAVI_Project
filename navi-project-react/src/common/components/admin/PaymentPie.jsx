import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ChartCard from "./ChartCard";

const PaymentPie = ({ data }) => {
    const colors = ["#60a5fa", "#34d399", "#a78bfa", "#f59e0b"];
    return (
        <ChartCard title="결제 수단 비율">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="method" outerRadius={110} label>
                    {data.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ChartCard>
    );
};

export default PaymentPie;