import React from "react";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
} from "react-icons/fa";
const SocialIcons = () => {
  return (
    <div className="text-teal-500">
      <span
        className="p-2 cursor-pointer inline-flex items-center
        rounded-full bg-gray-700 mx-1.5 text-xl hover:text-gray-100 hover:bg-teal-500
        duration-300 "
      >
        {" "}
        <a href="https://www.youtube.com/" target="_blank">
          {" "}
          <FaFacebook className="text-2xl cursor-pointer hover:text-blue-600 duration-500" />
        </a>
      </span>
      <span
        className="p-2 cursor-pointer inline-flex items-center
      rounded-full bg-gray-700 mx-1.5 text-xl hover:text-gray-100 hover:bg-teal-500
      duration-300 "
      >
        <a href="https://www.youtube.com/" target="_blank">
          {" "}
          <FaInstagram className="text-2xl cursor-pointer hover:text-yellow-600 duration-500" />
        </a>
      </span>
      <span
        className="p-2 cursor-pointer inline-flex items-center
        rounded-full bg-gray-700 mx-1.5 text-xl hover:text-gray-100 hover:bg-teal-500
        duration-300 "
      >
        <a href="https://www.youtube.com/" target="_blank">
          {" "}
          <FaTwitter className="text-2xl cursor-pointer hover:text-blue-600 duration-500" />
        </a>{" "}
      </span>
      <span
        className="p-2 cursor-pointer inline-flex items-center
        rounded-full bg-gray-700 mx-1.5 text-xl hover:text-gray-100 hover:bg-teal-500
        duration-300 "
      >
        <a href="https://www.youtube.com/" target="_blank">
          <FaLinkedin className="text-2xl cursor-pointer hover:text-blue-600 duration-500" />
        </a>{" "}
      </span>
      <span
        className="p-2 cursor-pointer inline-flex items-center
        rounded-full bg-gray-700 mx-1.5 text-xl hover:text-gray-100 hover:bg-teal-500
        duration-300 "
      >
        <a href="https://www.youtube.com/" target="_blank">
          {" "}
          <FaYoutube className="text-2xl cursor-pointer hover:text-red-600 duration-500" />{" "}
        </a>
      </span>
    </div>
  );
};
export default SocialIcons;