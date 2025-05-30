import React from 'react';

const EmptyShortsState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-black">
      <p className="text-white text-lg">No shorts available right now.</p>
    </div>
  );
};

export default EmptyShortsState;