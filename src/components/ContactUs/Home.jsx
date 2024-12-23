import ContactForm from '@/components/ContactUs/ContactForm';
import Item from "@/components/footer/Item";
import { ADDRESS, CONTACT } from "@/components/footer/Menu";
import Map from '@/components/ContactUs/Map';
export default function Home() {
    return (
        <div>
            <h1 className="text-center text-4xl font-bold my-8 text-black">Contact Us</h1>
            <div className="flex flex-col md:flex-row justify-center mx-4">
                <div className=" p-10 bg-white rounded-lg sm:rounded-r-none shadow-l flex flex-col pt-10 gap-10">
                    <Item Links={ADDRESS} title="ADDRESS" />
                    <Item Links={CONTACT} title="CONTACT" />
                </div>
                <div className="md:w-1/2 p-8 bg-white rounded-lg sm:rounded-l-none shadow-lg">
                    <ContactForm />
                </div>
            </div>
            <Map />

        </div>
    );
}
