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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head>
        <title>Contact Us | Cello Repertoire Initiative</title>
        <meta
          name="description"
          content="Get in touch with the Cello Repertoire Initiative. Contact us via email at cellorepertoireinitiative@gmail.com or send us a message using our contact form."
        />
      </Head>
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">Contact Us</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            We'd love to hear from you.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {!formSubmitted && (
            <p className="text-center text-lg text-gray-700 leading-relaxed mb-8">
              Have a question or want to get in touch? Send us an email at{' '}
              <a
                href="mailto:cellorepertoireinitiative@gmail.com"
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
              >
                cellorepertoireinitiative@gmail.com
              </a>
              {' '}or fill out the form below.
            </p>
          )}

          {/* Contact Form */}
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-lg rounded-xl p-8">
              <div className="flex flex-col">
                <label htmlFor="name" className="font-semibold text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Your Email"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="message" className="font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Your Message"
                  rows={5}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-purple-600 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          ) : (
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Thank you for your message!
                </p>
                <p className="text-gray-600">
                  We'll get back to you as soon as possible.
                </p>
              </div>
              <button
                type="button"
                className="bg-gradient-to-br from-purple-600 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                onClick={() => setFormSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
