import nodemailer from 'nodemailer';

let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

// Elkuldi a beerkezo urlapot a tulajdonos emailjere.
// Ha nincs SMTP beallitva, csak a konzolra naplozza (a fejleszteshez).
export async function sendFormMail({ type, name, email, subject, message, payload }) {
  const label = type === 'sticker' ? 'Matrica rendelés' : 'Nyereményjáték';
  const text =
    `Új ${label} űrlap érkezett.\n\n` +
    `Név: ${name}\n` +
    `Email: ${email}\n` +
    `Közlemény / tárgy: ${subject}\n\n` +
    `Üzenet:\n${message}\n\n` +
    (payload ? `További adatok:\n${payload}\n` : '');

  if (!transporter || !process.env.MAIL_TO) {
    console.log('--- [EMAIL nincs beállítva, csak naplózás] ---\n' + text);
    return { delivered: false };
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    replyTo: email,
    subject: `[${label}] ${subject || name}`,
    text,
  });
  return { delivered: true };
}
