// Solution categories (main types of AI solutions)
export type SolutionCategory = 'apps' | 'agents' | 'apis' | 'devices' | 'robots';

// Commission structure (70% to reviewer, 30% to RobotDance)
export const COMMISSION_SPLIT = {
  reviewer: 0.70,
  platform: 0.30,
} as const;

// Trusted reviewer threshold (minimum trust score to get badge)
export const TRUSTED_REVIEWER_THRESHOLD = 7.5;

// Solution from Airtable
export interface Solution {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SolutionCategory;
  website_url: string;
  affiliate_url?: string;  // Optional - not all solutions have affiliate programs
  logo_url: string;
  rds_score: number;
  review_count: number;
  commission_rate?: number; // Percentage the affiliate program pays (e.g., 0.30 for 30%)
  created_at: string;
}

// Review ratings (1-10 scale)
export interface ReviewRatings {
  performance: number;    // 25% weight
  reliability: number;    // 20% weight
  ease_of_use: number;    // 15% weight
  value: number;          // 15% weight
  trust: number;          // 15% weight
  delight: number;        // 10% weight
}

// Review from Airtable
export interface Review extends ReviewRatings {
  id: string;
  solution_id: string;
  user_id: string;
  review_text: string;
  youtube_url?: string;
  created_at: string;
  // Helpful vote stats
  helpful_yes: number;
  helpful_total: number;
  // Joined data
  user?: User;
}

// User from Airtable
export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'github';
  provider_id: string;
  referral_code: string;
  total_clicks: number;
  total_conversions: number;
  pending_earnings: number;  // Earnings awaiting payout
  paid_earnings: number;     // Total earnings paid out
  // Reviewer trust metrics
  trust_score: number;       // Average rating from verified purchasers (1-10)
  trust_rating_count: number; // Number of trust ratings received
  created_at: string;
}

// Helpful vote record (anyone can vote)
export interface HelpfulVote {
  id: string;
  review_id: string;
  voter_id?: string;        // Optional - can be anonymous
  voter_ip?: string;        // For anonymous vote deduplication
  is_helpful: boolean;
  created_at: string;
}

// Trust rating record (verified purchasers only)
export interface TrustRating {
  id: string;
  reviewer_id: string;      // The reviewer being rated
  rater_id: string;         // The verified purchaser giving the rating
  review_id: string;        // Which review prompted this rating
  solution_id: string;      // Which solution they purchased
  rating: number;           // 1-10 scale
  created_at: string;
}

// RDS calculation weights
export const RDS_WEIGHTS = {
  performance: 0.25,
  reliability: 0.20,
  ease_of_use: 0.15,
  value: 0.15,
  trust: 0.15,
  delight: 0.10,
} as const;

// Form data for submitting a review
export interface ReviewFormData extends ReviewRatings {
  solution_id: string;
  review_text: string;
  youtube_url?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Solution with reviews for detail page
export interface SolutionWithReviews extends Solution {
  reviews: Review[];
  rds_breakdown: {
    performance: number;
    reliability: number;
    ease_of_use: number;
    value: number;
    trust: number;
    delight: number;
  };
}

// Search/filter params
export interface SolutionFilters {
  page?: number;
  limit?: number;
  category?: SolutionCategory;
  search?: string;
  sort?: 'rds_score' | 'review_count' | 'created_at';
  order?: 'asc' | 'desc';
}
// Paginated result wrapper
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Session user with referral info
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  referral_code: string;
}

// Tool submission status
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// Tool submission from Airtable
export interface Submission {
  id: string;
  name: string;
  website_url: string;
  description: string;
  category: SolutionCategory;
  submitter_email: string;
  submitter_name?: string;
  status: SubmissionStatus;
  created_at: string;
}

// Form data for submitting a tool
export interface SubmitToolFormData {
  name: string;
  website_url: string;
  description: string;
  category: SolutionCategory;
  submitter_email: string;
  submitter_name?: string;
}
