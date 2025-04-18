"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
    const pathname = usePathname();

    const [navigation, setNavigation] = useState([
        { name: t.nav.home, href: "/" },
        { name: t.nav.portfolio, href: "/Portfolio" },
        { name: t.nav.services, href: "/Services" },
        { name: t.nav.aboutUs, href: "/AboutUs" },
        { name: t.nav.contactUs, href: "/ContactUs" },
    ]);

    // Update nav labels when language changes
    useEffect(() => {
        setNavigation((prev) =>
            prev.map((item) => {
                switch (item.href) {
                    case "/":
                        return { ...item, name: t.nav.home };
                    case "/Portfolio":
                        return { ...item, name: t.nav.portfolio };
                    case "/Services":
                        return { ...item, name: t.nav.services };
                    case "/AboutUs":
                        return { ...item, name: t.nav.aboutUs };
                    case "/ContactUs":
                        return { ...item, name: t.nav.contactUs };
                    default:
                        return item;
                }
            })
        );
    }, [t]);

    return (
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
                                        <XMarkIcon className="block h-6 w-6 text-black hover:text-white" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6 text-black hover:text-white" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>

                            {/* Logo + Nav */}
                            <div className="flex flex-1 items-center justify-around">
                                {/* Logo */}
                                <div>
                                    <img
                                        className="sm:w-14 sm:h-14 h-10 w-10 rounded-full"
                                        src="/assest/logo.jpg"
                                        alt="Your Company"
                                    />
                                </div>

                                {/* Desktop Navigation */}
                                <div className="hidden sm:ml-6 md:block justify-center">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => {
                                            const isActive = pathname === item.href;

                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        isActive
                                                            ? " text-white border-white hover:border-white  hover:text-black hover:bg-white"
                                                            : "text-white hover:bg-white hover:border-white  hover:text-black",
                                                        "rounded-md py-1 px-3 text-lg font-medium border-2 border-transparent"
                                                    )}
                                                    aria-current={isActive ? "page" : undefined}
                                                >
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right Side (Language + Auth) */}
                                <div className="hidden sm:flex items-center space-x-4">
                                    <LanguageSwitcher variant="navbar" />
                                    {user ? <UserProfileMenu /> : <LoginButton />}
                                    <Link
                                        href="/admin/login"
                                        className="text-sm text-white hover:text-gray-300"
                                    >
                                        Admin
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <Disclosure.Panel className="sm:hidden">
                            <div className="space-y-1 px-2 pb-3 pt-2 gap-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                isActive
                                                    ? " text-white border-white hover:border-white  hover:text-black hover:bg-white"
                                                    : "text-white hover:bg-white hover:border-white  hover:text-black",
                                                "rounded-md py-1 px-3 text-lg font-medium border-2 border-transparent block  text-center"
                                            )}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {/* Mobile - Language + Auth */}
                                <div className="flex justify-center space-y-2 flex-col items-center mt-3">
                                    <LanguageSwitcher variant="navbar" />
                                    <div className="mt-2">
                                        {user ? <UserProfileMenu /> : <LoginButton />}
                                    </div>
                                    <Link
                                        href="/admin/login"
                                        className="text-sm text-white hover:text-gray-300 mt-2"
                                    >
                                        Admin
                                    </Link>
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </div>
    );
}
