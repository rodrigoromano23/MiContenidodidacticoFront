import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar material educativo...",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex items-center bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">

      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 p-4 outline-none"
      />

      <button
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 p-4 text-white transition"
      >
        <Search size={22} />
      </button>

    </div>
  );
}