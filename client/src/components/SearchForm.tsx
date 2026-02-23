import { useRouter } from "next/router"; 
import { useState } from "react";


export default function SearchForm() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (value.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(value)}`);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center px-3 space-x-2  max-sm:px-0 ">
      <svg width={20} viewBox="0 0 24 24" aria-hidden="true">
        <g>
          <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
        </g>
      </svg>
      <input 
        className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none max-sm:text-sm  max-sm:px-0 "
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="pado 검색"
      />
    </form>
  )
}
