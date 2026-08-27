import React from 'react';
import { TARGET_CLASSES } from '../lib/constants';

interface TargetAudienceSelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function TargetAudienceSelector({ selectedCategories, onChange }: TargetAudienceSelectorProps) {
  const toggleCategory = (id: string) => {
    if (id === 'all') {
      if (selectedCategories.includes('all')) {
        onChange([]);
      } else {
        onChange(['all', ...TARGET_CLASSES.map(c => c.id)]);
      }
      return;
    }
    
    let newCategories = [...selectedCategories];
    
    if (newCategories.includes(id)) {
      newCategories = newCategories.filter(c => c !== id);
      newCategories = newCategories.filter(c => c !== 'all');
    } else {
      newCategories.push(id);
      if (newCategories.length === TARGET_CLASSES.length && !newCategories.includes('all')) {
         newCategories.push('all');
      }
    }
    
    onChange(newCategories);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Target Audience (Select all that apply)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <label className="inline-flex items-center p-2 rounded-md border cursor-pointer transition-colors hover:bg-gray-50">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
            checked={selectedCategories.includes('all')}
            onChange={() => toggleCategory('all')}
          />
          <span className="ml-2 text-sm text-gray-700">All Students</span>
        </label>
        
        {TARGET_CLASSES.map(cls => (
          <label key={cls.id} className="inline-flex items-center p-2 rounded-md border cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
              checked={selectedCategories.includes(cls.id) || selectedCategories.includes('all')}
              onChange={() => toggleCategory(cls.id)}
            />
            <span className="ml-2 text-sm text-gray-700">{cls.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
