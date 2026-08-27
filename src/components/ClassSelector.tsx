import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TARGET_CLASSES } from '../lib/constants';
import { ChevronDown, X } from 'lucide-react';
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
    <div className={cn("relative inline-block text-left w-full md:w-auto", className)} ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-between md:justify-center w-full md:w-auto rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base md:text-sm font-bold md:font-medium text-gray-900 md:text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {currentClass?.label || 'Select Class'}
          <ChevronDown className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown / Bottom Sheet */}
          <div className={cn(
            "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform md:absolute md:inset-auto md:left-0 md:mt-2 md:w-48 md:rounded-lg md:ring-1 md:ring-black md:ring-opacity-5",
            isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"
          )}>
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Select Class</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-2 pb-6 md:pb-2 max-h-[60vh] overflow-y-auto md:max-h-none" role="menu" aria-orientation="vertical">
              {TARGET_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleSelect(cls.id)}
                  className={cn(
                    "block w-full text-left px-6 py-4 md:px-4 md:py-2 text-base md:text-sm font-medium border-b border-gray-50 md:border-none",
                    currentClassId === cls.id ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  role="menuitem"
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
