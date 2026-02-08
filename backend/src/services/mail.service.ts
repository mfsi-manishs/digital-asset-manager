/**
 * @file mail.service.ts
 * @fileoverview This file contains the mail service
 */

import nodemailer from "nodemailer";
import { env } from "../env.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  return transporter
    .sendMail({
      from: `"Digital Asset Manager" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    .then((info) => console.log("Message sent: %s", info.messageId));
}
