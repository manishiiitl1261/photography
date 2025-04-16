"use client";
import Gallery from "@/components/Portfolio/Gallary";
import Collection from "@/components/Portfolio/Collection";

export default function Portfolioo() {
    return (
        <div className="sm:mb-10 sm:pb-10 mb-4 pb-4">
            <Gallery />
            <div className=" mx-4 sm:mx-28  bg-white border-2 border-black rounded-lg shadow-2xl shadow-cyan-300">
                <Collection />
            </div>
        </div>
    );
}
