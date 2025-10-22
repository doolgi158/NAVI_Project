import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminFlightHeader from "../../layout/flight/AdminFlightHeader";

const AdminFlightRoot = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ✅ 왼쪽 사이드바 */}
            <AdminSiderLayout />

            {/* ✅ 오른쪽 본문 */}
            <div className="flex-1 p-6 overflow-x-auto">
                {/* 상단 탭 */}
                <AdminFlightHeader />

                {/* ✅ 실제 내용 */}
                <div className="mt-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminFlightRoot;
