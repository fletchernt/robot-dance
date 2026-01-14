// Seed script - minimal fields only
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const solutions = [
  { name: "Claude", slug: "claude", website_url: "https://claude.ai", description: "Chat assistant for writing, analysis, and coding." },
  { name: "ChatGPT", slug: "chatgpt", website_url: "https://chat.openai.com", description: "General-purpose AI assistant." },
  { name: "Perplexity", slug: "perplexity", website_url: "https://www.perplexity.ai", description: "Answer engine with citations." },
  { name: "Midjourney", slug: "midjourney", website_url: "https://www.midjourney.com", description: "Text-to-image generation." },
  { name: "ElevenLabs", slug: "elevenlabs", website_url: "https://elevenlabs.io", description: "AI voice generation." },
];

async function seed() {
  console.log('Seeding...');
  for (const s of solutions) {
    try {
      await base('Solutions').create(s);
      console.log('✓', s.name);
    } catch (e) {
      console.log('✗', s.name, '-', e.message);
    }
  }
}
seed();
