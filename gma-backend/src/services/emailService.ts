import nodemailer from 'nodemailer';
import { config } from '../config/index';

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (!config.enableEmail) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  return transporter;
}

export async function sendAutoResponse(data: {
  to: string;
  name: string;
  type: 'booking' | 'prayer' | 'contact' | 'general';
  referenceId?: string;
}) {
  const t = getTransporter();
  if (!t || !data.to) return;

  const subjects = {
    booking: 'Booking Received - GMA City Complex',
    prayer: 'Prayer Request Received - GMA City Complex',
    contact: 'Message Received - GMA City Complex',
    general: 'Submission Received - GMA City Complex',
  };

  const messages = {
    booking: `Dear ${data.name},\n\nYour booking request has been received.\n\n"God is in control, we will get back to you shortly."\n\nOur pastoral care team will contact you within 24 hours to confirm your session.\n\nGod bless,\nGMA City Complex Team`,
    prayer: `Dear ${data.name},\n\nYour prayer request has been received.\n\n"God is in control, we will get back to you shortly."\n\nOur prayer team will lift your needs before the Lord and contact you soon.\n\n"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6\n\nGod bless,\nGMA City Complex Team`,
    contact: `Dear ${data.name},\n\nYour message has been received.\n\n"God is in control, we will get back to you shortly."\n\nOur team will respond within 24 to 48 hours.\n\nGod bless,\nGMA City Complex Team`,
    general: `Dear ${data.name},\n\nYour submission has been received.\n\n"God is in control, we will get back to you shortly."\n\nOur team will get back to you soon.\n\nGod bless,\nGMA City Complex Team`,
  };

  const mailOptions = {
    from: `"GMA City Complex" <${config.smtpUser}>`,
    to: data.to,
    subject: subjects[data.type] || subjects.general,
    text: messages[data.type] || messages.general,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send auto-response email:', error);
  }
}

export async function sendPastorResponse(data: {
  to: string;
  name: string;
  subject: string;
  message: string;
  referenceId?: string;
}) {
  const t = getTransporter();
  if (!t || !data.to) return;

  const mailOptions = {
    from: `"GMA City Complex" <${config.smtpUser}>`,
    to: data.to,
    subject: data.subject || 'Response from GMA City Complex',
    text: `Dear ${data.name},\n\n${data.message}\n\n${data.referenceId ? 'Reference: ' + data.referenceId + '\n\n' : ''}God bless,\nGMA City Complex Pastoral Team`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send pastor response email:', error);
    throw error;
  }
}

export async function sendSubmissionConfirmation(submission: {
  name: string;
  phone: string;
  program: string;
  preferred_date: string;
  message?: string;
  email?: string;
}) {
  const t = getTransporter();
  if (!t) return;

  const recipient = submission.email || submission.phone;
  if (!recipient) return;

  const mailOptions = {
    from: `"GMA City Complex" <${config.smtpUser}>`,
    to: recipient,
    subject: 'Booking Confirmation - GMA City Complex',
    text: `Dear ${submission.name},

Your booking for ${submission.program} on ${submission.preferred_date} has been received.

We will contact you shortly.

God bless,
GMA City Complex Team`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

export async function sendAdminAlert(submission: {
  name: string;
  phone: string;
  program: string;
  preferred_date: string;
  message?: string;
}) {
  const t = getTransporter();
  if (!t) return;

  const mailOptions = {
    from: `"GMA City Complex" <${config.smtpUser}>`,
    to: config.adminAlertEmail,
    subject: 'New Booking Submission - GMA City Complex',
    text: `New booking received:

Name: ${submission.name}
Phone: ${submission.phone}
Program: ${submission.program}
Preferred Date: ${submission.preferred_date}
Message: ${submission.message || 'No additional details'}

Please follow up promptly.`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send admin alert email:', error);
  }
}
