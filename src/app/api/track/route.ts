import { NextRequest, NextResponse } from 'next/server';
import { getUserByReferralCode, getSolutionBySlug, incrementUserClicks } from '@/lib/airtable';
import { buildAffiliateUrl } from '@/lib/referral';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const slug = searchParams.get('slug');

    if (!code || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing code or slug' },
        { status: 400 }
      );
    }

    // Find the user by referral code
    const user = await getUserByReferralCode(code);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Find the solution
    const solution = await getSolutionBySlug(slug);
    if (!solution) {
      return NextResponse.json(
        { success: false, error: 'Solution not found' },
        { status: 404 }
      );
    }

    // Increment user's click count
    await incrementUserClicks(user.id);

    // Build the affiliate URL with tracking params
    const affiliateUrl = solution.affiliate_url
      ? buildAffiliateUrl(solution.affiliate_url, code, slug)
      : solution.website_url;

    return NextResponse.json({
      success: true,
      data: { redirect_url: affiliateUrl },
    });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
