import React from "react";
import ItemsContainer from "@/components/footer/ItemContainer";
import SocialIcons from "@/components/footer/SocialIcons";
import { FaGithub } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="flex flex-col text-black tex sm:pt-10">
      <ItemsContainer />
      <div className="flex flex-col gap-y-5 p-4 bg-slate-700 text-white " >
        <div className="flex md:flex-row flex-col justify-between items-center md:px-10">
          <div className=" flex flex-col my-5 sm:flex-row gap-x-2 items-center">
            <span className="font-bold inline my-3 text-white text-lg md:text-xl ">Let's get social</span>
            <div>
              <SocialIcons />
            </div>
          </div>
          <div className="flex flex-row items-center">
            <h1 className="  sm:text-lg md:text-xl font-bold inline text-center">Created by : <span className="mx-1 text-blue-400">Manish Rawat </span></h1>
            <span
              className="p-1 cursor-pointer inline-flex items-center
                    rounded-full bg-slate-200 mx-1.5 text-xl  hover:bg-teal-200
                    duration-300 "
            >
              <a href="https://manishrawat-portfolio.netlify.app/" target="_blank">
                {" "}
                <div className="size-10 rounded-full overflow-hidden">
                  <img
                    src="/assest/manish.jpeg"
                    className=" w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </a>
            </span>
          </div>
        </div>
        <div className=" text-center">
          <span className="text-white sm:font-bold">© 2015 Pahadi  All rights reserved. Terms · Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer; 
