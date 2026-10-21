import { NextPage } from 'next';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { useState } from 'react';
import emailjs from "emailjs-com";

const ContactUs: NextPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    try {
      await emailjs.send(
        "service_ytjldce",       // Your EmailJS Service ID
        "template_58yz2bs",   // New EmailJS Template ID
        templateParams,
        "zxjhLDmpRSIw4Gqlu"     // Your EmailJS Public Key
      );
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Email sending failed", error);
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact Us"
        path="/contact"
        description="Get in touch with the Cello Repertoire Initiative. Contact us via email at cellorepertoireinitiative@gmail.com or send us a message using our contact form."
      />
      <PageHeader title="Get in Touch" subtitle="Have questions or suggestions? We'd love to hear from you." />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Contact Information */}
          {!formSubmitted && (
            <div className="text-center mb-10">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Questions, feedback, or collaboration ideas? We&apos;re here to help.
              </p>
              <p className="text-gray-600">
                Email us directly at{' '}
                <a
                  href="mailto:cellorepertoireinitiative@gmail.com"
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                >
                  cellorepertoireinitiative@gmail.com
                </a>
                {' '}or use the form below.
              </p>
            </div>
          )}

          {/* Contact Form */}
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-200">
              <div className="space-y-6">
                <div className="flex flex-col">
                  <label htmlFor="name" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="message" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                  ></textarea>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-teal-600 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 text-center border border-gray-200">
              <div className="mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Message Sent Successfully!
                </h2>
                <p className="text-gray-600 text-lg">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
              <button
                type="button"
                className="bg-black hover:bg-teal-600 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 inline-block"
                onClick={() => setFormSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactUs;
