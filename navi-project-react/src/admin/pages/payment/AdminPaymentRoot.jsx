import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminPaymentHeader from "../../layout/payment/AdminPaymentHeader";

const AdminPaymentRoot = () => {
  const [rsvType, setRsvType] = useState("ACC");
  const [filter, setFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ 왼쪽 사이드바 고정 */}
      <AdminSiderLayout />

      {/* ✅ 오른쪽 콘텐츠 */}
      <div className="flex-1 px-10 py-6 overflow-x-hidden">
        {/* 내부 콘텐츠 중앙정렬 + 최대폭 제한 */}
        <div className="max-w-[1600px] mx-auto">
          <AdminPaymentHeader
            onTabChange={(type) => setRsvType(type)}
            onSearch={(kw) => setKeyword(kw)}
            onFilter={(status) => setFilter(status)}
          />

          <div className="mt-4">
            {/* Outlet으로 리스트 페이지 연결 */}
            <Outlet context={{ rsvType, filter, keyword }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentRoot;
