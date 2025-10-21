import React, { useState } from 'react';
import { Search } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: string[];
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, suggestions, query, onQueryChange }) => {
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    if (value) {
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit suggestions
      setActiveSuggestions(filtered);
    } else {
      setActiveSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setActiveSuggestions([]);
    onSearch(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSuggestions([]);
    onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setActiveSuggestions([]), 150)} // Delay to allow click
            placeholder="Search by Reg No or Fleet No..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </form>
      {activeSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {activeSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700"
              onMouseDown={() => handleSuggestionClick(suggestion)} // use onMouseDown to fire before onBlur
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;