import Item from "@/pages/component/footer/Item";
import { ADDRESS, CONTACT } from "@/pages/component/footer/Menu"
const ItemsContainer = () => {
  const links = [
    { name: "About Us", href: "/about" },
    { name: "Our Portfolio", href: "/portfolio" },
    { name: "Contact Us", href: "/contact" },
    { name: "Services & Price", href: "/services" },
  ];
  return (
    <div className="flex flex-col  sm:flex-row lg:bg-slate-300 justify-evenly m-4">
      <div className="flex flex-col gap-3 justify-center">
        <h1 className="mb-1 font-semibold text-[20px]"> Free to give your suggestion</h1>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter Your E-mail"
            className=" text-white border border-gray-300 focus:placeholder-gray-50 hover:placeholder-gray-50 duration-300 bg-slate-600 dark:text-white
           sm:w-72 !w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-2.5 rounded px-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <label
            htmlFor="message"
            className="font-semibold text-[20px]"
          >
            Your Suggestion
          </label>
          <textarea
            id="message"
            rows="3"
            className="text-white focus:placeholder-gray-50 hover:placeholder-gray-50 duration-300 block p-2.5  w-full text-sm text-black-900 bg-white-50 
              rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-slate-600 
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
              dark:focus:border-blue-500 "
            placeholder="Write your suggestion here..."
          ></textarea>
          <button
            className="uration-300 px-5 py-2.5 font-[Poppins]
           rounded-md text-white md:w-auto bg-sky-500 hover:bg-sky-600 sm:mx-16 lg:mx-20"
          >
            Submit
          </button>
        </div>
      </div>
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
      <div className="flex flex-col gap-4">
        <Item Links={ADDRESS} title="ADDRESS" />
        <Item Links={CONTACT} title="CONTACT" />
      </div>
    </div>
  );
};
export default ItemsContainer;