import { NextRequest, NextResponse } from 'next/server';
import { getUserByReferralCode, getSolutionBySlug, incrementUserClicks } from '@/lib/airtable';
import { buildAffiliateUrl } from '@/lib/referral';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; slug: string }> }
) {
  try {
    const { code, slug } = await params;

    // Find the user by referral code
    const user = await getUserByReferralCode(code);
    if (!user) {
      // Redirect to solution page without tracking if invalid code
      return NextResponse.redirect(new URL(`/solutions/${slug}`, request.url));
    }

    // Find the solution
    const solution = await getSolutionBySlug(slug);
    if (!solution) {
      // Redirect to homepage if solution not found
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment user's click count
    await incrementUserClicks(user.id);

    // Build the affiliate URL with tracking params
    if (solution.affiliate_url) {
      const affiliateUrl = buildAffiliateUrl(solution.affiliate_url, code, slug);
      return NextResponse.redirect(affiliateUrl);
    }

    // If no affiliate URL, redirect to the solution's website
    if (solution.website_url) {
      return NextResponse.redirect(solution.website_url);
    }

    // Fallback: redirect to solution detail page
    return NextResponse.redirect(new URL(`/solutions/${slug}`, request.url));
  } catch (error) {
    console.error('Referral redirect error:', error);
    // On error, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  }
}
