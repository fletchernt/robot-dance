// Update logos using Unavatar (aggregates Clearbit, Google, etc.)
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

// Use Unavatar - aggregates logos from multiple sources
function getLogoUrl(domain) {
  return `https://unavatar.io/${domain}?fallback=false`;
}

async function updateLogos() {
  console.log('Fetching all solutions...');

  const records = await base('Solutions')
    .select({ view: 'Grid view' })
    .all();

  console.log(`Found ${records.length} solutions`);
  console.log('');

  let updated = 0;
  let failed = 0;

  for (const record of records) {
    const name = record.get('name');
    const websiteUrl = record.get('website_url');

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
      console.log(`✓ ${name}`);
      updated++;
    } catch (e) {
      console.log(`✗ ${name} - ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done! ${updated} updated, ${failed} failed.`);
}

updateLogos();
