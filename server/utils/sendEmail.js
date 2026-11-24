import { Resend } from "resend";
import nodemailer from "nodemailer";

// Sends an email.
// On Render we use Resend (works over HTTPS; Render's free plan blocks normal SMTP email ports).
// Needs RESEND_API_KEY and EMAIL_FROM set in Render's Environment settings.
// If RESEND_API_KEY isn't set (e.g. on your laptop), it falls back to the old SMTP settings.
export default async function sendEmail({ to, subject, html }) {
    const from = process.env.EMAIL_FROM || `DkIT Fashion Society <${process.env.EMAIL_USER}>`;

    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) throw new Error(error.message || "Resend couldn't send the email");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from, to, subject, html });
}
