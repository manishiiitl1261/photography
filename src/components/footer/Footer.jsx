import React from "react";
import ItemsContainer from "@/components/footer/ItemContainer";
import SocialIcons from "@/components/footer/SocialIcons";
import { FaGithub } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="flex flex-col text-black tex sm:pt-10">
      <ItemsContainer />
      <div className="flex flex-col gap-y-5 p-4 bg-slate-700 text-white " >
        <div className="flex md:flex-row flex-col justify-evenly items-center ">
          <div className=" flex flex-col my-5 sm:flex-row gap-x-2 items-center">
            <span className="font-bold inline my-3 text-white text-lg md:text-xl">Let's get social</span>
            <div>
              <SocialIcons />
            </div>
          </div>
          <div className="flex flex-row items-center">
            <h1 className=" text-lg md:text-xl font-bold inline text-center">Created by : <span className="mx-1 text-blue-400">Manish Rawat </span></h1>
            <span
              className="p-2 cursor-pointer inline-flex items-center
                    rounded-full bg-slate-200 mx-1.5 text-xl  hover:bg-teal-200
                    duration-300 "
            >
              <a href="https://github.com/manishiiitl1261" target="_blank">
                {" "}
                <FaGithub className="text-2xl cursor-pointer text-black duration-500" />
              </a>
            </span>
          </div>
        </div>
        <div className=" text-center">
          <span className="text-white font-bold">© 2015 Pahadi  All rights reserved. Terms · Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer; // test PR
