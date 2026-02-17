import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Resend } from "resend";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore("contract-checker");

interface AddToWaitlistData {
  email: string;
}

interface AddToWaitlistResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// New function: Direct waitlist submission without Firebase Auth
export const addToWaitlist = onCall(
  { region: "us-central1" },
  async (request: CallableRequest<AddToWaitlistData>): Promise<AddToWaitlistResponse> => {
    // Validate origin from the request
    // In callable functions, we can't easily access headers, but we can validate via X-Forwarded-Host or similar
    // For now, we'll skip origin validation since callable functions handle CORS automatically
    // The actual protection is in Firestore rules (no write without auth, but admin has access)

    const email = request.data.email?.toLowerCase().trim();

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    try {
      // Check if email already exists
      const waitlistQuery = db.collection("waitlist").where("email", "==", email);
      const snapshot = await waitlistQuery.get();

      if (!snapshot.empty) {
        console.log(`[addToWaitlist] Email already exists: ${email}`);
        return { success: true, message: "Already on waitlist" };
      }

      // Add to waitlist
      await db.collection("waitlist").add({
        email,
        timestamp: Date.now(),
        status: "pending",
        source: "landing_page",
      });

      console.log(`[addToWaitlist] Added to waitlist: ${email}`);
      return { success: true, message: "Added to waitlist" };
    } catch (error) {
      console.error("[addToWaitlist] Error:", error);
      return { success: false, error: "Failed to join waitlist" };
    }
  }
);

interface CheckDeviceData {
  deviceId?: string;
}

interface CheckDeviceResponse {
  status: "trusted" | "otp_sent";
}

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

export const checkDevice = onCall<CheckDeviceData>(
  { cors: true, region: "us-central1", secrets: ["RESEND_API_KEY"] },
  async (request: CallableRequest<CheckDeviceData>): Promise<CheckDeviceResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;
    const deviceId = request.data.deviceId;

    if (deviceId) {
      const deviceDoc = await db.doc(`users/${uid}/devices/${deviceId}`).get();
      if (deviceDoc.exists) {
        // Update lastUsed timestamp for trusted device
        await db.doc(`users/${uid}/devices/${deviceId}`).update({
          lastUsed: Date.now(),
        });
        return { status: "trusted" };
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await db
      .collection("otp_codes")
      .doc(uid)
      .set({
        code,
        expiresAt: Date.now() + 300000,
      });

    const resend = new Resend(process.env.RESEND_API_KEY);

    if (email) {
      await resend.emails.send({
        from: "Security Contract Checker <otp@contractchecker.net>",
        to: email,
        subject: "New Device Verification",
        html: getOtpEmailHtml(code),
      });
    }

    return { status: "otp_sent" };
  }
);

interface VerifyDeviceData {
  otp: string;
  userAgent?: string;
}

interface VerifyDeviceResponse {
  status: "success" | "invalid" | "expired";
  newDeviceId?: string;
}

export const verifyDevice = onCall<VerifyDeviceData>(
  { cors: true, region: "us-central1", secrets: ["RESEND_API_KEY"] },
  async (request: CallableRequest<VerifyDeviceData>): Promise<VerifyDeviceResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in");
    }

    const uid = request.auth.uid;
    const otp = String(request.data.otp);

    // Get the OTP record
    const otpDoc = await db.collection("otp_codes").doc(uid).get();

    if (!otpDoc.exists) {
      console.log(`[verifyDevice] No OTP record found for uid: ${uid}`);
      return { status: "invalid" };
    }

    const otpData = otpDoc.data();
    if (!otpData) {
      return { status: "invalid" };
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      console.log(`[verifyDevice] OTP expired for uid: ${uid}`);
      // Clean up expired OTP
      await db.collection("otp_codes").doc(uid).delete();
      return { status: "expired" };
    }

    // Verify the OTP code - compare as strings
    if (otpData.code !== otp) {
      console.log(
        `[verifyDevice] Invalid OTP for uid: ${uid}. Expected: ${otpData.code}, Got: ${otp}`
      );
      return { status: "invalid" };
    }

    // OTP is valid! Create a new device entry
    const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.doc(`users/${uid}/devices/${newDeviceId}`).set({
      createdAt: Date.now(),
      userAgent: request.data.userAgent || "unknown",
      lastUsed: Date.now(),
    });

    // Clean up the used OTP
    await db.collection("otp_codes").doc(uid).delete();

    console.log(
      `[verifyDevice] Device verified successfully for uid: ${uid}, newDeviceId: ${newDeviceId}`
    );
    return { status: "success", newDeviceId };
  }
);

/**
 * Generates the HTML email template for the OTP code.
 *
 * @param {string} code - The 6-digit OTP code to display.
 * @return {string} The complete HTML string for the email.
 */

function getOtpEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Device Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
              
              <tr>
                <td style="padding: 32px 40px 0 40px; text-align: center;">
                  <img src="https://storage.contractchecker.net/landing.webp" alt="ContractChecker.net"  style="width: auto; max-width: 180px; height: auto; display: block; margin: 0 auto;  background-color: #ffffff;">
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b; text-align: center;">New Device Detected</h1>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b; text-align: center;">
                    We noticed a sign-in attempt from a new device. To protect your account, please verify it's you by entering the code below.
                  </p>

                  <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #e4e4e7;">
                    <span style="font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 32px; font-weight: 700; color: #18181b; letter-spacing: 6px;">${code}</span>
                  </div>

                  <p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a; text-align: center;">
                    This code will expire in 5 minutes. If you didn't try to sign in, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                    &copy; ${new Date().getFullYear()} ContractChecker.net. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
