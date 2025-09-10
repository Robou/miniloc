import { FaMountain, FaGithub } from 'react-icons/fa6';

function Footer() {
  return (
    <div>
      <footer className="w-full bg-gray-800 py-6 text-center text-white">
        <div className="mt-2 flex items-center justify-center">
          <FaMountain className="mr-3" aria-hidden="true" />
          <span>09/2025 Version bêta de développement</span>
        </div>
        {/* GitHub repository link */}
        <div className="mt-4 flex items-center justify-center">
          <FaGithub className="mr-2" aria-hidden="true" />
          <a
            href="https://github.com/Robou/miniloc/tree/dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 transition-colors hover:text-blue-100"
          >
            Voir le code source sur GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
