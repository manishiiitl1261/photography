// components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ percentage, count }) => {
  return (
    <div className="flex flex-row justify-center items-center">
      <span className='text-black cursor-pointer'>{count} <span className="text-blue-500 cursor-pointer"> ★</span></span>
      <div className="bg-white lg:w-44 xl:w-56 h-4 m-2 rounded-lg w-32">
        <div className="bg-blue-500 h-4 rounded-lg"
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
