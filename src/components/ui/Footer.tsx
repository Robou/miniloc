import { Badge } from 'flowbite-react';
import { FaMountain } from 'react-icons/fa6';

function Footer() {
  return (
    <div>
      <footer className="py-6 bg-gray-800 text-white text-center w-full">
        <Badge icon={FaMountain} />
        Club Alpin Français - Section d'Avignon et Vaucluse
      </footer>
    </div>
  );
}

export default Footer;
