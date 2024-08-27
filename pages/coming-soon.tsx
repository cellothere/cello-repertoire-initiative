import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';


const ComingSoon: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Coming Soon</title>
            </Head>
            <NavbarMain />
            <main className="p-4 contribute">
                <h1 className='flex items-center font-mono justify-center min-h-screen text-xl'>Coming Soon!</h1>
            </main>
        </div>
    );
};

export default ComingSoon;
