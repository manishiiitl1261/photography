"use client";
import { useState } from "react";
import Item from "@/components/footer/Item";
import { ADDRESS, CONTACT } from "@/components/footer/Menu";

const ItemsContainer = () => {
  // States for form inputs and submission notification
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const links = [
    { name: "About Us", href: "/AboutUs" },
    { name: "Our Portfolio", href: "/Portfolio" },
    { name: "Contact Us", href: "/ContactUs" },
    { name: "Services & Price", href: "/Services" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && suggestion) {
      // Show success notification
      setShowPopup(true);

      // Clear input fields
      setEmail("");
      setSuggestion("");

      // Hide the popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row lg:bg-slate-300 justify-evenly m-4 gap-5 relative">
      {/* Popup Notification */}
      {showPopup && (
        <div className="fixed top-2 right-2 z-50 bg-green-500 text-white p-2 shadow shadow-green-400 rounded-sm">
          🎉 Hurray! Your review has been submitted successfully.
        </div>
      )}

      {/* Suggestion Form */}
      <div className="flex flex-col gap-3 justify-center">
        <h1 className="mb-1 font-semibold text-[20px]">Free to give your suggestion</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Enter Your E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-black border hover:border-black focus:placeholder-slate-600 hover:placeholder-slate-600 duration-300 bg-white dark:text-white
            sm:w-72 !w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-2.5 rounded px-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <label htmlFor="message" className="font-semibold text-[20px]">
            Your Suggestion
          </label>
          <textarea
            id="message"
            rows="3"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            required
            className="text-black border hover:border-black focus:placeholder-slate-600 hover:placeholder-slate-600 duration-300 bg-white dark:text-white block p-2.5 w-full text-sm
            rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your suggestion here..."
          ></textarea>
          <button
            type="submit"
            disabled={!email || !suggestion}
            className={`duration-300 px-5 py-2.5 font-[Poppins] rounded-md text-white md:w-auto ${email && suggestion ? "bg-sky-500 hover:bg-sky-600" : "bg-gray-400 cursor-not-allowed"
              } sm:mx-16 lg:mx-20`}
          >
            Submit
          </button>
        </form>
      </div>

      {/* Quick Links Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-bold">Quick Links</h1>
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="hover:text-teal-400 duration-300 cursor-pointer"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Address and Contact Section */}
      <div className="flex flex-col gap-4">
        <Item Links={ADDRESS} title="ADDRESS" />
        <Item Links={CONTACT} title="CONTACT" />
      </div>
    </div>
  );
};

export default ItemsContainer;
