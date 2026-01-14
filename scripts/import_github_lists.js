/**
 * GitHub AI Tools List Importer
 *
 * Imports AI tools from popular GitHub awesome lists into Airtable.
 *
 * REQUIRED AIRTABLE FIELDS (add these to your Solutions table):
 * - source (Single line text) - name of the GitHub list
 * - source_url (URL) - link to the GitHub list
 * - imported_at (Date) - when the record was imported
 *
 * Usage: npm run import:github
 */

const Airtable = require('airtable');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load config
const config = require('./import_sources.json');

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Skipped items log
const skippedLogPath = path.join(__dirname, 'import_github_skipped.csv');
let skippedItems = [];

// Stats
const stats = {
  totalFound: 0,
  inserted: 0,
  skipped: 0,
  errors: 0,
};

// ============ UTILITY FUNCTIONS ============

/**
 * Fetch content from URL
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Normalize URL - strip UTM params, trailing slashes, www prefix
 */
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Remove common tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'].forEach(param => {
      parsed.searchParams.delete(param);
    });
    // Build clean URL
    let clean = parsed.origin + parsed.pathname;
    // Remove trailing slash
    clean = clean.replace(/\/$/, '');
    // Lowercase
    return clean.toLowerCase();
  } catch (e) {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Extract domain from URL
 */
function getDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return null;
  }
}

/**
 * Generate slug from name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Check if URL is a GitHub repo (not a product site)
 */
function isGitHubRepo(url) {
  const domain = getDomain(url);
  if (!domain) return false;
  if (domain === 'github.com' || domain === 'raw.githubusercontent.com') {
    // Exception: GitHub pages and releases can be product sites
    if (url.includes('.github.io') || url.includes('/releases')) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Parse markdown content to extract tools
 */
function parseMarkdown(content, sourceName, sourceUrl, defaultCategory) {
  const tools = [];
  const lines = content.split('\n');

  // Regex patterns for markdown links
  // Matches: [Name](url) - description OR [Name](url): description OR just [Name](url)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)(?:\s*[-:–]\s*(.+))?/g;

  for (const line of lines) {
    // Skip header lines, empty lines, badges
    if (line.startsWith('#') || line.trim() === '' || line.includes('badge') || line.includes('shield')) {
      continue;
    }

    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      const name = match[1];
      const url = match[2];
      const description = match[3];

      // Skip invalid URLs
      if (!url.startsWith('http')) continue;

      // Skip GitHub repos if configured
      if (config.settings.skipGitHubRepoLinks && isGitHubRepo(url)) continue;

      // Skip common non-tool links
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('arxiv.org') ||
          lowerUrl.includes('papers.') ||
          lowerUrl.includes('doi.org') ||
          lowerUrl.includes('twitter.com') ||
          lowerUrl.includes('youtube.com') ||
          lowerUrl.includes('linkedin.com') ||
          lowerUrl.includes('discord.') ||
          lowerUrl.includes('slack.com') ||
          lowerUrl.includes('reddit.com') ||
          lowerUrl.includes('medium.com/@') ||
          lowerUrl.includes('wikipedia.org')) {
        continue;
      }

      // Clean up name
      const cleanName = name.trim().replace(/^\*+|\*+$/g, '').replace(/^`|`$/g, '');
      if (cleanName.length < 2 || cleanName.length > 100) continue;

      // Clean up description
      let cleanDesc = description ? description.trim() : '';
      // Remove markdown formatting
      cleanDesc = cleanDesc.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
      // Truncate if too long
      if (cleanDesc.length > 500) cleanDesc = cleanDesc.substring(0, 497) + '...';

      tools.push({
        name: cleanName,
        website_url: normalizeUrl(url),
        description: cleanDesc || ('AI tool from ' + sourceName),
        category: defaultCategory,
        source: sourceName,
        source_url: sourceUrl,
        domain: getDomain(url),
      });
    }

    // Reset regex lastIndex
    linkPattern.lastIndex = 0;
  }

  return tools;
}

/**
 * Get all existing solutions from Airtable
 */
async function getExistingSolutions() {
  const existing = new Map(); // domain -> record
  const existingNames = new Set();

  console.log('Fetching existing solutions from Airtable...');

  const records = await base('Solutions')
    .select({ fields: ['name', 'website_url', 'slug'] })
    .all();

  for (const record of records) {
    const url = record.get('website_url');
    const name = record.get('name');

    if (url) {
      const domain = getDomain(url);
      if (domain) {
        existing.set(domain, record);
      }
    }
    if (name) {
      existingNames.add(name.toLowerCase());
    }
  }

  console.log('Found ' + records.length + ' existing solutions');
  return { byDomain: existing, byName: existingNames };
}

/**
 * Deduplicate tools list
 */
function deduplicateTools(tools) {
  const seen = new Map(); // domain -> tool
  const unique = [];

  for (const tool of tools) {
    if (!tool.domain) continue;

    if (!seen.has(tool.domain)) {
      seen.set(tool.domain, tool);
      unique.push(tool);
    }
  }

  return unique;
}

