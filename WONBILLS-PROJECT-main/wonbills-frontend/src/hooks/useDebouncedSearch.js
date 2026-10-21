import { useState, useEffect } from "react";

export default function useDebouncedSearch(initialValue = "", delay = 300) {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Update the debounced value after the delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler); // cleanup on value change
  }, [query, delay]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  return { query, debouncedQuery, handleQueryChange, setQuery };
}
