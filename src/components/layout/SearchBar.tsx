import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { searchProducts } from "../../services/api";
import type { IProduct } from "@models/type";

function SearchBarComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IProduct[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const queryTrimmed = query.trim();
      if (queryTrimmed.length > 0) {
        const data = await searchProducts(queryTrimmed.toLowerCase());
        setResults(data);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 max-w-lg mx-8" ref={containerRef}>
      <input
        type="text"
        placeholder="Searching product..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      />

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
          {results.map((item) => (
            <li key={item.id} className="border-b last:border-none">
              <Link
                to={`/products/${item.id}`}
                className="flex items-center p-2 hover:bg-gray-100"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded mr-2"
                />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500 text-left">
                    đ{item.price}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default SearchBarComponent;
