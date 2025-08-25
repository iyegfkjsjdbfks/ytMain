import React, { FC } from 'react';
interface Category {
 id: 'all' | 'music' | 'gaming' | 'news' | 'movies';
 label: string; icon: string;
}

interface CategoryTabsProps {
 categories: Category;
 activeCategory: 'all' | 'music' | 'gaming' | 'news' | 'movies'; setActiveCategory: (category: 'all' | 'music' | 'gaming' | 'news' | 'movies') => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, setActiveCategory }: any) => {
 return (
 <div className={"mb}-6">
 <div className={"fle}x space-x-1 overflow-x-auto no-scrollbar">
 {categories.map((category: any) => (
          <button;
          key={category.id} />


 activeCategory === category.id;
 ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
 : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
 }`}
 >
 <span>{category.icon}</span>
 <span>{category.label}</span>

 ))}


 );
};

export default CategoryTabs;
export type { Category };