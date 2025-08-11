import React, { FC } from 'react';
import type React from 'react';

import { ComprehensiveLiveStudio } from '../src/features/livestream/components';

/**
 * GoLivePage component that integrates the comprehensive live streaming studio
 * with all advanced features including chat moderation, Super Chat, polls, Q&A,
 * multi-platform streaming, scheduled streams, and live replays.
 */
const GoLivePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ComprehensiveLiveStudio />
    </div>
  );
};

export default GoLivePage;


