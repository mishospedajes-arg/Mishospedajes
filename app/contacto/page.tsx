'use client';

import { H1, H4, P, Small } from '@/components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Facebook, Instagram, Loader2, CheckCircle2 } from 'lucide-react';
import { sendContactEmail } from '@/app/actions/contact';
import { useToast } from '@/components/ui/use-toast';
import { useState, useTransition } from 'react';

export default function ContactPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendContactEmail(formData);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setSuccess(true);
        toast({
          title: 'Mensaje enviado',
          description: 'Hemos recibido tu mensaje correctamente. Te contactaremos pronto.',
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Columna Izquierda: Información de Contacto */}
        <div className="space-y-8">
          <div>

            <Small className="text-muted-foreground">/ ponte en contacto /</Small>
            <H1>Siempre estamos listos para ayudarte y responder tus preguntas</H1>
            <P className="text-muted-foreground mt-4">
              Completa el formulario o utiliza nuestros canales de contacto directo. Nuestro equipo está disponible para asistirte con cualquier consulta que tengas.
            </P>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <H4>Atención Telefónica</H4>
              <div className="flex items-center mt-4 text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span>800 100 975 20 54</span>
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span>(123) 1800-234-5678</span>
              </div>
            </div>
            <div>
              <H4>Nuestra Ubicación</H4>
              <P className="mt-4 text-muted-foreground">Merlo, San Luis - 1060</P>
              <P className="text-muted-foreground">Str. First Avenue 1</P>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <H4>Email</H4>
              <div className="flex items-center mt-4 text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>vagar@gmail.com</span>
              </div>
            </div>
            <div>
              <H4>Redes Sociales</H4>
              <div className="flex items-center space-x-4 mt-4">
                <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Contacto */}
        <div>
          <Card className="bg-gray-50 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Ponte en Contacto</CardTitle>
              <P className="text-muted-foreground pt-2">
                Completa el formulario y nos pondremos en contacto contigo a la brevedad.
              </P>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in fade-in zoom-in duration-300">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <H4>¡Mensaje enviado!</H4>
                    <P className="text-muted-foreground">
                      Hemos recibido tu mensaje correctamente. Nuestro equipo te contactará pronto.
                    </P>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => setSuccess(false)}
                    className="mt-4"
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form action={handleSubmit} className="space-y-6">
                  <Input name="name" placeholder="Nombre completo" required />
                  <Input name="email" type="email" placeholder="Correo electrónico" required />
                  <Input name="subject" placeholder="Asunto" required />
                  <Textarea name="message" placeholder="Mensaje" rows={5} required />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Mensaje'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Placeholder para el Mapa */}
      <div className="mt-16 text-center bg-gray-100 p-16 rounded-lg">
        <H4>Sección del Mapa</H4>
        <P className="text-muted-foreground mt-2">
          El mapa.
        </P>
      </div>
    </div>
  );
}
