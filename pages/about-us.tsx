import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';

const AboutUs: NextPage = () => {
    return (
        <div>
            <Head>
                <title>About Us | Cello Repertoire Initiative</title>
                <meta 
                    name="description" 
                    content="The Cello Repertoire Initiative provides teachers, students, and performers with a searchable database of level-appropriate musical literature and teaching resources, highlighting underrepresented composers."
                />
            </Head>
            <NavbarMain />
            <section className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
                <div className="max-w-3xl">
                    <h1 className="text-3xl font-bold font-mono text-white">
                        The Cello Repertoire Initiative
                    </h1>
                    <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                        We exist to provide teachers, students, and performers with a searchable database 
                        of level-appropriate musical literature and teaching resources. By featuring works 
                        by under-recognized and underrepresented composers, we hope you will discover music 
                        that resonates with both you and your students.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
