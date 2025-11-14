import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Item {
  id: string;
  name: string;
}

interface MultiSelectWithSearchProps {
  label: string;
  items: Item[];
  selectedItems: string[];
  onChange: (selectedIds: string[]) => void;
  required?: boolean;
}

const MultiSelectWithSearch: React.FC<MultiSelectWithSearchProps> = ({ label, items, selectedItems, onChange, required }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const toggleSelection = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    onChange(newSelection);
  };

  const selectAll = () => {
    onChange(items.map(item => item.id));
  };

  const deselectAll = () => {
    onChange([]);
  };
  
  const selectedItemObjects = items.filter(item => selectedItems.includes(item.id));

  return (
    <div ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 relative">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[38px]"
        >
          <div className="flex flex-wrap gap-1">
            {selectedItemObjects.length > 0 ? selectedItemObjects.map(item => (
              <span key={item.id} className="inline-flex items-center py-0.5 pl-2 pr-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {item.name}
                <button
                  type="button"
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )) : <span className="text-gray-500">Select...</span>}
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="p-2 sticky top-0 bg-white z-10 border-b">
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 />
               </div>
                <div className="flex justify-between text-xs pt-2 px-1">
                    <button onClick={selectAll} className="text-indigo-600 hover:text-indigo-900 font-medium">Select All</button>
                    <button onClick={deselectAll} className="text-indigo-600 hover:text-indigo-900 font-medium">Deselect All</button>
                </div>
            </div>
            
            <ul className="py-1">
              {filteredItems.length > 0 ? filteredItems.map(item => (
                <li key={item.id} className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50" onClick={() => toggleSelection(item.id)}>
                   <div className="flex items-center">
                     <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        readOnly
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                     <span className="ml-3 block font-normal truncate">{item.name}</span>
                   </div>
                </li>
              )) : <li className="text-gray-500 cursor-default select-none relative py-2 px-4">No items found.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectWithSearch;
