import React, { FC } from 'react';
interface ShortsPageErrorProps {
 error: string;

const ShortsPageError: React.FC<ShortsPageErrorProps> = ({ error }: any) => {
 return (
 <div className={"h}-full flex items-center justify-center bg-black">
 <p className={"text}-red-500 text-lg">{error}</p>
// FIXED:  </div>

export default ShortsPageError;