import React from 'react';
import { Input } from './Input.tsx';
import { Button } from './Button.tsx';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange, placeholder }) => {
  return (
    <div className="search-container">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="form-control pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        <Button className="btn-primary">
          <i className="fas fa-search mr-2"></i>
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
