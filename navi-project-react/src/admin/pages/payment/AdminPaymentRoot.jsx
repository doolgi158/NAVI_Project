import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminPaymentHeader from "../../layout/payment/AdminPaymentHeader";

const AdminPaymentRoot = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 왼쪽 사이드바 */}
            <AdminSiderLayout />

            {/* 오른쪽 본문 */}
            <div className="flex-1 p-6">
                {/* 상단 탭 */}
                <AdminPaymentHeader />

                {/* 실제 내용 */}
                <div className="mt-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentRoot;
