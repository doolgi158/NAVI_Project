import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminDeliveryHeader from "../../layout/delivery/AdminDeliveryHeader";

const AdminDeliveryRoot = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ 왼쪽 사이드바 */}
            <AdminSiderLayout />

            {/* ✅ 오른쪽 본문 */}
            <div className="flex-1 p-6 overflow-x-auto">
                {/* ✅ 상단 탭 */}
                <AdminDeliveryHeader />

                {/* ✅ 실제 내용 (Outlet으로 각 탭 내용 교체) */}
                <div className="mt-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDeliveryRoot;
