import Airtable from 'airtable';
import type { Solution, Review, User, SolutionFilters, ReviewFormData, Submission, SubmitToolFormData, PaginatedResult } from '@/types';
import { calculateRDS, calculateAverageRatings } from './rds';

// Lazy initialization to avoid build-time errors
function getBase() {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    throw new Error('Airtable configuration missing. Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
}

// Table accessors
function getSolutionsTable() {
  return getBase()('Solutions');
}

function getReviewsTable() {
  return getBase()('Reviews');
}

function getUsersTable() {
  return getBase()('Users');
}

function getTrustRatingsTable() {
  return getBase()('TrustRatings');
}

// Helper to convert Airtable record to Solution
function recordToSolution(record: Airtable.Record<Airtable.FieldSet>): Solution {
  return {
    id: record.id,
    name: record.get('name') as string,
    slug: record.get('slug') as string,
    description: record.get('description') as string,
    category: record.get('category') as Solution['category'],
    website_url: record.get('website_url') as string,
    affiliate_url: (record.get('affiliate_url') as string) || undefined,
    logo_url: record.get('logo_url') as string,
    rds_score: (record.get('rds_score') as number) || 0,
    review_count: (record.get('review_count') as number) || 0,
    commission_rate: (record.get('commission_rate') as number) || undefined,
    current_version: (record.get('current_version') as string) || undefined,
    created_at: (record.get('created_at') || record.get('Created') || new Date().toISOString()) as string,
  };
}

// Helper to convert Airtable record to Review
function recordToReview(record: Airtable.Record<Airtable.FieldSet>): Review {
  return {
    id: record.id,
    solution_id: (record.get('solution_id') as string[])?.[0] || '',
    user_id: (record.get('user_id') as string[])?.[0] || '',
    performance: record.get('performance') as number,
    reliability: record.get('reliability') as number,
    ease_of_use: record.get('ease_of_use') as number,
    value: record.get('value') as number,
    trust: record.get('trust') as number,
    delight: record.get('delight') as number,
    review_text: record.get('review_text') as string,
    youtube_url: record.get('youtube_url') as string | undefined,
    version: record.get('version') as string | undefined,
    helpful_yes: (record.get('helpful_yes') as number) || 0,
    helpful_total: (record.get('helpful_total') as number) || 0,
    created_at: (record.get('created_at') || record.get('Created') || new Date().toISOString()) as string,
  };
}

// Helper to convert Airtable record to User
function recordToUser(record: Airtable.Record<Airtable.FieldSet>): User {
  return {
    id: record.id,
    email: record.get('email') as string,
    name: record.get('name') as string,
    provider: record.get('provider') as 'google' | 'github',
    provider_id: record.get('provider_id') as string,
    referral_code: record.get('referral_code') as string,
    total_clicks: (record.get('total_clicks') as number) || 0,
    total_conversions: (record.get('total_conversions') as number) || 0,
    pending_earnings: (record.get('pending_earnings') as number) || 0,
    paid_earnings: (record.get('paid_earnings') as number) || 0,
    trust_score: (record.get('trust_score') as number) || 0,
    trust_rating_count: (record.get('trust_rating_count') as number) || 0,
    created_at: (record.get('created_at') || record.get('Created') || new Date().toISOString()) as string,
  };
}

// ============ SOLUTIONS ============

export async function getSolutions(filters?: SolutionFilters): Promise<Solution[]> {
  const filterFormulas: string[] = [];

  if (filters?.category) {
    filterFormulas.push(`{category} = '${filters.category}'`);
  }

  if (filters?.search) {
    filterFormulas.push(`SEARCH(LOWER('${filters.search}'), LOWER({name}))`);
  }

  const formula = filterFormulas.length > 0
    ? `AND(${filterFormulas.join(', ')})`
    : '';

  const sortField = filters?.sort || 'rds_score';
  const sortDirection = filters?.order === 'asc' ? 'asc' : 'desc';

  const records = await getSolutionsTable()
    .select({
      filterByFormula: formula,
      sort: [{ field: sortField, direction: sortDirection }],
    })
    .all();

  return records.map(recordToSolution);
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const records = await getSolutionsTable()
    .select({
      filterByFormula: `{slug} = '${slug}'`,
      maxRecords: 1,
    })
    .all();

  return records.length > 0 ? recordToSolution(records[0]) : null;
}

export async function getSolutionById(id: string): Promise<Solution | null> {
  try {
    const record = await getSolutionsTable().find(id);
    return recordToSolution(record);
  } catch {
    return null;
  }
}

export async function updateSolutionRDS(
  solutionId: string,
  rdsScore: number,
  reviewCount: number
): Promise<void> {
  await getSolutionsTable().update(solutionId, {
    rds_score: rdsScore,
    review_count: reviewCount,
  });
}

// ============ REVIEWS ============

export async function getReviewsForSolution(solutionId: string): Promise<Review[]> {
  // For linked record fields, we need to fetch all and filter manually
  // since Airtable's filterByFormula doesn't easily search by record ID in linked fields
  const records = await getReviewsTable()
    .select({
      sort: [{ field: 'created_at', direction: 'desc' }],
    })
    .all();

  const filtered = records.filter(record => {
    const linkedIds = record.get('solution_id') as string[] | undefined;
    return linkedIds?.includes(solutionId);
  });

  return filtered.map(recordToReview);
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  // For linked record fields, we need to fetch all and filter manually
  const records = await getReviewsTable()
    .select({
      sort: [{ field: 'created_at', direction: 'desc' }],
    })
    .all();

  const filtered = records.filter(record => {
    const linkedIds = record.get('user_id') as string[] | undefined;
    return linkedIds?.includes(userId);
  });

  return filtered.map(recordToReview);
}

export async function createReview(
  data: ReviewFormData,
  userId: string
): Promise<Review> {
  const record = await getReviewsTable().create({
    solution_id: [data.solution_id],
    user_id: [userId],
    performance: data.performance,
    reliability: data.reliability,
    ease_of_use: data.ease_of_use,
    value: data.value,
    trust: data.trust,
    delight: data.delight,
    review_text: data.review_text,
    youtube_url: data.youtube_url || undefined,
    version: data.version || undefined,
    // created_at is auto-generated by Airtable
  });

  // Recalculate RDS for the solution
  const allReviews = await getReviewsForSolution(data.solution_id);
  const averages = calculateAverageRatings(allReviews);
  const newRDS = calculateRDS(averages);

  await updateSolutionRDS(data.solution_id, newRDS, allReviews.length);

  return recordToReview(record);
}

// ============ USERS ============

export async function getUserByEmail(email: string): Promise<User | null> {
  const records = await getUsersTable()
    .select({
      filterByFormula: `{email} = '${email}'`,
      maxRecords: 1,
    })
    .all();

  return records.length > 0 ? recordToUser(records[0]) : null;
}

export async function getUserByProviderId(
  provider: string,
  providerId: string
): Promise<User | null> {
  const records = await getUsersTable()
    .select({
      filterByFormula: `AND({provider} = '${provider}', {provider_id} = '${providerId}')`,
      maxRecords: 1,
    })
    .all();

  return records.length > 0 ? recordToUser(records[0]) : null;
}

export async function getUserByReferralCode(code: string): Promise<User | null> {
  const records = await getUsersTable()
    .select({
      filterByFormula: `{referral_code} = '${code}'`,
      maxRecords: 1,
    })
    .all();

  return records.length > 0 ? recordToUser(records[0]) : null;
}

export async function createUser(data: {
  email: string;
  name: string;
  provider: 'google' | 'github';
  provider_id: string;
  referral_code: string;
}): Promise<User> {
  const record = await getUsersTable().create({
    email: data.email,
    name: data.name,
    provider: data.provider,
    provider_id: data.provider_id,
    referral_code: data.referral_code,
    total_clicks: 0,
    total_conversions: 0,
    pending_earnings: 0,
    // created_at is auto-generated by Airtable
  });

  return recordToUser(record);
}

export async function incrementUserClicks(userId: string): Promise<void> {
  const user = await getUsersTable().find(userId);
  const currentClicks = (user.get('total_clicks') as number) || 0;

  await getUsersTable().update(userId, {
    total_clicks: currentClicks + 1,
  });
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const record = await getUsersTable().find(id);
    return recordToUser(record);
  } catch {
    return null;
  }
}

