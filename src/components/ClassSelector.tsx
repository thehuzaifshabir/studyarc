import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TARGET_CLASSES } from '../lib/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface ClassSelectorProps {
  currentClassId: string;
  category: string;
  className?: string;
}

export function ClassSelector({ currentClassId, category, className }: ClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentClass = TARGET_CLASSES.find(c => c.id === currentClassId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (classId: string) => {
    setIsOpen(false);
    navigate(`/${category}/${classId}`);
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {currentClass?.label || 'Select Class'}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {TARGET_CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleSelect(cls.id)}
                className={cn(
                  "block w-full text-left px-4 py-2 text-sm",
                  currentClassId === cls.id ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                role="menuitem"
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
