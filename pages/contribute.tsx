import { useState } from 'react';
import { NextPage } from 'next';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import emailjs from "emailjs-com";

const Contribute: NextPage = () => {
    const [pieceName, setPieceName] = useState('');
    const [composer, setComposer] = useState('');
    const [whereToBuyOrDownload, setWhereToBuyOrDownload] = useState<string[]>(['']);
    const [description, setDescription] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...whereToBuyOrDownload];
        updatedLinks[index] = value;
        setWhereToBuyOrDownload(updatedLinks);
        if (error) setError(null);
    };

    const addLinkField = () => {
        if (whereToBuyOrDownload.length < 5) {
            setWhereToBuyOrDownload([...whereToBuyOrDownload, '']);
        }
    };

    const removeLinkField = (index: number) => {
        const updatedLinks = whereToBuyOrDownload.filter((_, i) => i !== index);
        setWhereToBuyOrDownload(updatedLinks);
    };

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const templateParams = {
            pieceName,
            composer,
            whereToBuyOrDownload: whereToBuyOrDownload.join(', '), // Concatenate links
            description,
        };

        try {
            await emailjs.send("service_ytjldce", "template_qw94mwl", templateParams, "zxjhLDmpRSIw4Gqlu");
            setFormSubmitted(true);
            setPieceName('');
            setComposer('');
            setWhereToBuyOrDownload(['']);
            setDescription('');
        } catch (error) {
            console.error("Email not sent...", error);
            setError("Failed to submit contribution. Please try again or contact us directly.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Seo
                title="Contribute to our Database"
                path="/contribute"
                description="Help expand our database by contributing cello music pieces and teaching resources. Share your discoveries with the cello community."
            />
            <PageHeader
                title="Contribute to Our Database"
                subtitle="Help us grow by sharing cello music and teaching resources"
            />

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="max-w-3xl mx-auto">
                    {!formSubmitted ? (
                        <>
                            <div className="text-center mb-10">
                                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                    Know of a piece of music or teaching resource that&apos;s not in our database?
                                </p>
                                <p className="text-gray-600">
                                    Fill out the form below and we&apos;ll review it for inclusion in our collection!
                                </p>
                            </div>

                            <form onSubmit={submitForm} className="space-y-6 bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-200">
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <label htmlFor="pieceName" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                                            Piece Name
                                        </label>
                                        <input
                                            type="text"
                                            id="pieceName"
                                            placeholder="Sonata No.1, Op. 25"
                                            value={pieceName}
                                            onChange={(e) => {
                                                setPieceName(e.target.value);
                                                if (error) setError(null);
                                            }}
                                            required
                                            disabled={isSubmitting}
                                            className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label htmlFor="composer" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                                            Composer(s)
                                        </label>
                                        <input
                                            type="text"
                                            id="composer"
                                            value={composer}
                                            placeholder="Full composer name"
                                            onChange={(e) => {
                                                setComposer(e.target.value);
                                                if (error) setError(null);
                                            }}
                                            required
                                            disabled={isSubmitting}
                                            className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                                            Where to Find/Buy
                                        </label>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Please provide links where this piece can be found, purchased, or downloaded
                                        </p>
                                        <div className="space-y-3">
                                            {whereToBuyOrDownload.map((link, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="url"
                                                        value={link}
                                                        placeholder="https://www.example.com/sheet-music"
                                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                                        required
                                                        disabled={isSubmitting}
                                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    />
                                                    {whereToBuyOrDownload.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLinkField(index)}
                                                            disabled={isSubmitting}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label={`Remove link ${index + 1}`}
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {whereToBuyOrDownload.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={addLinkField}
                                                    disabled={isSubmitting}
                                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Another Link
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <label htmlFor="description" className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                if (error) setError(null);
                                            }}
                                            placeholder="Add any additional details about the piece, difficulty level, or special characteristics..."
                                            disabled={isSubmitting}
                                            className="px-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            rows={5}
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
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Contribution'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 text-center border border-gray-200">
                            <div className="mb-8">
                                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                    Contribution Received!
                                </h2>
                                <p className="text-gray-600 text-lg mb-2">
                                    Thank you for helping expand our database.
                                </p>
                                <p className="text-gray-500">
                                    We&apos;ll review your submission and add it to our collection soon.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="bg-black hover:bg-teal-600 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 inline-block"
                                onClick={() => setFormSubmitted(false)}
                            >
                                Submit Another Piece
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Contribute;
