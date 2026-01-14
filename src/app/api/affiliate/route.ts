import { NextRequest, NextResponse } from 'next/server';
import { getUserByReferralCode, incrementUserClicks } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const affiliateUrl = searchParams.get('url');
  const referralCode = searchParams.get('ref');

  if (!affiliateUrl) {
    return NextResponse.json({ error: 'Missing affiliate URL' }, { status: 400 });
  }

  // Track the click if we have a referral code
  if (referralCode) {
    try {
      const user = await getUserByReferralCode(referralCode);
      if (user) {
        await incrementUserClicks(user.id);
      }
    } catch (error) {
      // Log but don't block the redirect
      console.error('Failed to track affiliate click:', error);
    }
  }

  // Redirect to the affiliate URL
  return NextResponse.redirect(affiliateUrl);
}
