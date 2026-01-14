import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🤖</span>
              <span className="text-xl font-bold">RobotDance</span>
            </div>
            <p className="text-lg text-gray-300 italic mb-2">
              &ldquo;The robots are coming, let&apos;s dance.&rdquo;™
            </p>
            <p className="text-sm text-gray-400">
              Discover and compare the best AI tools with honest reviews from real users.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/solutions" className="text-gray-400 hover:text-white transition-colors">
                  Browse Solutions
                </Link>
              </li>
              <li>
                <Link href="/solutions?sort=rds_score" className="text-gray-400 hover:text-white transition-colors">
                  Top Rated
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/api/auth/signin" className="text-gray-400 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} RobotDance. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2 sm:mt-0">
            &ldquo;The robots are coming, let&apos;s dance.&rdquo; is a trademark of RobotDance.
          </p>
        </div>
      </div>
    </footer>
  );
}
