import React from 'react';
//import { Input } from './Input.tsx';

import { Button, TextInput } from 'flowbite-react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange, placeholder }) => {
  return (
    <div className="search-container">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            {/* <Input
              placeholder={placeholder}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="form-control pl-10"
            /> */}
            <TextInput
              id="search1"
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div></div>
        <Button>
          <FaMagnifyingGlass className="mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
