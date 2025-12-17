import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, MapPin, Mail, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

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

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/chalets', label: 'Chalets' },
    { href: '/mapa', label: 'Mapa' },
    { href: '/experiencias', label: 'Experiencias' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-0 py-0 max-h-[60px] flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo_vagar.svg"
              alt="Vagar"
              width={200}
              height={65}
              className="h-22 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-600 text-sm hover:text-gray-800">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-800">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className='hidden'>menú</SheetTitle>
              <nav className="flex flex-col mx-6 mt-14 flex-1 pb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg text-gray-600 hover:text-gray-800 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                    <Separator className="my-3" />

                  </Link>
                ))}
                <div className="mt-auto flex flex-col space-y-4 text-center md:text-left">
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li className="flex items-start justify-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className='text-left'>Chumamaya 2100, Merlo, Argentina</span>
                    </li>
                    <li className="flex items-center justify-start gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href="mailto:reservas@vagar.com.ar" className="hover:text-primary transition-colors">
                        reservas@vagar.com.ar
                      </a>
                    </li>
                    <li className="flex items-center justify-start gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href="tel:02656476500" className="hover:text-primary transition-colors">
                        02656 - 476500
                      </a>
                    </li>
                  </ul>
                  <div className="flex items-center justify-start gap-4 pt-2">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
