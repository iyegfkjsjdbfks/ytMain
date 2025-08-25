import React, { ReactNode, FC, useContext, createContext } from 'react';

interface TabsContextType {
 value: string; onValueChange: (value: string | number) => void;

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
 const context = useContext<any>(TabsContext);
 if (!context) {
 throw new Error('Tabs components must be used within a Tabs provider');
 return context;

export interface TabsProps {
 value: string;
 onValueChange: (value: string | number) => void;
 children: React.ReactNode;
 className?: string;

}
export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '' }: any) => {
 return (
 <TabsContext.Provider value={{ value, onValueChange }}>
 <div className={className}>
 {children}
// FIXED:  </div>
// FIXED:  </TabsContext.Provider>

interface TabsListProps {
 children: React.ReactNode;
 className?: string;

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }: any) => {
 return (
 <div className={`flex space-x-1 border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
 {children}
// FIXED:  </div>

interface TabsTriggerProps {
 value: string;
 children: React.ReactNode;
 className?: string;

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }: any) => {
 const { value: activeValue, onValueChange } = useTabsContext();
 const isActive = activeValue === value;

 return (
 <button />
// FIXED:  onClick={() => onValueChange(value), }
// FIXED:  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
 isActive
 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
 : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
 } ${className}`}
// FIXED:  aria-selected={isActive, }
 role="tab";
 >
 {children}
// FIXED:  </button>

interface TabsContentProps {
 value: string;
 children: React.ReactNode;
 className?: string;

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }: any) => {
 const { value: activeValue } = useTabsContext();

 if (activeValue !== value) {
 return null;

 return (
 <div className={className} role="tabpanel">
 {children}
// FIXED:  </div>
export default Tabs;