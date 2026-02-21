/**
 * ContractChecker.net - Firebase Functions v2
 * Includes: Waitlist, OTP Device Auth, and R2 Secure Uploads
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params"; // New import for Secrets
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";

// --- NEW IMPORTS FOR R2 ---
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Initialize Admin
admin.initializeApp();
const db = getFirestore("contract-checker");

// --- DEFINE SECRETS ---
// These allow us to access the keys securely via .value() inside the function
const r2AccessKeyId = defineSecret("R2_ACCESS_KEY_ID");
const r2SecretAccessKey = defineSecret("R2_SECRET_ACCESS_KEY");
const r2Endpoint = defineSecret("R2_ENDPOINT");
const r2BucketName = defineSecret("R2_BUCKET_NAME");
// We keep your existing RESEND_API_KEY string reference for compatibility with your existing functions

// ==========================================
// 1. WAITLIST LOGIC
// ==========================================

interface AddToWaitlistData {
  email: string;
}

interface AddToWaitlistResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const addToWaitlist = onCall(
  { region: "us-central1" },
  async (request: CallableRequest<AddToWaitlistData>): Promise<AddToWaitlistResponse> => {
    const email = request.data.email?.toLowerCase().trim();

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    try {
      const waitlistQuery = db.collection("waitlist").where("email", "==", email);
      const snapshot = await waitlistQuery.get();

      if (!snapshot.empty) {
        console.log(`[addToWaitlist] Email already exists: ${email}`);
        return { success: true, message: "Already on waitlist" };
      }

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

export const sendWaitlistWelcome = onDocumentCreated(
  {
    document: "waitlist/{docId}",
    database: "contract-checker",
    region: "us-central1",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    // Note: Using process.env here as per your original code
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

// ==========================================
// 2. DEVICE AUTH & OTP LOGIC
// ==========================================

interface CheckDeviceData {
  deviceId?: string;
}

interface CheckDeviceResponse {
  status: "trusted" | "otp_sent";
}

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

    const otpDoc = await db.collection("otp_codes").doc(uid).get();

    if (!otpDoc.exists) {
      console.log(`[verifyDevice] No OTP record found for uid: ${uid}`);
      return { status: "invalid" };
    }

    const otpData = otpDoc.data();
    if (!otpData) {
      return { status: "invalid" };
    }

    if (Date.now() > otpData.expiresAt) {
      console.log(`[verifyDevice] OTP expired for uid: ${uid}`);
      await db.collection("otp_codes").doc(uid).delete();
      return { status: "expired" };
    }

    if (otpData.code !== otp) {
      return { status: "invalid" };
    }

    const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.doc(`users/${uid}/devices/${newDeviceId}`).set({
      createdAt: Date.now(),
      userAgent: request.data.userAgent || "unknown",
      lastUsed: Date.now(),
    });

    await db.collection("otp_codes").doc(uid).delete();

    return { status: "success", newDeviceId };
  }
);

// ==========================================
// 3. R2 SECURE UPLOAD LOGIC (NEW)
// ==========================================

interface GenerateUploadUrlRequest {
  filename: string;
  contentType: string;
}

interface GenerateUploadUrlResponse {
  uploadUrl: string;
  destinationPath: string;
}

export const generateUploadUrl = onCall<GenerateUploadUrlRequest>(
  {
    region: "us-central1", // Kept consistent with your other functions
    // We bind the R2 secrets here so we can use them
    secrets: [r2AccessKeyId, r2SecretAccessKey, r2Endpoint, r2BucketName],
  },
  async (
    request: CallableRequest<GenerateUploadUrlRequest>
  ): Promise<GenerateUploadUrlResponse> => {
    // 1. Auth Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to upload files.");
    }

    const { filename, contentType } = request.data;

    // 2. Validation
    if (!filename || !contentType) {
      throw new HttpsError("invalid-argument", "Filename and Content-Type are required.");
    }
    if (contentType !== "application/pdf") {
      throw new HttpsError("invalid-argument", "Only PDF files are allowed.");
    }

    const userId = request.auth.uid;
    const uniqueFileId = uuidv4();

    // 3. Path Construction: contracts/{userId}/{uuid}/{filename}
    // This strict pathing ensures User A cannot overwrite User B's files
    const destinationPath = `contracts/${userId}/${uniqueFileId}/${filename}`;

    try {
      // 4. Initialize S3 Client with Secrets
      const client = new S3Client({
        region: "auto",
        endpoint: r2Endpoint.value(),
        credentials: {
          accessKeyId: r2AccessKeyId.value(),
          secretAccessKey: r2SecretAccessKey.value(),
        },
      });

      // 5. Generate Signed URL
      const command = new PutObjectCommand({
        Bucket: r2BucketName.value(),
        Key: destinationPath,
        ContentType: contentType,
        Metadata: {
          "owner-uid": userId, // Tag object with owner in R2
        },
      });

      // URL valid for 5 minutes (300 seconds)
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 });

      logger.info(`Generated upload URL for user ${userId}: ${destinationPath}`);

      return {
        uploadUrl: signedUrl,
        destinationPath: destinationPath,
      };
    } catch (error) {
      logger.error("Error generating signed URL", error);
      throw new HttpsError("internal", "Unable to generate upload URL.");
    }
  }
);

// ==========================================
// 4. HELPERS
// ==========================================

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
