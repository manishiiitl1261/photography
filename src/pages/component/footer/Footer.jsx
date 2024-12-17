import React from "react";
import ItemsContainer from "@/pages/component/footer/ItemContainer";
import SocialIcons from "@/pages/component/footer/SocialIcons";
const Footer = () => {
  return (
    <footer className="bg-slate-300 flex flex-col text-black tex sm:pt-10">
      <ItemsContainer />
      <hr className=" m-5" />
      <div className="flex flex-col items-center gap-y-5 p-4" >
        <div className=" flex flex-col my-5 sm:flex-row gap-x-2 items-center">
          <span className="font-bold inline my-3">Let's get social</span>
          <div>
            <SocialIcons />
          </div>
        </div>
        <div className=" text-center">
          <span>© 2020 Appy. All rights reserved. Terms · Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
