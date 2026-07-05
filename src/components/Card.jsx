import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar material educativo...",
}) {
  return (
    <div className="flex items-center bg-white rounded-xl shadow-md overflow-hidden">

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 p-4 outline-none"
      />

      <button
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 p-4 text-white"
      >
        <Search size={22} />
      </button>

    </div>
  );
}