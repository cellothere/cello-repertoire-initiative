import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';
import { useState } from 'react';
import emailjs from "emailjs-com";

const ContactUs: NextPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    try {
      const response = await emailjs.send(
        "service_ytjldce",       // Your EmailJS Service ID
        "template_58yz2bs",   // New EmailJS Template ID
        templateParams,
        "zxjhLDmpRSIw4Gqlu"     // Your EmailJS Public Key
      );
      console.log("Email sent successfully", response.status, response.text);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Email sending failed", error);
    }
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
          {!formSubmitted && (
            <p className="mt-4 text-lg text-gray-900 leading-relaxed">
              Have a question or want to get in touch? Send us an email at
              <a href="mailto:cellorepertoireinitiative@gmail.com" className="text-white hover:underline"> cellorepertoireinitiative@gmail.com </a>
              or fill out the form below.
            </p>
          )}
          {/* Contact Form */}
          {!formSubmitted ? (
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
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Thank you for your message! We will get back to you soon.</p>
              <button
                type="button"
                className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:scale-105 transition"
                onClick={() => setFormSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
