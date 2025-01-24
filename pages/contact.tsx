import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ContactPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /coming-soon when the page is loaded
    router.push('/coming-soon');
  }, [router]);

  return null; // Optionally, you can show a loading spinner or message while redirecting
};

export default ContactPage;
