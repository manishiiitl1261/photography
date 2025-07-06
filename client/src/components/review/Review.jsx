import React from "react";
import CardSlider from "@/components/review/CardSlider"
import ProgressHelper from "@/components/review/ProgressHelper";
import CommentForm from "@/components/review/CommentForm"
import { useLanguage } from "@/contexts/LanguageContext";
import { useReviews } from "@/contexts/ReviewContext";

export default function Review() {
  const { t } = useLanguage();
  const { avgRating, reviewCount } = useReviews();

  return (
    <div className="flex flex-col p-4 gap-16">
      <h1 className="font-bold sm:text-5xl text-3xl text-center p italic text-black">
        {t.reviews.peopleThink}
      </h1>
      <div className=" flex xl:flex-row flex-col justify-evenly">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 sm:gap-12 mt-4">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-center text-black">{t.reviews.ratings}</h1>
              <p className=" text-center font-medium text-black">
                {t.reviews.verified}
              </p>
            </div>

            <div className="flex flex-row justify-center lg:gap-8 xl:gap-10 gap-6">
              <div className="flex flex-col justify-center items-center">
                <span className=" text-5xl sm:text-8xl text-black">{avgRating}</span>
                <div className=" flex flex-row">
                  <span className="text-blue-500 cursor-pointer">
                    {Array.from({ length: Math.floor(avgRating) }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {avgRating % 1 !== 0 && "½"}
                  </span>
                </div>
                <span className="mt-2 text-indigo-950">{reviewCount}</span>
              </div>
              <ProgressHelper />
            </div>
          </div>
          <div>
            <h1 className=" italic text-3xl font-bold text-center text-black">{t.reviews.clientSay}</h1>
            <CardSlider />
          </div>
        </div>

        <div className="flex flex-col items-center lg:gap-10 gap-4">
          <label
            htmlFor="message"
            className="text-3xl lg:text-5xl font-bold italic text-black"
          >
            {t.reviews.yourReview}
          </label>
          <CommentForm />
        </div>
      </div>
    </div >
  );
}