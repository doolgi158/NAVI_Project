export default function CustomButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#0A3D91] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0A3D91]/90 transition ${className}`}
    >
      {children}
    </button>
  );
}
