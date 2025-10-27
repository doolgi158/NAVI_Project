import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import AdminAccHeader from "../../layout/acc/AdminAccHeader";
import AdminThemeProvider from "@/admin/theme/AdminThemeProvider";

const AdminAccRoot = () => {
  const [type, setType] = useState("API");      // 현재 탭 상태 (API or SELF)
  const [filter, setFilter] = useState("ALL");  // 정렬
  const [keyword, setKeyword] = useState("");   // 검색

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ 왼쪽 사이드바 */}
      <AdminSiderLayout />

      {/* ✅ 오른쪽 콘텐츠 영역 */}
      <AdminThemeProvider>
        <div className="flex-1 px-10 py-6 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            <AdminAccHeader
              onTabChange={(type) => setType(type)}
              onSearch={(keyword) => setKeyword(keyword)}
              onFilter={(filter) => setFilter(filter)}
            />

            <div className="mt-4">
              {/* ✅ 리스트 페이지로 상태 전달 */}
              <Outlet context={{ type, filter, keyword }} />
            </div>
          </div>
        </div>
      </AdminThemeProvider>
    </div>
  );
};

export default AdminAccRoot;
