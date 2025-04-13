// pages/index.js
import React from 'react';
import ProgressBar from '@/components/review/ProgressBar';
import { useReviews } from '@/contexts/ReviewContext';

function ProgressHelper() {
  const { ratingDistribution } = useReviews();

  return (
    <div className="flex flex-col justify-center items-center cursor-pointer">
      {ratingDistribution.map((item) => (
        <ProgressBar
          key={item.stars}
          percentage={item.percentage}
          count={item.stars}
        />
      ))}
    </div>
  );
}

export default ProgressHelper;