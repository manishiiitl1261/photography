"use client";

import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoginButton from "@/components/auth/LoginButton";
import UserProfileMenu from "@/components/auth/UserProfileMenu";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Use translations for navigation
    const navigation = [
        { name: t.nav.home, href: "/", current: false },
        { name: t.nav.portfolio, href: "/Portfolio", current: false },
        { name: t.nav.services, href: "/Services", current: false },
        { name: t.nav.aboutUs, href: "/AboutUs", current: false },
        { name: t.nav.contactUs, href: "/ContactUs", current: false },
    ];

    return (
        <>
            <div className="fixed w-screen bg-opacity-50 backdrop-blur-lg z-50 bg-slate-400">
                <Disclosure as="nav">
                    {({ open }) => (
                        <>
                            <div className="flex h-16 items-center sm:justify-between px-4 sm:px-6 lg:px-8">
                                {/* Mobile menu button */}
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    <Disclosure.Button className="absolute top-4 left-4 inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6 text-black" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6 text-black" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                {/* Logo */}
                                <div className="flex flex-1 items-center justify-around sm:items-stretch " >
                                    <div className="">
                                        <img
                                            className="h-12 w-20 rounded-lg"
                                            src="/assest/logo.jpg"
                                            alt="Your Company"
                                        />
                                    </div>

                                    {/* Desktop Navigation */}
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current
                                                            ? "bg-gray-900 text-white"
                                                            : "text-white hover:bg-gray-700 hover:text-white",
                                                        "rounded-md py-2 px-3 text-lg font-medium"
                                                    )}
                                                    aria-current={item.current ? "page" : undefined}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right side menu - Desktop */}
                                    <div className="hidden sm:flex items-center space-x-4">
                                        <LanguageSwitcher />

                                        {/* Auth Section */}
                                        {user ? (
                                            <UserProfileMenu />
                                        ) : (
                                            <LoginButton />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu */}
                            <Disclosure.Panel className="sm:hidden">
                                <div className="space-y-1 px-2 pb-3 pt-2">
                                    {navigation.map((item) => (
                                        <Disclosure.Button
                                            key={item.name}
                                            as="a"
                                            href={item.href}
                                            className={classNames(
                                                item.current
                                                    ? ""
                                                    : "text-black font-bold hover:bg-gray-700 hover:text-white",
                                                "block rounded-md px-3 py-2 text-base font-medium text-center"
                                            )}
                                            aria-current={item.current ? "page" : undefined}
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    ))}

                                    {/* Language and Auth - Mobile */}
                                    <div className="flex justify-center space-y-2 flex-col items-center mt-3">
                                        <LanguageSwitcher />

                                        {/* Auth Section - Mobile */}
                                        <div className="mt-2">
                                            {user ? (
                                                <UserProfileMenu />
                                            ) : (
                                                <LoginButton />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            </div>
        </>
    );
}