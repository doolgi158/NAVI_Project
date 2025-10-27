import React from "react";
import "../../css/common/Pagination.css"; // ✅ 공통 CSS

/**
 * 공통 페이지네이션 컴포넌트
 * @param {number} currentPage 현재 페이지 (0부터 시작)
 * @param {number} totalPages 전체 페이지 수
 * @param {function} onPageChange 페이지 변경 함수
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  // ✅ 페이지가 0이면 최소 1로 표시되도록 처리
  const safeTotalPages = totalPages > 0 ? totalPages : 1;

  const goToPage = (page) => {
    if (page >= 0 && page < safeTotalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination">
        {/* 이전 버튼 */}
        <button
          className="page-btn"
          disabled={currentPage === 0}
          onClick={() => goToPage(currentPage - 1)}
        >
          이전
        </button>

        {/* 페이지 번호 버튼 */}
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`page-btn ${i === currentPage ? "active" : ""}`}
            onClick={() => goToPage(i)}
          >
            {i + 1}
          </button>
        ))}

        {/* 다음 버튼 */}
        <button
          className="page-btn"
          disabled={currentPage === totalPages - 1}
          onClick={() => goToPage(currentPage + 1)}
        >
          다음
        </button>
      </div>

      {/* 현재 페이지 정보 */}
      <div className="pagination-info">
        {currentPage + 1} / {totalPages} 페이지
      </div>
    </div>
  );
}

export default Pagination;
