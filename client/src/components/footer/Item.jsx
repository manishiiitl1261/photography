import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaSquarePhone } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { useLanguage } from "@/contexts/LanguageContext";

const Item = ({ Links, title }) => {
  const { t } = useLanguage();

  return (
    <ul className="align-middle">
      <div className="flex items-center mb-2">
        <h1 className="mb-1 font-semibold text-black">{title}</h1>
      </div>

      {/* Render Each Link */}
      {Links.map((l) => {
        let href = "";
        if (l.latitude && l.longitude) {
          href = `https://www.google.com/maps?q=${l.latitude},${l.longitude}`;
        } else if (l.link?.startsWith("mailto:")) {
          href = l.link;
        } else if (l.link?.startsWith("tel:")) {
          href = l.link;
        } else {
          href = l.link || "#"; // Fallback if no link provided
        }

        // Format the display text based on the type
        let displayText = l.name;
        if (l.type === "phone") {
          displayText = `${t.footer.phone}: ${l.name}`;
        } else if (l.type === "email") {
          displayText = `${t.footer.email}: ${l.name}`;
        }

        return (
          <li key={l.name} className="flex items-center mb-2">
            {title === t.footer.address.toUpperCase() ? (
              <FaLocationDot className="mr-2 text-black" />
            ) :
              l.titleKey === "phone" ? (
                <FaSquarePhone className="mr-2 text-black" />
              ) : (
                <IoIosMail className="mr-2 text-black" />
              )
            }
            <a
              className="text-black hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6"
              href={href}
              target={href.startsWith("http") ? "_blank" : "_self"}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {displayText}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default Item;
