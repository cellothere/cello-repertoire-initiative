import { useState } from 'react';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';
import emailjs from "emailjs-com";

type ContributeProps = {};

const Contribute: NextPage<ContributeProps> = () => {
    const [pieceName, setPieceName] = useState('');
    const [composer, setComposer] = useState('');
    const [whereToBuyOrDownload, setWhereToBuyOrDownload] = useState('');
    const [description, setDescription] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const templateParams = {
            pieceName,
            composer,
            whereToBuyOrDownload,
            description,
        };

        try {
            const response = await emailjs.send("service_ytjldce", "template_qw94mwl", templateParams, "zxjhLDmpRSIw4Gqlu");
            console.log("Email sent", response.status, response.text);
            setFormSubmitted(true);
            setPieceName('');
            setComposer('');
            setWhereToBuyOrDownload('');
            setDescription('');
        } catch (error) {
            console.error("Email not sent...", error);
        }
    };

    return (
        <div>
            <Head>
                <title>Contribute to our Database</title>
            </Head>
            <NavbarMain />
            <main className="p-4 contribute">
                <div className="max-w-screen-md mx-auto">
                    <h1 className="text-center mb-4 text-3xl font-bold">Contribute to our Database</h1>
                    {!formSubmitted ? (
                        <>
                            <p className="text-center mb-8">
                                Is there a piece of music or teaching resource not on our website? If so, please fill out the form below
                                and after review, we will add it to our database!
                            </p>
                            <form onSubmit={submitForm} className="space-y-4">
                                <div>
                                    <label htmlFor="pieceName" className="block mb-1">Piece Name:</label>
                                    <input
                                        type="text"
                                        id="pieceName"
                                        value={pieceName}
                                        onChange={(e) => setPieceName(e.target.value)}
                                        required
                                        className="form-input w-full p-2 rounded bg-white border border-gray-600 text-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="composer" className="block mb-1">Composer(s):</label>
                                    <input
                                        type="text"
                                        id="composer"
                                        value={composer}
                                        onChange={(e) => setComposer(e.target.value)}
                                        required
                                        className="form-input w-full p-2 rounded bg-white border border-gray-600 text-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="whereToBuyOrDownload" className="block mb-1">Where can we find, buy, or download this piece? Please include any relevant links.</label>
                                    <input
                                        type="text"
                                        id="whereToBuyOrDownload"
                                        value={whereToBuyOrDownload}
                                        onChange={(e) => setWhereToBuyOrDownload(e.target.value)}
                                        required
                                        className="form-input w-full p-2 rounded bg-white border border-gray-600 text-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block mb-1">Description:</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="form-textarea w-full p-2 rounded bg-white border border-gray-600 text-black h-24"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary bg-black text-white px-6 py-3 w-10px rounded-lg mt-4 transition-transform hover:scale-105">Submit</button>
                            </form>
                        </>
                    ) : (
                        <p className="text-center text-black-600">Thank you for your contribution! We will review it shortly.
                            <button
                                type="button"
                                className="btn btn-primary w-full bg-black text-white px-6 py-3 rounded-lg mt-4 transition-transform hover:scale-105"
                                onClick={() => window.location.reload()}
                            >
                                Submit Another Piece
                            </button>
                        </p>

                    )}
                </div>
            </main>
        </div>
    );
};

export default Contribute;
