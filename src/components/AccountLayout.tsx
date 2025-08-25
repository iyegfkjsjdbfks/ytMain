import React from 'react';
import React from 'react';

export interface AccountLayoutProps {
  children?: React.ReactNode;
      className?: string, 

}
export const AccountLayout: React.FC<AccountLayoutProps> = ({ children, className = '' }) => {
  return React.createElement('div', {)
    className: 'accountlayout-container ' + className, 
  }, children || 'AccountLayout Component');

export default AccountLayout;