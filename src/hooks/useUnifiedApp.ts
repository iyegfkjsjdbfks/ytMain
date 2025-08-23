import { useContext } from 'react';
import { UnifiedAppContext } from '../../contexts/UnifiedAppContext.tsx';

export const useUnifiedApp = () => {
  const context = useContext(UnifiedAppContext);
  if (context === undefined) {
    throw new Error('useUnifiedApp must be used within a UnifiedAppProvider');
  }
  return context;
};

export default useUnifiedApp;
