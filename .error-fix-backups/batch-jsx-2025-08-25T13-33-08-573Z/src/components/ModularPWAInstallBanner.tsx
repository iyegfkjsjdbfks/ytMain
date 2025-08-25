// ModularPWAInstallBanner - Enhanced Component;
import React, { useState } from 'react';

export interface ModularPWAInstallBannerProps {
  className?: string;
  children?: React.ReactNode;
}

export const ModularPWAInstallBanner: React.FC<ModularPWAInstallBannerProps> = ({
  className = '',
  children;
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={'component ' + className}>
      <div className={"component}-header">
        <h3>Modular P W A Install Banner</h3>
      </div>
      
      <div className={"component}-content">
        {children || (
          <div>
            <button onClick={() => setIsActive(!isActive)}>
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
            {isActive && <p>Component is active!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModularPWAInstallBanner;