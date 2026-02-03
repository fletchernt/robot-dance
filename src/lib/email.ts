import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping email send');
    return null;
  }
  return new Resend(apiKey);
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'RobotDance <noreply@robotdance.com>';

export async function sendSubmissionConfirmation(
  to: string,
  toolName: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  try {
    await resend.emails.send({
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
    console.log('[Email] Confirmation sent to:', to);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send confirmation:', error);
    return false;
  }
}
