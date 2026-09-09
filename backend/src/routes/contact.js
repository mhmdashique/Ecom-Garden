import express from "express";
import { db, genId } from "../utils/memoryStore.js";
import { auth, adminOnly } from "../middleware/auth.js";
import { notifyContact, thankYouContact, recipient, sendMail, escapeHtml } from "../utils/mailer.js";
import supabase, { supabaseAdmin, secretKey } from "../config/supabase.js";
const router = express.Router();
const database = supabaseAdmin || supabase;
const canUseDatabase = Boolean(
  database && secretKey && !secretKey.includes("•"),
);

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message)
    return res
      .status(400)
      .json({ error: "Name, email and message are required" });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res
      .status(400)
      .json({ error: "Enter a valid customer email address" });
  const entry = {
    id: genId(),
    name,
    email,
    subject,
    message,
    created_at: new Date().toISOString(),
  };
  db.contact_messages.push(entry);
  if (canUseDatabase) {
    database
      .from("contact_messages")
      .insert({
        id: entry.id,
        name,
        email,
        subject,
        message,
        created_at: entry.created_at,
      })
      .then(({ error }) => {
        if (error) console.error("[db] contact insert failed:", error.message);
      })
      .catch((e) =>
        console.error("[db] contact insert error:", e.message),
      );
  }
  let mail;
  let customerMail;
  let mailError;
  try {
    mail = await notifyContact({ name, email, subject, message });
  } catch (error) {
    mailError = error.message;
    console.error("[mail] contact notification failed:", error.message);
  }
  try {
    customerMail = await thankYouContact({ name, email, subject });
  } catch (error) {
    mailError = mailError || error.message;
    console.error("[mail] customer acknowledgment failed:", error.message);
  }
  res.status(201).json({
    message: "Message received",
    entry,
    notification: {
      to: recipient,
      sent: Boolean(mail?.sent),
      preview: Boolean(mail?.preview),
      subject:
        mail?.subject ||
        `Verdant contact: ${subject || "New customer message"}`,
      customer: {
        to: email,
        sent: Boolean(customerMail?.sent),
        preview: Boolean(customerMail?.preview),
        subject: customerMail?.subject || "We got your message — Verdant",
      },
      error: mailError || null,
    },
  });
});
router.get("/", auth, adminOnly, (req, res) => {
  if (!canUseDatabase) return res.json(db.contact_messages);
  database
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .then(({ data, error }) =>
      res.json(error ? db.contact_messages : data || []),
    )
    .catch(() => res.json(db.contact_messages));
});
router.put("/:id/reply", auth, adminOnly, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.trim())
    return res.status(400).json({ error: "Reply message is required" });
  const entry = db.contact_messages.find((c) => c.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Contact message not found" });
  entry.reply = message.trim();
  entry.replied_at = new Date().toISOString();
  if (canUseDatabase) {
    database
      .from("contact_messages")
      .update({
        reply: message.trim(),
        replied_at: entry.replied_at,
      })
      .eq("id", req.params.id)
      .then(({ error }) => {
        if (error)
          console.error("[db] contact reply update failed:", error.message);
      })
      .catch((e) =>
        console.error("[db] contact reply update error:", e.message),
      );
  }
  try {
    await sendMail({
      to: entry.email,
      subject: `Re: ${entry.subject || "Your message"} — Verdant`,
      text: [
        `Hi ${entry.name},`,
        "",
        "Thank you for reaching out to Verdant. Here is our reply:",
        "",
        message.trim(),
        "",
        "Warm regards,",
        "The Verdant Team 🌿",
      ].join("\n"),
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f6f7f4;padding:32px;border-radius:16px"><div style="background:#0a2e1f;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:#6ee7b7;margin:0;font-size:22px">🌿 Verdant</h1></div><h2 style="color:#0a2e1f;margin-top:0">Re: ${escapeHtml(entry.subject || "Your message")}</h2><p style="color:#444;line-height:1.6">Hi ${escapeHtml(entry.name)},</p><p style="color:#444;line-height:1.6">Thank you for reaching out to Verdant. Here is our reply:</p><div style="background:#fff;border:1px solid #d1fae5;border-radius:12px;padding:16px;margin:20px 0"><p style="margin:0;color:#065f46;font-size:14px;white-space:pre-wrap">${escapeHtml(message.trim())}</p></div><p style="color:#666;font-size:13px">Warm regards,<br/><b>The Verdant Team 🌿</b></p></div>`,
    });
  } catch (error) {
    console.error("[mail] contact reply failed:", error.message);
  }
  res.status(200).json({ message: "Reply sent", entry });
});
export default router;
