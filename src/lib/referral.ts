/**
 * Generate a unique referral code from user name
 * Format: lowercase name + random 4 digits
 */
export function generateReferralCode(name: string): string {
  // Clean the name: lowercase, remove spaces and special chars
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);

  // Add random digits for uniqueness
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${cleanName}${randomDigits}`;
}

/**
 * Generate a referral link for a specific solution
 */
export function generateReferralLink(
  referralCode: string,
  solutionSlug: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'https://robotdance.com';
  return `${base}/r/${referralCode}/${solutionSlug}`;
}

/**
 * Build affiliate URL with tracking parameters
 * Adds sub-ID for conversion tracking
 */
export function buildAffiliateUrl(
  baseAffiliateUrl: string,
  referralCode: string,
  solutionSlug: string
): string {
  const url = new URL(baseAffiliateUrl);

  // Common affiliate network parameters
  // Impact: subId1, subId2
  // ShareASale: afftrack
  // We'll add both for compatibility
  url.searchParams.set('subId1', referralCode);
  url.searchParams.set('subId2', solutionSlug);
  url.searchParams.set('afftrack', `${referralCode}_${solutionSlug}`);

  return url.toString();
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Must be alphanumeric, 5-20 chars
  return /^[a-z0-9]{5,20}$/.test(code);
}
