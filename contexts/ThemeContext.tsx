import React, { createContext, useState, useContext, useEffect, type ReactNode, FC, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
 theme: Theme;
 toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }: any) => {
 const [theme, setTheme] = useState<Theme>(() => {
 try {
 const storedTheme = (localStorage as any).getItem('theme');
 if (storedTheme === 'light' || storedTheme === 'dark') {
 return storedTheme;
 }
 } catch (e: any) {
 (console as any).error('Error reading theme from localStorage', e);
 }
 return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
 });

 useEffect(() => {
 try {
 (localStorage as any).setItem('theme', theme);
 } catch (e: any) {
 (console as any).error('Error saving theme to localStorage', e);
 }
 if (theme === 'dark') {
 document.documentElement.classList.add('dark');
 } else {
 document.documentElement.classList.remove('dark');
 }
 }, [theme]);

 const toggleTheme: any = () => {
 setTheme(prevTheme => (prevTheme=== 'light' ? 'dark' : 'light'));
 };

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
};

export const useTheme: any = (): ThemeContextType => {
 const context = useContext<any>(ThemeContext);
 if (context === undefined) {
 throw new Error('useTheme must be used within a ThemeProvider');
 }
 return context;
};

export default ThemeProvider;