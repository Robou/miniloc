import { Badge } from 'flowbite-react';
import { FaMountain } from 'react-icons/fa6';

function Footer() {
  return (
    <div>
      <footer className="w-full bg-gray-800 py-6 text-center text-white">
        <Badge icon={FaMountain} />
        Club Alpin Français - Section d'Avignon et Vaucluse
      </footer>
    </div>
  );
}

export default Footer;
