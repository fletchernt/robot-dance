import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { getUserByProviderId, createUser } from './airtable';
import { generateReferralCode } from './referral';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!account || !user.email) return false;

        const provider = account.provider as 'google' | 'github';
        const providerId = account.providerAccountId;

        // Check if user exists
        let existingUser = await getUserByProviderId(provider, providerId);

        // Create user if doesn't exist
        if (!existingUser) {
          const referralCode = generateReferralCode(user.name || user.email);

          existingUser = await createUser({
            email: user.email,
            name: user.name || 'Anonymous',
            provider,
            provider_id: providerId,
            referral_code: referralCode,
          });
        }

        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        // Fetch user from Airtable to get their ID and referral code
        const provider = account.provider as 'google' | 'github';
        const providerId = account.providerAccountId;
        const user = await getUserByProviderId(provider, providerId);

        if (user) {
          token.userId = user.id;
          token.referralCode = user.referral_code;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.userId as string;
        (session.user as { referral_code?: string }).referral_code = token.referralCode as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
