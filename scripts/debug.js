// Debug script to test Airtable connection
const Airtable = require('airtable');

console.log('Environment check:');
console.log('- API Key exists:', !!process.env.AIRTABLE_API_KEY);
console.log('- API Key prefix:', process.env.AIRTABLE_API_KEY?.substring(0, 10) + '...');
console.log('- Base ID:', process.env.AIRTABLE_BASE_ID);
console.log('');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function debug() {
  // Try to list records from Solutions table
  console.log('Testing: List records from "Solutions" table...');
  try {
    const records = await base('Solutions').select({ maxRecords: 1 }).firstPage();
    console.log('✓ Success! Found', records.length, 'records');
  } catch (error) {
    console.log('✗ Failed:', error.message);
    console.log('  Error type:', error.error);
    console.log('');

    // Maybe table is named differently - try Table 1
    console.log('Testing: List records from "Table 1" table...');
    try {
      const records = await base('Table 1').select({ maxRecords: 1 }).firstPage();
      console.log('✓ Success! Table is named "Table 1" - please rename it to "Solutions"');
    } catch (error2) {
      console.log('✗ Failed:', error2.message);
    }
  }
}

debug();
