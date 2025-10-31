import React from "react";

const Pagination = ({ pageResult, handlePageClick, loading, visibleCount = 10 }) => {
  const totalPages = pageResult.totalPages;
  const currentPage = pageResult.page;

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];

    // 현재 페이지 중심으로 계산
    let startPage = Math.max(2, currentPage - Math.floor(visibleCount / 2));
    let endPage = Math.min(totalPages - 1, startPage + visibleCount - 1);

    // 끝쪽 보정 (예: 끝 근처일 때)
    if (endPage === totalPages - 1 && startPage > 2) {
      startPage = endPage - visibleCount + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-1 bg-[#F9FAFB] px-3 py-2 rounded-md">
        {/* ◀ 이전 페이지 */}
        <button
          className={`px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200 transition ${currentPage > 1 ? "" : "opacity-50 cursor-not-allowed"
            }`}
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={loading || currentPage <= 1}
        >
          &lt;
        </button>

        {/* 항상 1페이지 */}
        <button
          onClick={() => handlePageClick(1)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition ${currentPage === 1
              ? "bg-[#0A3D91] text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-200"
            }`}
        >
          1
        </button>

        {/* 앞쪽 생략 */}
        {visiblePages[0] > 2 && <span className="px-2 text-gray-400">…</span>}

        {/* 중앙 페이지들 */}
        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => handlePageClick(p)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${currentPage === p
                ? "bg-[#0A3D91] text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
              }`}
            disabled={loading}
          >
            {p}
          </button>
        ))}

        {/* 뒤쪽 생략 */}
        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
          <span className="px-2 text-gray-400">…</span>
        )}

        {/* 마지막 페이지 */}
        {totalPages > 1 && (
          <button
            onClick={() => handlePageClick(totalPages)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${currentPage === totalPages
                ? "bg-[#0A3D91] text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
              }`}
          >
            {totalPages}
          </button>
        )}

        {/* ▶ 다음 페이지 */}
        <button
          className={`px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200 transition ${currentPage < totalPages ? "" : "opacity-50 cursor-not-allowed"
            }`}
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={loading || currentPage >= totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
