import { useState } from "react";
import axios from "axios";

const FindUserId = ({ onResult }) => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/find-id", form);
      onResult(`회원님의 아이디는 "${res.data.userId}" 입니다.`);
    } catch (err) {
      onResult("입력하신 정보와 일치하는 아이디가 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-gray-700">
      <div>
        <label className="block mb-2 font-semibold text-gray-800">이름</label>
        <input
          name="name"
          placeholder="이름을 입력하세요"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4A9E8C] focus:border-transparent outline-none transition"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-800">이메일</label>
        <input
          name="email"
          type="email"
          placeholder="이메일을 입력하세요"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4A9E8C] focus:border-transparent outline-none transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 shadow-sm
          ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#4A9E8C] text-white hover:bg-[#3A8576]"
          }`}
      >
        {loading ? "확인 중..." : "아이디 찾기"}
      </button>
    </form>
  );
};

export default FindUserId;
