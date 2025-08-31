import { useDebounce  } from "use-debounce";
import { useEffect, useState } from "react";
import css from "./SearchBox.module.css";

interface SearchBoxProps {
  onSearch: (newSearchQuery: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue] = useDebounce(inputValue, 500);

   useEffect(() => {
    if (debouncedValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query);
  }

  return (
    <>
      <input
        className={css.input}
        type="text"
        placeholder="Search notes"
        value={inputValue}
        onChange={handleChange}
      />
    </>
  );
}
