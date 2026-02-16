import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {Resend} from "resend";

// 1. Move initialization INSIDE the function or leave it as is,
// but it MUST be bound to the function below.
export const sendWaitlistWelcome = onDocumentCreated(
  {
    document: "waitlist/{docId}",
    database: "contract-checker",
    region: "us-central1",
    secrets: ["RESEND_API_KEY"], // <--- ADD THIS LINE
  },
  async (event) => {
    // 2. Initialize it here inside the handler to ensure the secret is ready
    const resend = new Resend(process.env.RESEND_API_KEY);

    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const userEmail = data.email;

    if (!userEmail) {
      console.log("No email found in document");
      return;
    }

    try {
      await resend.emails.send({
        from: "Contract Checker <hello@contractchecker.net>",
        to: userEmail,
        subject: "You're on the list! Welcome to Contract Checker",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; 
                      margin: auto; padding: 20px; border: 1px solid #eee;">
            <img src="https://storage.contractchecker.net/landing.webp" 
                 alt="Logo" style="width: 150px; margin-bottom: 20px;
                 background-color: #ffffff; display: block;
                 ">
            <h1 style="color: #111827;">Welcome to the list!</h1>
            <p>Thank you for joining the waiting list for 
               <strong>Contract Checker</strong>.</p>
            <p>We'll notify you the moment we open up early access.</p>
            <p>Best regards,<br>The Contract Checker Team</p>
          </div>
        `,
      });
      console.log(`Welcome email sent to: ${userEmail}`);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
);