// ============ REVIEW FEEDBACK ============

export async function updateReviewHelpful(
  reviewId: string,
  isHelpful: boolean
): Promise<void> {
  const record = await getReviewsTable().find(reviewId);
  const currentYes = (record.get('helpful_yes') as number) || 0;
  const currentTotal = (record.get('helpful_total') as number) || 0;

  await getReviewsTable().update(reviewId, {
    helpful_yes: isHelpful ? currentYes + 1 : currentYes,
    helpful_total: currentTotal + 1,
  });
}

export async function updateUserTrustScore(
  userId: string,
  newRating: number
): Promise<void> {
  const user = await getUsersTable().find(userId);
  const currentScore = (user.get('trust_score') as number) || 0;
  const currentCount = (user.get('trust_rating_count') as number) || 0;

  // Calculate new average
  const newCount = currentCount + 1;
  const newScore = ((currentScore * currentCount) + newRating) / newCount;

  await getUsersTable().update(userId, {
    trust_score: Math.round(newScore * 10) / 10, // Round to 1 decimal
    trust_rating_count: newCount,
  });
}

export async function getReviewById(id: string): Promise<Review | null> {
  try {
    const record = await getReviewsTable().find(id);
    return recordToReview(record);
  } catch {
    return null;
  }
}

// Check if user has already submitted a trust rating for a specific review
export async function hasUserRatedReview(
  raterId: string,
  reviewId: string
): Promise<boolean> {
  try {
    const records = await getTrustRatingsTable()
      .select({
        filterByFormula: `AND({rater_id} = '${raterId}', {review_id} = '${reviewId}')`,
        maxRecords: 1,
      })
      .all();
    return records.length > 0;
  } catch {
    return false;
  }
}

