import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import { useNavigate } from "react-router-dom";
import { getAdminTravelList, deleteTravel } from "@/api/adminTravelApi";
import { format } from "date-fns";

export default function AdminTravelList() {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ 여행지 목록 불러오기
  useEffect(() => {
    const fetchTravels = async () => {
      try {
        const data = await getAdminTravelList();
        setTravels(data || []);
      } catch (err) {
        console.error("여행지 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTravels();
  }, []);

  // ✅ 여행지 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      await deleteTravel(id);
      setTravels(travels.filter((t) => t.id !== id));
      alert("삭제되었습니다.");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // ✅ 여행지 등록 페이지 이동
  const handleAdd = () => {
    navigate("/admin/travel/add");
  };

  // ✅ 여행지 수정 페이지 이동
  const handleEdit = (id) => {
    navigate(`/admin/travel/edit/${id}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 타이틀 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            🧭 여행지 관리 (관리자)
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            등록된 여행지를 확인하고 수정/삭제할 수 있습니다.
          </p>
        </div>

        {/* 리스트 */}
        <CustomCard className="w-[900px]">
          {loading ? (
            <p className="text-gray-500 text-center py-8">
              여행지 목록을 불러오는 중입니다...
            </p>
          ) : travels.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">등록된 여행지가 없습니다.</p>
              <CustomButton onClick={handleAdd}>새 여행지 등록</CustomButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travels.map((travel) => (
                <div
                  key={travel.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold text-[#0A3D91]">
                    {travel.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    등록일:{" "}
                    {travel.createdAt
                      ? format(new Date(travel.createdAt), "yyyy.MM.dd")
                      : "-"}
                  </p>
                  <p className="text-gray-500 mt-2 text-sm line-clamp-2">
                    {travel.description || "설명 없음"}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <CustomButton
                      onClick={() => handleEdit(travel.id)}
                      className="bg-[#0A3D91]/80 text-sm px-4 py-2"
                    >
                      수정
                    </CustomButton>
                    <CustomButton
                      onClick={() => handleDelete(travel.id)}
                      className="bg-red-500 hover:bg-red-600 text-sm px-4 py-2"
                    >
                      삭제
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CustomCard>

        {/* 하단 등록 버튼 */}
        {travels.length > 0 && (
          <div className="mt-8">
            <CustomButton onClick={handleAdd}>새 여행지 등록</CustomButton>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
