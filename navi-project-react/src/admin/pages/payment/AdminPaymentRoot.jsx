import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminPaymentHeader from "../../layout/payment/AdminPaymentHeader";

const AdminPaymentRoot = () => {
  const [rsvType, setRsvType] = useState("ACC");
  const [filter, setFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSiderLayout />

      <div className="p-6">
        <AdminPaymentHeader
          onTabChange={(type) => setRsvType(type)}
          onSearch={(kw) => setKeyword(kw)}
          onFilter={(status) => setFilter(status)}
        />

        <div className="mt-4">
          {/* ✅ Outlet으로 전달 */}
          <Outlet context={{ rsvType, filter, keyword }} />
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentRoot;
