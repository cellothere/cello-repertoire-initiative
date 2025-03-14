const Footer = () => {
  return (
    <footer className="w-full text-center text-xs font-mono py-4 text-white shadow-md whitespace-normal sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis">
      © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
    </footer>
  );
};

export default Footer;
