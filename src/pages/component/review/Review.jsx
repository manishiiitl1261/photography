import React from "react";
import CardSlider from "@/pages/component/review/CardSlider"
import ProgressHelper from "@/pages/component/review/ProgressHelper";
export default function Review() {
  return (
    <div className="flex flex-col p-4 bg-slate-300 gap-24">

      <h1 className="font-bold text-5xl text-center p italic">
        What do<span className=" text-cyan-500 p-2">people think</span>about us
      </h1>
      <div className="flex md:flex-row flex-col justify-evenly">
        <div className="flex flex-col sm:justify-around">
          <div className="flex flex-col ">
            <h1 className="text-3xl font-bold text-center"> Rating and Reviews</h1>
            <p className=" text-center">
              Rating and reviews are verified and are form people who use the
              same device
            </p>
          </div>

          <div className="flex flex-row justify-center lg:gap-8 xl:gap-10 gap-6">

            <div className="flex flex-col justify-center items-center">

              <span className=" text-8xl">4.0</span>
              <div className=" flex flex-row">
                <span className="text-blue-500"> ★★★★</span>
              </div>
              <span className="mt-2 text-indigo-950">47,599,425</span>
            </div>
            <ProgressHelper />
          </div>
        </div>
        <div>
          <h1 className=" italic font-bold text-center">Our Client Say</h1>
          <CardSlider />
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <label
          htmlFor="message"
          className="text-3xl mb-2 font-bold"
        >
          Your Review
        </label>
        <textarea
          id="message"
          rows="4"
          className="block p-2.5  w-[16rem] h-[8rem]  md:w-[20rem] md:h-[10rem] lg:w-[24rem] lg:h-[9rem] sm:w-[18rem] dark:placeholder:text-black sm:h-[10rem] text-sm text-black-900 bg-slate-100 rounded-lg border border-gray-300 resize hover:border-2 hover:border-neutral-800 mb-3 focus:border-2 focus:border-neutral-500 hover:shadow-xl duration-300"
          placeholder="Write your suggestion here..."
        ></textarea>
        <button className="duration-300 px-5 py-2.5 font-[Poppins]
           rounded-md text-white md:w-auto bg-sky-500 hover:bg-sky-600 ">
          Submit
        </button>
      </div>
    </div >

  );
}