// Create a trust rating record
export async function createTrustRating(
  raterId: string,
  reviewerId: string,
  reviewId: string,
  rating: number
): Promise<void> {
  await getTrustRatingsTable().create({
    rater_id: raterId,
    reviewer_id: reviewerId,
    review_id: reviewId,
    rating: rating,
  });
}

// Get all reviews a user has already rated
export async function getUserRatedReviewIds(raterId: string): Promise<string[]> {
  try {
    const records = await getTrustRatingsTable()
      .select({
        filterByFormula: `{rater_id} = '${raterId}'`,
      })
      .all();
    return records.map(r => r.get('review_id') as string);
  } catch {
    return [];
  }
}

// ============ SUBMISSIONS ============

function getSubmissionsTable() {
  return getBase()('Submissions');
}

// Helper to convert Airtable record to Submission
function recordToSubmission(record: Airtable.Record<Airtable.FieldSet>): Submission {
  // Normalize status to lowercase for consistent handling
  const rawStatus = (record.get('status') as string) || 'pending';
  const status = rawStatus.toLowerCase() as Submission['status'];

  return {
    id: record.id,
    name: record.get('name') as string,
    website_url: record.get('website_url') as string,
    description: record.get('description') as string,
    category: record.get('category') as Submission['category'],
    submitter_email: record.get('submitter_email') as string,
    submitter_name: record.get('submitter_name') as string | undefined,
    status,
    published_at: record.get('published_at') as string | undefined,
    created_at: (record.get('created_at') || record.get('Created') || new Date().toISOString()) as string,
  };
}

export async function createSubmission(data: SubmitToolFormData): Promise<Submission> {
  // Build fields object, omitting empty optional fields to avoid Airtable SDK issues
  const fields: Record<string, string> = {
    name: data.name.trim(),
    website_url: data.website_url.trim(),
    description: data.description.trim(),
    category: data.category,
    submitter_email: data.submitter_email.trim(),
    status: 'pending',
  };

  if (data.submitter_name && data.submitter_name.trim()) {
    fields.submitter_name = data.submitter_name.trim();
  }

  console.log('[Submissions] Creating record with fields:', {
    name: fields.name,
    website_url: fields.website_url,
    category: fields.category,
    submitter_email: fields.submitter_email,
  });

  try {
    const record = await getSubmissionsTable().create(fields);
    console.log('[Submissions] Record created successfully:', record.id);
    return recordToSubmission(record);
  } catch (error) {
    console.error('[Submissions] Airtable create failed:', error);
    throw error;
  }
}

