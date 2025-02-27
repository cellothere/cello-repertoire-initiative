import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';
import { useState } from 'react';

const ContactUs: NextPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div>
            <Head>
                <title>Contact Us | Cello Repertoire Initiative</title>
                <meta 
                    name="description" 
                    content="Get in touch with the Cello Repertoire Initiative. Contact us via email at cellorepertoireinitiative@gmail.com or send us a message using our contact form." 
                />
            </Head>
            <NavbarMain />
            <section className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
                <div className="max-w-3xl w-full">
                    <h1 className="text-3xl font-bold font-mono text-gray-900">Contact Us</h1>
                    <p className="mt-4 text-lg text-gray-900 leading-relaxed">
                        Have a question or want to get in touch? Send us an email at 
                        <a href="mailto:cellorepertoireinitiative@gmail.com" className="text-white hover:underline"> cellorepertoireinitiative@gmail.com </a> 
                        or fill out the form below.
                    </p>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white text-black shadow-lg rounded-lg p-6">
                        <div className="flex flex-col text-left">
                            <label htmlFor="name" className="font-semibold">Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 p-2 border rounded-md w-full"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="flex flex-col text-left">
                            <label htmlFor="email" className="font-semibold">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 p-2 border rounded-md w-full"
                                placeholder="Your Email"
                            />
                        </div>

                        <div className="flex flex-col text-left">
                            <label htmlFor="message" className="font-semibold">Message</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 p-2 border rounded-md w-full"
                                placeholder="Your Message"
                                rows={4}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-black text-white py-2 px-4 rounded-md hover:scale-105 transition">
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
