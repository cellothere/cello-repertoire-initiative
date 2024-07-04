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

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const templateParams = {
      pieceName,
      composer,
      whereToBuyOrDownload,
      description,
    };

    emailjs.send("service_ytjldce", "template_qw94mwl", templateParams, "zxjhLDmpRSIw4Gqlu")
      .then(
        (response) => {
          console.log("Email sent", response.status, response.text);
          setPieceName('');
          setComposer('');
          setWhereToBuyOrDownload('');
          setDescription('');
        },
        (error) => {
          console.log("Email not sent...", error);
        }
      );
  };

  return (
    <div>
      <Head>
        <title>Contribute to our Database</title>
      </Head>
      <NavbarMain />
      <main className="p-4 contribute">
        <h1 className="text-center mb-4">Contribute to our Database</h1>
        <p className="text-center">
          Is there a piece of music or teaching resource not on our website? If so, please fill out the form below and we
          will add it to our database!
        </p>
        <form onSubmit={submitForm} className="mx-auto max-w-lg">
          <div className="form-group mb-4">
            <label htmlFor="pieceName">Piece Name:</label>
            <input
              type="text"
              id="pieceName"
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="composer">Composer(s):</label>
            <input
              type="text"
              id="composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="whereToBuyOrDownload">Where can we find, buy, or download this piece?</label>
            <input
              type="text"
              id="whereToBuyOrDownload"
              value={whereToBuyOrDownload}
              onChange={(e) => setWhereToBuyOrDownload(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-full">Submit</button>
        </form>
      </main>
    </div>
  );
};

export default Contribute;
