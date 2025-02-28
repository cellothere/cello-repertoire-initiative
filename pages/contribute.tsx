import { useState } from 'react';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';
import emailjs from "emailjs-com";

type ContributeProps = {};

const Contribute: NextPage<ContributeProps> = () => {
    const [pieceName, setPieceName] = useState('');
    const [composer, setComposer] = useState('');
    const [whereToBuyOrDownload, setWhereToBuyOrDownload] = useState<string[]>(['']);
    const [description, setDescription] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Handler to update a specific link
    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...whereToBuyOrDownload];
        updatedLinks[index] = value;
        setWhereToBuyOrDownload(updatedLinks);
    };

    // Handler to add a new link field
    const addLinkField = () => {
        if (whereToBuyOrDownload.length < 5) {
            setWhereToBuyOrDownload([...whereToBuyOrDownload, '']);
        }
    };

    // Handler to remove a link field
    const removeLinkField = (index: number) => {
        const updatedLinks = whereToBuyOrDownload.filter((_, i) => i !== index);
        setWhereToBuyOrDownload(updatedLinks);
    };

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const templateParams = {
            pieceName,
            composer,
            whereToBuyOrDownload: whereToBuyOrDownload.join(', '), // Concatenate links
            description,
        };

        try {
            const response = await emailjs.send("service_ytjldce", "template_qw94mwl", templateParams, "zxjhLDmpRSIw4Gqlu");
            console.log("Email sent", response.status, response.text);
            setFormSubmitted(true);
            setPieceName('');
            setComposer('');
            setWhereToBuyOrDownload(['']);
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
                                        placeholder='Sonata No.1, Op. 25'
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
                                        placeholder="Full composer name"
                                        onChange={(e) => setComposer(e.target.value)}
                                        required
                                        className="form-input w-full p-2 rounded bg-white border border-gray-600 text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">
                                        Where can we find, buy, or download this piece? Please include any relevant links.
                                    </label>
                                    {whereToBuyOrDownload.map((link, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <input
                                                type="url"
                                                value={link}
                                                placeholder="e.g. www.sheetmusic.com/cellomusic"
                                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                                required
                                                className="form-input w-full p-2 rounded bg-white border border-gray-600 text-black"
                                            />
                                            {whereToBuyOrDownload.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLinkField(index)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                    aria-label={`Remove link ${index + 1}`}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {whereToBuyOrDownload.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addLinkField}
                                            className="btn btn-primary bg-black text-white px-6 py-3 w-full rounded-lg mt-4 transition-transform hover:scale-105"
                                        >
                                            Add Another
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="description" className="block mb-1">Description:</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Please be as descriptive as possible."
                                        className="form-textarea w-full p-2 rounded bg-white border border-gray-600 text-black h-24"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary bg-black text-white px-6 py-3 w-full rounded-lg mt-4 transition-transform hover:scale-105">
                                    Submit
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="mb-4">Thank you for your contribution! We will review it shortly.</p>
                            <button
                                type="button"
                                className="btn btn-primary bg-black text-white px-6 py-3 rounded-lg mt-4 transition-transform hover:scale-105"
                                onClick={() => window.location.reload()}
                            >
                                Submit Another Piece
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Contribute;
