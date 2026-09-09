import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const recipient = process.env.MAIL_TO || "admin2026@gmail.com";
const smtpReady = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);
const transporter = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

if (process.env.MAIL_FROM === "onboarding@resend.dev") {
  console.warn(
    "[mail] Resend test sender is active; customer acknowledgements require a verified MAIL_FROM domain or an allowed test recipient.",
  );
}

if (transporter) {
  transporter
    .verify()
    .then(() =>
      console.log(`[mail] SMTP ready; notifications will go to ${recipient}`),
    )
    .catch((error) =>
      console.error(`[mail] SMTP connection failed: ${error.message}`),
    );
} else {
  console.warn(
    "[mail] SMTP is not configured; notifications will be logged as previews",
  );
}

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );

const sendMail = async ({ subject, text, html, replyTo, to }) => {
  const message = {
    from: process.env.MAIL_FROM || process.env.SMTP_USER || recipient,
    to: to || recipient,
    subject,
    text,
    html,
    replyTo,
  };
  if (!transporter) {
    const target = to || recipient;
    console.log(`[MAIL PREVIEW] ${subject} -> ${target}\n${text}`);
    return { sent: false, preview: true, to: target, subject, text };
  }
  await transporter.sendMail(message);
  return { sent: true, preview: false, to: to || recipient, subject };
};

export const notifyLogin = (user, request = {}) => {
  const dateTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const userAgent = request.headers?.["user-agent"] || "Unknown";
  const subject = `New login to your account — ${user.email}`;
  const company = process.env.COMPANY_NAME || "GreenNest";
  const text = [
    `Hi ${user.name || "there"},`,
    "",
    "We noticed a new login to your account.",
    "",
    "Login details:",
    `* Date & Time: ${dateTime} IST`,
    `* Device: ${userAgent}`,
    `* Browser: ${userAgent}`,
    "",
    "If this was you, no action is required.",
    "",
    "If you don't recognize this login, please secure your account immediately by changing your password and reviewing your account activity.",
    "",
    "Stay secure,",
    `The ${company} Team`,
  ].join("\n");
  return sendMail({
    to: user.email,
    subject,
    text,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f6f7f4;padding:32px;border-radius:16px"><div style="background:#0a2e1f;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:#6ee7b7;margin:0;font-size:22px">🌿 ${escapeHtml(company)}</h1></div><h2 style="color:#0a2e1f;margin-top:0">New login detected</h2><p style="color:#444;line-height:1.6">Hi ${escapeHtml(user.name || "there")},</p><p style="color:#444;line-height:1.6">We noticed a new login to your account.</p><div style="background:#fff;border:1px solid #d1fae5;border-radius:12px;padding:16px;margin:20px 0"><p style="margin:0;color:#065f46;font-size:14px"><b>Login details:</b><br/>• Date & Time: ${escapeHtml(dateTime)} IST<br/>• Device: ${escapeHtml(userAgent)}<br/>• Browser: ${escapeHtml(userAgent)}</p></div><p style="color:#666;font-size:13px">If this was you, no action is required.<br/><br/>If you don't recognize this login, please secure your account immediately by changing your password and reviewing your account activity.<br/><br/>Stay secure,<br/><b>The ${escapeHtml(company)} Team</b></p></div>`,
  });
};

export const notifyContact = ({ name, email, subject, message }) => {
  const mailSubject = `GreenNest contact: ${subject || "New customer message"}`;
  const text = [
    "New customer contact message",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject || "(none)"}`,
    "",
    message,
  ].join("\n");
  return sendMail({
    subject: mailSubject,
    text,
    replyTo: email,
    html: `<h2>New GreenNest contact message</h2><p><b>Name:</b> ${escapeHtml(name)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Subject:</b> ${escapeHtml(subject || "(none)")}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
  });
};

export const thankYouContact = ({ name, email, subject }) => {
  const safeSubject = subject || "your enquiry";
  const text = [
    `Hi ${name},`,
    "",
    "Thank you for contacting GreenNest! We have received your message and will get back to you within 2 hours.",
    "",
    `Topic: ${safeSubject}`,
    "",
    "In the meantime, feel free to browse our plant collection at greennest.com.",
    "",
    "Warm regards,",
    "The GreenNest Team 🌿",
  ].join("\n");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f6f7f4;padding:32px;border-radius:16px">
      <div style="background:#0a2e1f;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <h1 style="color:#6ee7b7;margin:0;font-size:22px">🌿 GreenNest</h1>
      </div>
      <h2 style="color:#0a2e1f;margin-top:0">Thank you, ${escapeHtml(name)}!</h2>
      <p style="color:#444;line-height:1.6">We've received your message about <b>${escapeHtml(safeSubject)}</b> and our team will get back to you within <b>2 hours</b>.</p>
      <div style="background:#fff;border:1px solid #d1fae5;border-radius:12px;padding:16px;margin:20px 0">
        <p style="margin:0;color:#065f46;font-size:14px">⏰ Expected reply: <b>within 2 hours</b><br/>📧 Reply to this email anytime</p>
      </div>
      <p style="color:#666;font-size:13px">Warm regards,<br/><b>The GreenNest Team 🌿</b></p>
    </div>`;
  return sendMail({
    to: email,
    subject: `We got your message — GreenNest`,
    text,
    html,
  });
};

export const notifyRegistration = ({ name, email }) => {
  const subject = "Welcome to GreenNest — Your account has been created";
  const text = [
    `Hi ${name},`,
    "",
    "Welcome to GreenNest! Your account has been created successfully.",
    "",
    "You can now log in to browse our plant collection, place orders, and manage your account.",
    "",
    "If you have any questions, feel free to reach out to our support team.",
    "",
    "Happy planting! 🌿",
    "The GreenNest Team",
  ].join("\n");
  return sendMail({
    to: email,
    subject,
    text,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f6f7f4;padding:32px;border-radius:16px"><div style="background:#0a2e1f;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:#6ee7b7;margin:0;font-size:22px">🌿 GreenNest</h1></div><h2 style="color:#0a2e1f;margin-top:0">Welcome to GreenNest 🌿</h2><p style="color:#444;line-height:1.6">Hi ${escapeHtml(name)},</p><p style="color:#444;line-height:1.6">Your account has been <b>successfully created</b>. You can now log in to browse our plant collection, place orders, and manage your account.</p><div style="background:#fff;border:1px solid #d1fae5;border-radius:12px;padding:16px;margin:20px 0"><p style="margin:0;color:#065f46;font-size:14px">Need help? Contact our support team anytime.<br/>Happy planting! 🌱</p></div><p style="color:#666;font-size:13px">The GreenNest Team</p></div>`,
  });
};

export { escapeHtml, recipient, sendMail };
