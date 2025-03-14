const Footer = () => {
  return (
    <footer className="w-full text-center text-xs font-mono py-4 text-white shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
      © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
    </footer>
  );
};

export default Footer;
