import React from 'react';
import { NavLink } from 'react-router-dom';
import { CONTENT_CATEGORIES } from '../lib/constants';
import { cn } from '../lib/utils';

interface ClassNavigationTabsProps {
  currentClassId: string;
}

export function ClassNavigationTabs({ currentClassId }: ClassNavigationTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-8 overflow-x-auto">
      <nav className="-mb-px flex space-x-8 min-w-max px-4 sm:px-0">
        {CONTENT_CATEGORIES.map((category) => (
          <NavLink
            key={category.id}
            to={`${category.path}/${currentClassId}`}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )
            }
          >
            {category.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
