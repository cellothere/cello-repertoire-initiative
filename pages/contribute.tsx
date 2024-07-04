// pages/Contribute.js

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Contribute = () => {
  const [pieceName, setPieceName] = useState('');
  const [composer, setComposer] = useState('');
  const [whereToBuyOrDownload, setWhereToBuyOrDownload] = useState('');
  const [description, setDescription] = useState('');

  const submitForm = async (e) => {
    e.preventDefault();

    // Construct email template parameters
    const templateParams = {
      pieceName,
      composer,
      whereToBuyOrDownload,
      description,
    };

    // You can implement your email sending logic here
    console.log('Submitting form with:', templateParams);

    // Clear form fields after submission (optional)
    setPieceName('');
    setComposer('');
    setWhereToBuyOrDownload('');
    setDescription('');
  };

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>Contribute to our Database</title>
      </Head>
      <header className="bg-gray-800 text-white p-4 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div className="flex items-center">
            <img src="assets/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">CRI</span>
          </div>
          <div className="flex-grow max-w-lg mx-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>
        </div>
        <nav>
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
          <Link href="/music">
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Music
          </button>
          </Link>
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Contact
          </button>
        </nav>
      </header>
      <main className="p-4 contribute">
        <h1>Contribute to our database</h1>
        <p>
          Is there a piece of music or teaching resource not on our website? If so, please fill out the form below and we
          will add it to our database!
        </p>
        <form onSubmit={submitForm}>
          <div className="form-group">
            <label htmlFor="pieceName">Piece Name: (Required)</label>
            <input
              type="text"
              id="pieceName"
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="composer">Composer(s): (Required)</label>
            <input
              type="text"
              id="composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="whereToBuyOrDownload">Where can we find, buy, or download this piece? (Required)</label>
            <input
              type="text"
              id="whereToBuyOrDownload"
              value={whereToBuyOrDownload}
              onChange={(e) => setWhereToBuyOrDownload(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description: (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </main>
    </div>
  );
};

export default Contribute;
