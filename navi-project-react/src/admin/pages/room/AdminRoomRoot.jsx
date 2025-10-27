import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminRoomHeader from "../../layout/room/AdminRoomHeader";

const AdminAccRoot = () => {
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    dateRange: [],
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSiderLayout />

      <div className="flex-1 px-10 py-6 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto">
          {/* ✅ 헤더 - 검색 및 날짜 선택 */}
          <AdminRoomHeader
            onSearch={(params) => setSearchParams(params)}
          />

          {/* ✅ 리스트 페이지 (Outlet) */}
          <div className="mt-4">
            <Outlet context={searchParams} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccRoot;