/**
 * Generate logo URL using Unavatar
 */
function getLogoUrl(domain) {
  return 'https://unavatar.io/' + domain + '?fallback=false';
}

/**
 * Insert tools into Airtable in batches
 */
async function insertTools(tools, existingSolutions) {
  const byDomain = existingSolutions.byDomain;
  const byName = existingSolutions.byName;
  const toInsert = [];

  for (const tool of tools) {
    // Skip if domain already exists
    if (byDomain.has(tool.domain)) {
      skippedItems.push({
        name: tool.name,
        url: tool.website_url,
        reason: 'Domain exists',
        source: tool.source,
      });
      stats.skipped++;
      continue;
    }

    // Skip if name already exists (secondary check)
    if (byName.has(tool.name.toLowerCase())) {
      skippedItems.push({
        name: tool.name,
        url: tool.website_url,
        reason: 'Name exists',
        source: tool.source,
      });
      stats.skipped++;
      continue;
    }

    toInsert.push(tool);
    // Add to sets to prevent duplicates within this batch
    byDomain.set(tool.domain, true);
    byName.add(tool.name.toLowerCase());
  }

  console.log('Inserting ' + toInsert.length + ' new tools...');

  // Insert in batches
  const batchSize = config.settings.batchSize || 10;
  const delay = config.settings.delayBetweenBatches || 1000;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    try {
      const records = batch.map(function(tool) {
        return {
          fields: {
            name: tool.name,
            slug: generateSlug(tool.name),
            website_url: tool.website_url,
            description: tool.description,
            category: tool.category,
            logo_url: getLogoUrl(tool.domain),
            source: tool.source,
            source_url: tool.source_url,
            imported_at: new Date().toISOString().split('T')[0],
            rds_score: 0,
            review_count: 0,
          },
        };
      });

      await base('Solutions').create(records);
      stats.inserted += batch.length;
      console.log('  Inserted batch ' + batchNum + ': ' + batch.length + ' tools');
    } catch (error) {
      console.error('  Error inserting batch: ' + error.message);
      stats.errors += batch.length;

      // Log failed items
      for (const tool of batch) {
        skippedItems.push({
          name: tool.name,
          url: tool.website_url,
          reason: 'Error: ' + error.message,
          source: tool.source,
        });
      }
    }

    // Rate limiting delay
    if (i + batchSize < toInsert.length) {
      await new Promise(function(resolve) { setTimeout(resolve, delay); });
    }
  }
}

/**
 * Write skipped items to CSV
 */
function writeSkippedLog() {
  if (skippedItems.length === 0) return;

  const header = 'name,url,reason,source\n';
  const rows = skippedItems.map(function(item) {
    return '"' + item.name.replace(/"/g, '""') + '","' + item.url + '","' + item.reason + '","' + item.source + '"';
  }).join('\n');

  fs.writeFileSync(skippedLogPath, header + rows);
  console.log('\nSkipped items logged to: ' + skippedLogPath);
}

/**
 * Main import function
 */
async function main() {
  console.log('============================================================');
  console.log('GitHub AI Tools List Importer');
  console.log('============================================================');
  console.log('');

  // Check env vars
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('ERROR: AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables required');
    console.error('Run: export $(grep -v "^#" .env.local | xargs)');
    process.exit(1);
  }

  // Get existing solutions
  const existingSolutions = await getExistingSolutions();

  // Collect all tools from all sources
  let allTools = [];

  for (const source of config.sources) {
    console.log('\nFetching: ' + source.name);
    console.log('  URL: ' + source.url);

    try {
      const content = await fetchUrl(source.url);
      const sourceUrlClean = source.url
        .replace('raw.githubusercontent.com', 'github.com')
        .replace('/master/', '/blob/master/')
        .replace('/main/', '/blob/main/');

      const tools = parseMarkdown(
        content,
        source.name,
        sourceUrlClean,
        source.category || config.settings.defaultCategory
      );

      console.log('  Found: ' + tools.length + ' tools');
      stats.totalFound += tools.length;
      allTools = allTools.concat(tools);
    } catch (error) {
      console.error('  Error fetching ' + source.name + ': ' + error.message);
    }
  }

  // Deduplicate
  console.log('\nTotal tools found: ' + stats.totalFound);
  const uniqueTools = deduplicateTools(allTools);
  console.log('Unique tools (by domain): ' + uniqueTools.length);

  // Insert into Airtable
  await insertTools(uniqueTools, existingSolutions);

  // Write skipped log
  writeSkippedLog();

  // Print summary
  console.log('\n============================================================');
  console.log('IMPORT SUMMARY');
  console.log('============================================================');
  console.log('Total found:      ' + stats.totalFound);
  console.log('Unique by domain: ' + uniqueTools.length);
  console.log('Inserted:         ' + stats.inserted);
  console.log('Skipped (dupes):  ' + stats.skipped);
  console.log('Errors:           ' + stats.errors);
  console.log('============================================================');
}

// Run
main().catch(function(error) {
  console.error('Fatal error:', error);
  process.exit(1);
});
