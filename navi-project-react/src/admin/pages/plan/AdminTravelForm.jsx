import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import { getTravelDetail, createTravel, updateTravel } from "../../../common/api/adminTravelApi";

export default function AdminTravelForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정일 경우 id 존재
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(!!id);

  // ✅ 수정일 경우 기존 데이터 불러오기
  useEffect(() => {
    if (!id) return;
    const fetchTravel = async () => {
      try {
        const data = await getTravelDetail(id);
        setForm({ name: data.name || "", description: data.description || "" });
      } catch (err) {
        console.error("여행지 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTravel();
  }, [id]);

  // ✅ 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("여행지 이름을 입력해주세요!");
      return;
    }

    try {
      if (id) {
        await updateTravel(id, form);
        alert("여행지가 수정되었습니다.");
      } else {
        await createTravel(form);
        alert("새 여행지가 등록되었습니다.");
      }
      navigate("/admin/travel");
    } catch (err) {
      console.error("저장 실패:", err);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 제목 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            {id ? "여행지 수정" : "여행지 등록"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            여행지 정보를 입력하고 저장하세요
          </p>
        </div>

        {/* 폼 카드 */}
        <Card className="w-[600px]">
          {loading ? (
            <p className="text-gray-500 text-center py-8">
              데이터를 불러오는 중입니다...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 여행지 이름 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  여행지 이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  placeholder="예: 제주도"
                />
              </div>

              {/* 설명 */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="여행지에 대한 설명을 입력하세요"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                />
              </div>

              {/* 버튼 영역 */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-400 hover:bg-gray-500"
                >
                  취소
                </Button>
                <Button type="submit">
                  {id ? "수정 완료" : "등록"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
