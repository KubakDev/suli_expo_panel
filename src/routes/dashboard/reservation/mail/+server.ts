import AcceptMailTemplate from './acceptMailTemplate.svelte';
import { render } from 'svelte-email';
import type { RequestHandler } from '@sveltejs/kit';
import { createTransport, type Transporter } from 'nodemailer';

let transport: Transporter;
const email: string = import.meta.env.VITE_PRIVATE_EMAIL;
const password: string = import.meta.env.VITE_PRIVATE_EMAIL_PASSWORD

export const POST = (async ({ locals, params, request }) => {
  const { emailUser, message, companyData, exhibition, contactInfo, reservationData, status } = await request.json();
  if (!transport) {
    transport = createTransport({
      service: 'gmail',
      port: 465,
      auth: {
        user: email,
        pass: password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  const emailHtml = render({
    template: AcceptMailTemplate,
    props: {
      companyData,
      exhibition,
      reservationData,
      contactInfo,
      status

    }
  });

  const worked = await transport.sendMail({
    from: email,
    to: emailUser,
    subject: "Your Seat Reservation Request Update",
    text: message,
    html: emailHtml,
  });
  return new Response(worked.response);
}) satisfies RequestHandler;