import { Resend } from 'resend';
import type { Submission } from '@/types';

// Log env var presence on module load (booleans only, no secrets)
function logEmailConfig() {
  console.log('[Email] Configuration check:', {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '(using default)',
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID,
    AIRTABLE_SUBMISSIONS_TABLE_ID: !!process.env.AIRTABLE_SUBMISSIONS_TABLE_ID,
  });
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping email send');
    return null;
  }
  return new Resend(apiKey);
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'RobotDance <noreply@robotdance.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_SUBMISSIONS_TABLE_ID = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID;

export async function sendSubmissionConfirmation(
  to: string,
  toolName: string
): Promise<boolean> {
  logEmailConfig();

  const resend = getResendClient();
  if (!resend) return false;

  console.log('[Email] Sending confirmation email:', { to, toolName, from: FROM_ADDRESS });

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `We received your submission: ${toolName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thanks for submitting ${toolName}!</h2>
          <p>We've received your submission and our team will review it shortly.</p>
          <p>Once approved, it will appear on <a href="https://robotdance.com">RobotDance</a> for the community to discover and review.</p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">— The RobotDance Team</p>
        </div>
      `,
    });
    console.log('[Email] Confirmation sent successfully:', { to, resendId: result.data?.id, error: result.error });
    return !result.error;
  } catch (error) {
    console.error('[Email] Failed to send confirmation:', {
      to,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

export async function sendAdminSubmissionNotification(
  submission: Submission
): Promise<boolean> {
  logEmailConfig();

  const resend = getResendClient();
  if (!resend) return false;

  if (!ADMIN_EMAIL) {
    console.warn('[Email] ADMIN_EMAIL not configured — skipping admin notification');
    return false;
  }

  console.log('[Email] Sending admin notification:', {
    submissionId: submission.id,
    submissionName: submission.name,
    to: ADMIN_EMAIL,
    from: FROM_ADDRESS,
  });

  const airtableUrl = AIRTABLE_BASE_ID && AIRTABLE_SUBMISSIONS_TABLE_ID
    ? `https://airtable.com/${AIRTABLE_BASE_ID}/${AIRTABLE_SUBMISSIONS_TABLE_ID}/${submission.id}`
    : null;

  const categoryLabels: Record<string, string> = {
    apps: 'App',
    agents: 'Agent',
    apis: 'API',
    devices: 'Device',
    robots: 'Robot',
  };

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `New submission: ${submission.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Tool Submission</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 120px;">Tool Name</td>
              <td style="padding: 8px 0; font-weight: 600;">${submission.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Website</td>
              <td style="padding: 8px 0;"><a href="${submission.website_url}" style="color: #0ea5e9;">${submission.website_url}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Category</td>
              <td style="padding: 8px 0;">${categoryLabels[submission.category] || submission.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Submitter</td>
              <td style="padding: 8px 0;">${submission.submitter_name || 'Anonymous'} &lt;${submission.submitter_email}&gt;</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Description</td>
              <td style="padding: 8px 0;">${submission.description}</td>
            </tr>
          </table>

          ${airtableUrl ? `
          <p style="margin-top: 24px;">
            <a href="${airtableUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Review in Airtable</a>
          </p>
          ` : ''}

          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            Submitted at ${new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('[Email] Resend API returned error:', {
        submissionId: submission.id,
        error: result.error,
      });
      return false;
    }

    console.log('[Email] Admin notification sent successfully:', {
      submissionId: submission.id,
      resendId: result.data?.id,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send admin notification:', {
      submissionId: submission.id,
      to: ADMIN_EMAIL,
      from: FROM_ADDRESS,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}