export async function getSubmissionByUrl(url: string): Promise<Submission | null> {
  try {
    // Normalize URL: strip protocol, trailing slash, lowercase
    const normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
    // Escape double quotes in URL to prevent formula injection
    const safeUrl = normalizedUrl.replace(/"/g, '\\"');

    const formula = `LOWER(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({website_url}, "https://", ""), "http://", ""), "/", "")) = "${safeUrl.replace(/\//g, '')}"`;

    const records = await getSubmissionsTable()
      .select({
        filterByFormula: formula,
        maxRecords: 1,
      })
      .all();

    return records.length > 0 ? recordToSubmission(records[0]) : null;
  } catch (error) {
    console.error('[Submissions] getSubmissionByUrl failed:', error);
    // Don't block submission on lookup failure - just allow it through
    return null;
  }
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  try {
    console.log('[Submissions] Fetching submission by ID:', id);
    const record = await getSubmissionsTable().find(id);
    return recordToSubmission(record);
  } catch (error) {
    console.error('[Submissions] getSubmissionById failed:', error);
    return null;
  }
}

export async function markSubmissionPublished(id: string): Promise<boolean> {
  const publishedAt = new Date().toISOString();
  console.log('[Submissions] Marking submission as published:', id);
  try {
    await getSubmissionsTable().update(id, {
      published_at: publishedAt,
    });
    console.log('[Submissions] Submission marked as published at:', publishedAt);
    return true;
  } catch (error) {
    // Field may not exist in Airtable - log warning but don't fail
    console.warn('[Submissions] Could not set published_at (field may not exist):', error);
    return false;
  }
}

// ============ PUBLISH SUBMISSION TO SOLUTIONS ============

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createSolutionFromSubmission(submission: Submission): Promise<Solution> {
  const slug = generateSlug(submission.name);

  // Check if solution with this slug already exists
  const existing = await getSolutionBySlug(slug);
  if (existing) {
    throw new Error(`Solution with slug "${slug}" already exists`);
  }

  console.log('[Solutions] Creating solution from submission:', {
    name: submission.name,
    slug,
    category: submission.category,
    website_url: submission.website_url,
  });

  const fields: Record<string, string | number> = {
    name: submission.name,
    slug,
    description: submission.description,
    category: submission.category,
    website_url: submission.website_url,
    rds_score: 0,
    review_count: 0,
  };

  try {
    const record = await getSolutionsTable().create(fields);
    console.log('[Solutions] Solution created successfully:', record.id);
    return recordToSolution(record);
  } catch (error) {
    console.error('[Solutions] Failed to create solution:', error);
    throw error;
  }
}


// ============ PAGINATED SOLUTIONS ============

export async function getSolutionsPaginated(
  filters?: SolutionFilters
): Promise<PaginatedResult<Solution>> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 24;

  const filterFormulas: string[] = [];

  if (filters?.category) {
    filterFormulas.push(`{category} = '${filters.category}'`);
  }

  if (filters?.search) {
    filterFormulas.push(`SEARCH(LOWER('${filters.search}'), LOWER({name}))`);
  }

  const formula = filterFormulas.length > 0
    ? `AND(${filterFormulas.join(', ')})`
    : '';

  const sortField = filters?.sort || 'rds_score';
  const sortDirection = filters?.order === 'asc' ? 'asc' : 'desc';

  const records = await getSolutionsTable()
    .select({
      filterByFormula: formula,
      sort: [{ field: sortField, direction: sortDirection }],
    })
    .all();

  const total = records.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const pageRecords = records.slice(startIndex, endIndex);

  return {
    data: pageRecords.map(recordToSolution),
    total,
    page,
    limit,
    totalPages,
  };
}
