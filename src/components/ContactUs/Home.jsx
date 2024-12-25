import { useState } from 'react';
import ContactForm from '@/components/ContactUs/ContactForm';
import Item from '@/components/footer/Item';
import { ADDRESS, CONTACT } from '@/components/footer/Menu';
import Map from '@/components/ContactUs/Map';

export default function Home() {
    const [contactUs, setContactUs] = useState('hidden');
    const [name, setName] = useState('Contact Us');

    const handleOnClick = () => {
        if (contactUs === 'hidden') {
            setContactUs('flex');
            setName('Hide Contact Form');
        } else {
            setContactUs('hidden');
            setName('Contact Us');
        }
    };

    return (
        <div>
            <h1 className="text-center text-4xl font-bold my-8 text-black">Contact Us</h1>
            <div className="flex flex-col md:flex-row justify-center mx-4">
                <div className="p-10 bg-white rounded-lg flex flex-col gap-10 shadow-md">
                    <Item Links={ADDRESS} title="ADDRESS" />
                    <Item Links={CONTACT} title="CONTACT" />
                    <button
                        type="button"
                        className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                        onClick={handleOnClick}
                    >
                        {name}
                    </button>
                </div>
                <div className={`p-10 bg-white ${contactUs} rounded-lg shadow-md`}>
                    <ContactForm />
                </div>
            </div>
            <Map />
        </div>
    );
}
