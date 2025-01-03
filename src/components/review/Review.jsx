import React from "react";
import CardSlider from "@/components/review/CardSlider"
import ProgressHelper from "@/components/review/ProgressHelper";
import CommentForm from "@/components/review/CommentForm"
export default function Review() {
  return (
    <div className="flex flex-col p-4 gap-16">

      <h1 className="font-bold text-5xl text-center p italic text-black">
        What do<span className=" text-cyan-500 p-2">people think</span>about us
      </h1>
      <div className=" flex xl:flex-row flex-col justify-evenly">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 sm:gap-12 mt-4">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-center text-black"> Rating and Reviews</h1>
              <p className=" text-center font-medium text-black">
                Rating and reviews are verified and are form people who use the
                same device
              </p>
            </div>

            <div className="flex flex-row justify-center lg:gap-8 xl:gap-10 gap-6">

              <div className="flex flex-col justify-center items-center">

                <span className=" text-5xl sm:text-8xl text-black">4.0</span>
                <div className=" flex flex-row">
                  <span className="text-blue-500 cursor-pointer"> ★★★★</span>
                </div>
                <span className="mt-2 text-indigo-950">47,599</span>
              </div>
              <ProgressHelper />
            </div>
          </div>
          <div>
            <h1 className=" italic text-3xl font-bold text-center text-black">Our Client Say</h1>
            <CardSlider />
          </div>
        </div>

        <div className="flex flex-col items-center lg:gap-10 gap-4">
          <label
            htmlFor="message"
            className="text-3xl lg:text-5xl font-bold italic text-black"
          >
            Your Review
          </label>
          <CommentForm />
        </div>
      </div>
    </div >

  );
}
