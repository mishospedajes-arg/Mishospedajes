import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from "lucide-react";

// Custom WhatsApp Icon as it is not always available in Lucide or we want a specific style
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white border-t  pt-16 pb-12">
      <div className="container mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo */}
          <div className="flex flex-col items-center md:items-start justify-center">
            <Link href="/">
              <Image
                src="/logo_footer_vagar.svg"
                alt="Vagar Vacaciones"
                width={150}
                height={80}
                className="h-[90%] w-[90%] m-auto"
                priority
              />
            </Link>
          </div>

          {/* Column 2: Propiedades Más Buscadas */}
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Propiedades más buscadas
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/chalets/vista-alta" className="hover:text-primary transition-colors">
                  Vista Alta
                </Link>
              </li>
              <li>
                <Link href="/chalets/calma" className="hover:text-primary transition-colors">
                  Calma
                </Link>
              </li>
              <li>
                <Link href="/chalets/valle-escondido" className="hover:text-primary transition-colors">
                  Valle escondido
                </Link>
              </li>
              <li>
                <Link href="/chalets/namaste" className="hover:text-primary transition-colors">
                  Namaste
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Enlaces Útiles */}
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Enlaces Útiles
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/chalets" className="hover:text-primary transition-colors">
                  Chalets
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="hover:text-primary transition-colors">
                  Mapa
                </Link>
              </li>
              <li>
                <Link href="/experiencias" className="hover:text-primary transition-colors">
                  Experiencias
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Chumamaya 2100, Merlo, Argentina</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:reservas@vagar.com.ar" className="hover:text-primary transition-colors">
                  reservas@vagar.com.ar
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:02656476500" className="hover:text-primary transition-colors">
                  02656 - 476500
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <a href="#" className="text-gray-800 hover:text-primary transition-colors" aria-label="WhatsApp">
                <WhatsAppIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-800 hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-800 hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-800 hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
