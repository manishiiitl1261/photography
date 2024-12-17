// pages/index.js
import React from 'react';
import ProgressBar from '@/pages/component/review/ProgressBar';

function ProgressHelper() {
  return (
    <div className="flex flex-col justify-center items-center cursor-pointer">
     <ProgressBar percentage={48} count={5}/>
     <ProgressBar percentage={57} count={4} />
      <ProgressBar percentage={10} count={3}/>
      <ProgressBar percentage={20} count={2} />
      <ProgressBar percentage={10} count={1}/> 
    </div>
  );
}

export default ProgressHelper;
