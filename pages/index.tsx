import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <main>
        <h1>Welcome to the Cello Repertoire Initiative</h1>
        <p>Your source for curated cello music pieces.</p>
      </main>
    </div>
  );
};

export default Home;
