
import { useContext } from 'react';

import { UnifiedAppContext } from '../contexts/UnifiedAppContext';

/**
 * Hook to access the unified app context
 * Provides access to all app state and actions
 */
export function useUnifiedApp() {
  const context = useContext(UnifiedAppContext);
  if (context === undefined) {
    throw new Error('useUnifiedApp must be used within a UnifiedAppProvider');
  }
  return context;
}
