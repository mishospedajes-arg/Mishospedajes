'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
        return { error: 'Por favor completa todos los campos.' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Vagar <onboarding@resend.dev>', // Update this if you have a custom domain
            to: ['jmesparre@gmail.com'],
            subject: `Nuevo mensaje de contacto: ${subject}`,
            text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
            replyTo: email,
        });

        if (data.error) {
            return { error: data.error.message };
        }

        return { success: true };
    } catch (error) {
        return { error: 'Hubo un error al enviar el mensaje.' };
    }
}
