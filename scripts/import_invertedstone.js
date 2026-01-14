/**
 * Inverted Stone AI Tools Database Importer
 *
 * Imports AI tools from the Inverted Stone JSON database into Airtable.
 *
 * Usage: npm run import:invertedstone
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// Config
const JSON_PATH = path.join(__dirname, '..', '..', '3,600+ AI Tools List - InvertedStone.json');
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1000;

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Skipped items log
const skippedLogPath = path.join(__dirname, 'import_invertedstone_skipped.csv');
let skippedItems = [];

// Stats
const stats = {
  totalInFile: 0,
  inserted: 0,
  skipped: 0,
  errors: 0,
};

// Category mapping from Inverted Stone categories to our categories
const categoryMapping = {
  // Apps (default for most)
  'Art and Creative Tools': 'apps',
  'AI Experiments': 'apps',
  'Data Analysis and Summarization': 'apps',
  'Educational Assistants': 'apps',
  'Customer Support Tools': 'apps',
  'Sales and Marketing Assistants': 'apps',
  'Health and Fitness Tools': 'apps',
  'Email Assistants': 'apps',
  'Language Tools': 'apps',
  'Image Generation and Editing': 'apps',
  'Audio Editing': 'apps',
  'Research Tools': 'apps',
  'Content Moderation': 'apps',
  'Speech Tools': 'apps',
  'Virtual Assistants': 'apps',
  'Finance and Accounting Tools': 'apps',
  'Design Assistance': 'apps',
  'Search Engines': 'apps',
  'SEO Tools': 'apps',
  'Mental Wellness': 'apps',
  'Fun and Experimental Tools': 'apps',
  'General Writing': 'apps',
  'Memory and Productivity Tools': 'apps',
  'Travel Assistance': 'apps',
  'Productivity Tools': 'apps',
  'Recruitment Tools': 'apps',
  'E-commerce Solutions': 'apps',
  'Legal Assistants': 'apps',
  'Language Learning': 'apps',
  'Presentation Tools': 'apps',
  'Video Generation and Editing': 'apps',
  'Idea Generation and Prompts': 'apps',
  'Real Estate Tools': 'apps',
  'Learning and Training Tools': 'apps',
  'Avatars and Virtual Characters': 'apps',
  'Gift': 'apps',
  'Spreadsheet and SQL Tools': 'apps',
  'Gaming Tools': 'apps',
  'Religion and Spirituality Tools': 'apps',
  'Parenting': 'apps',
  'Telemedicine': 'apps',
  'Crafting': 'apps',
  'Budgeting': 'apps',
  'Music Creation': 'apps',
  'Astrology': 'apps',
  'Fashion Tools': 'apps',
  'Event Planning': 'apps',
  'Meeting Productivity Tools': 'apps',
  'Project Management': 'apps',
  'Pet Care': 'apps',

  // APIs / Developer Tools
  'Developer Tools': 'apis',
  'Code Assistants': 'apis',
  'Low-code/No-code Solutions': 'apis',

  // Agents
  // (None directly map, but we could add some later)
};

/**
 * Get category for a tool
 */
function getCategory(firstCategory) {
  return categoryMapping[firstCategory] || 'apps';
}

/**
 * Normalize URL
 */
function normalizeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let clean = parsed.origin + parsed.pathname;
    clean = clean.replace(/\/$/, '');
    return clean.toLowerCase();
  } catch (e) {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Extract domain from URL
 */
function getDomain(url) {
  if (!url) return null;
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
 * Generate logo URL using Unavatar
 */
function getLogoUrl(domain) {
  return 'https://unavatar.io/' + domain + '?fallback=false';
}

/**
 * Check if URL is valid (not app store, etc.)
 */
function isValidUrl(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();

  // Skip app store links, generic URLs
  if (lowerUrl.includes('apps.apple.com/app/') ||
      lowerUrl.includes('play.google.com') ||
      lowerUrl === 'https://apps.apple.com/app/' ||
      lowerUrl.includes('chrome.google.com/webstore') ||
      lowerUrl.includes('addons.mozilla.org')) {
    return false;
  }

  return true;
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
 * Insert tools into Airtable in batches
 */
async function insertTools(tools, existingSolutions) {
  const byDomain = existingSolutions.byDomain;
  const byName = existingSolutions.byName;
  const toInsert = [];

  for (const tool of tools) {
    const domain = getDomain(tool.URL);

    // Skip invalid URLs
    if (!isValidUrl(tool.URL) || !domain) {
      skippedItems.push({
        name: tool.Name,
        url: tool.URL || '',
        reason: 'Invalid URL',
      });
      stats.skipped++;
      continue;
    }

    // Skip if domain already exists
    if (byDomain.has(domain)) {
      skippedItems.push({
        name: tool.Name,
        url: tool.URL,
        reason: 'Domain exists',
      });
      stats.skipped++;
      continue;
    }

    // Skip if name already exists
    if (byName.has(tool.Name.toLowerCase())) {
      skippedItems.push({
        name: tool.Name,
        url: tool.URL,
        reason: 'Name exists',
      });
      stats.skipped++;
      continue;
    }

    toInsert.push({
      name: tool.Name,
      url: normalizeUrl(tool.URL),
      description: tool.Description || '',
      category: getCategory(tool.FirstCategory),
      domain: domain,
      originalCategory: tool.FirstCategory,
    });

    // Add to sets to prevent duplicates within this import
    byDomain.set(domain, true);
    byName.add(tool.Name.toLowerCase());
  }

  console.log('Inserting ' + toInsert.length + ' new tools...');

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toInsert.length / BATCH_SIZE);

    try {
      const records = batch.map(function(tool) {
        return {
          fields: {
            name: tool.name,
            slug: generateSlug(tool.name),
            website_url: tool.url,
            description: tool.description,
            category: tool.category,
            logo_url: getLogoUrl(tool.domain),
            source: 'InvertedStone',
            source_url: 'https://invertedstone.com/store/ai-tools-list',
            imported_at: new Date().toISOString().split('T')[0],
            rds_score: 0,
            review_count: 0,
          },
        };
      });

      await base('Solutions').create(records);
      stats.inserted += batch.length;

      // Progress indicator
      if (batchNum % 10 === 0 || batchNum === totalBatches) {
        const pct = Math.round((i + batch.length) / toInsert.length * 100);
        console.log('  Progress: ' + (i + batch.length) + '/' + toInsert.length + ' (' + pct + '%)');
      }
    } catch (error) {
      console.error('  Error inserting batch ' + batchNum + ': ' + error.message);
      stats.errors += batch.length;

      for (const tool of batch) {
        skippedItems.push({
          name: tool.name,
          url: tool.url,
          reason: 'Error: ' + error.message,
        });
      }
    }

    // Rate limiting delay
    if (i + BATCH_SIZE < toInsert.length) {
      await new Promise(function(resolve) { setTimeout(resolve, DELAY_BETWEEN_BATCHES); });
    }
  }
}

/**
 * Write skipped items to CSV
 */
function writeSkippedLog() {
  if (skippedItems.length === 0) return;

  const header = 'name,url,reason\n';
  const rows = skippedItems.map(function(item) {
    return '"' + (item.name || '').replace(/"/g, '""') + '","' + (item.url || '') + '","' + item.reason + '"';
  }).join('\n');

  fs.writeFileSync(skippedLogPath, header + rows);
  console.log('\nSkipped items logged to: ' + skippedLogPath);
}

/**
 * Main import function
 */
async function main() {
  console.log('============================================================');
  console.log('Inverted Stone AI Tools Database Importer');
  console.log('============================================================');
  console.log('');

  // Check env vars
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('ERROR: AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables required');
    process.exit(1);
  }

  // Check if file exists
  if (!fs.existsSync(JSON_PATH)) {
    console.error('ERROR: JSON file not found at: ' + JSON_PATH);
    console.error('Expected file: "3,600+ AI Tools List - InvertedStone.json"');
    process.exit(1);
  }

  // Load JSON
  console.log('Loading JSON file...');
  const rawData = fs.readFileSync(JSON_PATH, 'utf8');
  const tools = JSON.parse(rawData);
  stats.totalInFile = tools.length;
  console.log('Loaded ' + tools.length + ' tools from file');

  // Get existing solutions
  const existingSolutions = await getExistingSolutions();

  // Insert tools
  await insertTools(tools, existingSolutions);

  // Write skipped log
  writeSkippedLog();

  // Print summary
  console.log('\n============================================================');
  console.log('IMPORT SUMMARY');
  console.log('============================================================');
  console.log('Total in file:    ' + stats.totalInFile);
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
