// Script to add logos to all solutions using Clearbit Logo API
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Extract domain from URL
function getDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// Generate Clearbit logo URL from domain
function getLogoUrl(domain) {
  return `https://logo.clearbit.com/${domain}`;
}

async function addLogos() {
  console.log('Fetching all solutions...');

  const records = await base('Solutions')
    .select({ view: 'Grid view' })
    .all();

  console.log(`Found ${records.length} solutions`);
  console.log('');

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of records) {
    const name = record.get('name');
    const websiteUrl = record.get('website_url');
    const existingLogo = record.get('logo_url');

    // Skip if already has a logo
    if (existingLogo) {
      console.log(`⏭ ${name} (already has logo)`);
      skipped++;
      continue;
    }

    const domain = getDomain(websiteUrl);
    if (!domain) {
      console.log(`✗ ${name} - Invalid URL`);
      failed++;
      continue;
    }

    const logoUrl = getLogoUrl(domain);

    try {
      await base('Solutions').update(record.id, {
        logo_url: logoUrl,
      });
      console.log(`✓ ${name} → ${domain}`);
      updated++;
    } catch (e) {
      console.log(`✗ ${name} - ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done! ${updated} updated, ${skipped} skipped, ${failed} failed.`);
}

addLogos();
