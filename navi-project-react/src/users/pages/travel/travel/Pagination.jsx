import React from 'react';

const Pagination = ({ pageResult, handlePageClick, loading }) => (
  <div className="flex justify-center mt-10">
    <div className="flex items-center space-x-1">
      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.startPage > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.startPage > 1 ? pageResult.startPage - 10 : 1)}
        disabled={loading || pageResult.startPage <= 1}
      >
        &lt;&lt;
      </button>

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.page - 1)}
        disabled={loading || pageResult.page <= 1}
      >
        &lt;
      </button>

      {pageResult.pageList.map((p) => (
        <button
          key={p}
          onClick={() => handlePageClick(p)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            pageResult.page === p ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          {p}
        </button>
      ))}

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.page + 1)}
        disabled={loading || pageResult.page >= pageResult.totalPages}
      >
        &gt;
      </button>

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.endPage < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.endPage + 1)}
        disabled={loading || pageResult.endPage >= pageResult.totalPages}
      >
        &gt;&gt;
      </button>
    </div>
  </div>
);

export default Pagination;