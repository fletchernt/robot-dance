// Expanded seed script with 150+ AI solutions
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const solutions = [
  // ============ APPS - Chat & Assistants ============
  { name: "Claude", slug: "claude", category: "apps", website_url: "https://claude.ai", description: "Anthropic's AI assistant for writing, analysis, coding, and thoughtful conversation." },
  { name: "ChatGPT", slug: "chatgpt", category: "apps", website_url: "https://chat.openai.com", description: "OpenAI's conversational AI for general-purpose assistance and creative tasks." },
  { name: "Gemini", slug: "gemini", category: "apps", website_url: "https://gemini.google.com", description: "Google's multimodal AI assistant integrated with Google services." },
  { name: "Copilot", slug: "copilot", category: "apps", website_url: "https://copilot.microsoft.com", description: "Microsoft's AI assistant powered by GPT-4, integrated with Microsoft 365." },
  { name: "Perplexity", slug: "perplexity", category: "apps", website_url: "https://www.perplexity.ai", description: "AI-powered answer engine with real-time web search and citations." },
  { name: "Poe", slug: "poe", category: "apps", website_url: "https://poe.com", description: "Platform to chat with multiple AI models including Claude, GPT-4, and more." },
  { name: "Character.AI", slug: "character-ai", category: "apps", website_url: "https://character.ai", description: "Create and chat with AI characters for entertainment and roleplay." },
  { name: "Pi", slug: "pi", category: "apps", website_url: "https://pi.ai", description: "Inflection AI's personal intelligence assistant focused on emotional support." },
  { name: "You.com", slug: "you-com", category: "apps", website_url: "https://you.com", description: "AI search engine with chat capabilities and personalized results." },
  { name: "Phind", slug: "phind", category: "apps", website_url: "https://www.phind.com", description: "AI search engine optimized for developers and technical questions." },
  { name: "Khanmigo", slug: "khanmigo", category: "apps", website_url: "https://www.khanacademy.org/khan-labs", description: "Khan Academy's AI tutor for personalized learning experiences." },
  { name: "Jasper Chat", slug: "jasper-chat", category: "apps", website_url: "https://www.jasper.ai", description: "AI chat assistant focused on marketing and business content creation." },
  { name: "HuggingChat", slug: "huggingchat", category: "apps", website_url: "https://huggingface.co/chat", description: "Open-source AI chat powered by various open models on Hugging Face." },

  // ============ APPS - Image Generation ============
  { name: "Midjourney", slug: "midjourney", category: "apps", website_url: "https://www.midjourney.com", description: "Premium AI art generator known for stunning, artistic image creation." },
  { name: "DALL-E 3", slug: "dall-e-3", category: "apps", website_url: "https://openai.com/dall-e-3", description: "OpenAI's latest image generator with improved prompt understanding." },
  { name: "Stable Diffusion", slug: "stable-diffusion", category: "apps", website_url: "https://stability.ai", description: "Open-source image generation model with extensive customization options." },
  { name: "Leonardo.AI", slug: "leonardo-ai", category: "apps", website_url: "https://leonardo.ai", description: "AI image generator focused on game assets and creative production." },
  { name: "Ideogram", slug: "ideogram", category: "apps", website_url: "https://ideogram.ai", description: "AI image generator with exceptional text rendering capabilities." },
  { name: "Adobe Firefly", slug: "adobe-firefly", category: "apps", website_url: "https://www.adobe.com/products/firefly.html", description: "Adobe's generative AI integrated into Creative Cloud applications." },
  { name: "Canva AI", slug: "canva-ai", category: "apps", website_url: "https://www.canva.com/ai-image-generator", description: "AI image generation built into Canva's design platform." },
  { name: "NightCafe", slug: "nightcafe", category: "apps", website_url: "https://nightcafe.studio", description: "AI art generator with multiple algorithms and social features." },
  { name: "Playground AI", slug: "playground-ai", category: "apps", website_url: "https://playground.com", description: "Free AI image generator with mixed image editing capabilities." },
  { name: "Lexica", slug: "lexica", category: "apps", website_url: "https://lexica.art", description: "AI image search and generation with Stable Diffusion." },
  { name: "DreamStudio", slug: "dreamstudio", category: "apps", website_url: "https://dreamstudio.ai", description: "Stability AI's official interface for Stable Diffusion models." },
  { name: "Craiyon", slug: "craiyon", category: "apps", website_url: "https://www.craiyon.com", description: "Free AI image generator formerly known as DALL-E Mini." },
  { name: "BlueWillow", slug: "bluewillow", category: "apps", website_url: "https://www.bluewillow.ai", description: "Free AI art generator accessible via Discord." },
  { name: "Imagen", slug: "imagen", category: "apps", website_url: "https://imagen.research.google", description: "Google's text-to-image diffusion model with photorealistic outputs." },
  { name: "Flux", slug: "flux", category: "apps", website_url: "https://flux.ai", description: "Black Forest Labs' high-quality open image generation model." },

  // ============ APPS - Video Generation ============
  { name: "Runway", slug: "runway", category: "apps", website_url: "https://runwayml.com", description: "AI-powered video editing and generation with Gen-2 model." },
  { name: "Pika", slug: "pika", category: "apps", website_url: "https://pika.art", description: "AI video generator for creating and editing short video clips." },
  { name: "Synthesia", slug: "synthesia", category: "apps", website_url: "https://www.synthesia.io", description: "AI video creation platform with realistic avatar presenters." },
  { name: "HeyGen", slug: "heygen", category: "apps", website_url: "https://www.heygen.com", description: "AI video generator with customizable avatars and voice cloning." },
  { name: "D-ID", slug: "d-id", category: "apps", website_url: "https://www.d-id.com", description: "AI-powered talking avatar videos from photos and text." },
  { name: "Luma AI", slug: "luma-ai", category: "apps", website_url: "https://lumalabs.ai", description: "AI video and 3D capture technology for immersive content." },
  { name: "Kaiber", slug: "kaiber", category: "apps", website_url: "https://kaiber.ai", description: "AI video generation platform for music videos and animations." },
  { name: "Descript", slug: "descript", category: "apps", website_url: "https://www.descript.com", description: "AI-powered video and podcast editing with transcription." },
  { name: "Pictory", slug: "pictory", category: "apps", website_url: "https://pictory.ai", description: "AI video creation from long-form content and scripts." },
  { name: "InVideo AI", slug: "invideo-ai", category: "apps", website_url: "https://invideo.io", description: "AI-powered video creation with templates and automation." },
  { name: "Sora", slug: "sora", category: "apps", website_url: "https://openai.com/sora", description: "OpenAI's text-to-video model generating realistic scenes." },
  { name: "Kling", slug: "kling", category: "apps", website_url: "https://kling.kuaishou.com", description: "Kuaishou's AI video generation model with impressive results." },

  // ============ APPS - Audio & Voice ============
  { name: "ElevenLabs", slug: "elevenlabs", category: "apps", website_url: "https://elevenlabs.io", description: "Premium AI voice generation with natural-sounding speech synthesis." },
  { name: "Murf AI", slug: "murf-ai", category: "apps", website_url: "https://murf.ai", description: "AI voice generator for voiceovers, presentations, and videos." },
  { name: "Play.ht", slug: "play-ht", category: "apps", website_url: "https://play.ht", description: "AI text-to-speech with ultra-realistic voice cloning." },
  { name: "Resemble AI", slug: "resemble-ai", category: "apps", website_url: "https://www.resemble.ai", description: "AI voice generator with real-time voice cloning capabilities." },
  { name: "Speechify", slug: "speechify", category: "apps", website_url: "https://speechify.com", description: "AI text-to-speech app for listening to documents and articles." },
  { name: "LOVO AI", slug: "lovo-ai", category: "apps", website_url: "https://lovo.ai", description: "AI voiceover and text-to-speech platform with 500+ voices." },
  { name: "Replica Studios", slug: "replica-studios", category: "apps", website_url: "https://replicastudios.com", description: "AI voice actors for games, film, and creative projects." },
  { name: "Voicemod", slug: "voicemod", category: "apps", website_url: "https://www.voicemod.net", description: "Real-time AI voice changer for streaming and gaming." },
  { name: "Altered", slug: "altered", category: "apps", website_url: "https://www.altered.ai", description: "AI voice editing and performance transfer technology." },

  // ============ APPS - Music Generation ============
  { name: "Suno", slug: "suno", category: "apps", website_url: "https://suno.ai", description: "AI music generator creating full songs from text prompts." },
  { name: "Udio", slug: "udio", category: "apps", website_url: "https://www.udio.com", description: "AI music creation platform with high-quality audio generation." },
  { name: "AIVA", slug: "aiva", category: "apps", website_url: "https://www.aiva.ai", description: "AI composer for creating emotional soundtrack music." },
  { name: "Soundraw", slug: "soundraw", category: "apps", website_url: "https://soundraw.io", description: "AI music generator for royalty-free background tracks." },
  { name: "Amper Music", slug: "amper-music", category: "apps", website_url: "https://www.ampermusic.com", description: "AI-powered music creation for content creators." },
  { name: "Boomy", slug: "boomy", category: "apps", website_url: "https://boomy.com", description: "Create and release AI-generated music in minutes." },
  { name: "Mubert", slug: "mubert", category: "apps", website_url: "https://mubert.com", description: "AI-generated royalty-free music for content and apps." },
  { name: "Beatoven.ai", slug: "beatoven-ai", category: "apps", website_url: "https://www.beatoven.ai", description: "AI music composer for videos and podcasts." },

  // ============ APPS - Writing & Content ============
  { name: "Jasper", slug: "jasper", category: "apps", website_url: "https://www.jasper.ai", description: "AI content platform for marketing copy and business writing." },
  { name: "Copy.ai", slug: "copy-ai", category: "apps", website_url: "https://www.copy.ai", description: "AI copywriting tool for marketing and sales content." },
  { name: "Writesonic", slug: "writesonic", category: "apps", website_url: "https://writesonic.com", description: "AI writing assistant for blogs, ads, and marketing content." },
  { name: "Rytr", slug: "rytr", category: "apps", website_url: "https://rytr.me", description: "AI writing assistant for various content formats." },
  { name: "Notion AI", slug: "notion-ai", category: "apps", website_url: "https://www.notion.so/product/ai", description: "AI writing and summarization built into Notion workspace." },
  { name: "Grammarly", slug: "grammarly", category: "apps", website_url: "https://www.grammarly.com", description: "AI-powered writing assistant for grammar and style." },
  { name: "QuillBot", slug: "quillbot", category: "apps", website_url: "https://quillbot.com", description: "AI paraphrasing and writing enhancement tool." },
  { name: "Wordtune", slug: "wordtune", category: "apps", website_url: "https://www.wordtune.com", description: "AI writing companion for rewriting and improving text." },
  { name: "Sudowrite", slug: "sudowrite", category: "apps", website_url: "https://www.sudowrite.com", description: "AI writing partner for fiction authors and storytellers." },
  { name: "NovelAI", slug: "novelai", category: "apps", website_url: "https://novelai.net", description: "AI-assisted storytelling and image generation platform." },
  { name: "Anyword", slug: "anyword", category: "apps", website_url: "https://anyword.com", description: "AI copywriting with predictive performance scoring." },
  { name: "Frase", slug: "frase", category: "apps", website_url: "https://www.frase.io", description: "AI content optimization for SEO and research." },
  { name: "Surfer SEO", slug: "surfer-seo", category: "apps", website_url: "https://surferseo.com", description: "AI-powered SEO and content optimization platform." },

  // ============ APPS - Coding ============
  { name: "GitHub Copilot", slug: "github-copilot", category: "apps", website_url: "https://github.com/features/copilot", description: "AI pair programmer suggesting code completions in your IDE." },
  { name: "Cursor", slug: "cursor", category: "apps", website_url: "https://cursor.sh", description: "AI-first code editor built for pair programming with AI." },
  { name: "Replit AI", slug: "replit-ai", category: "apps", website_url: "https://replit.com/ai", description: "AI coding assistant integrated into Replit's cloud IDE." },
  { name: "Tabnine", slug: "tabnine", category: "apps", website_url: "https://www.tabnine.com", description: "AI code completion trained on open-source code." },
  { name: "Amazon CodeWhisperer", slug: "codewhisperer", category: "apps", website_url: "https://aws.amazon.com/codewhisperer", description: "Amazon's AI coding companion for AWS development." },
  { name: "Codeium", slug: "codeium", category: "apps", website_url: "https://codeium.com", description: "Free AI code completion and search for developers." },
  { name: "Sourcegraph Cody", slug: "sourcegraph-cody", category: "apps", website_url: "https://sourcegraph.com/cody", description: "AI coding assistant that understands your entire codebase." },
  { name: "Codium AI", slug: "codium-ai", category: "apps", website_url: "https://www.codium.ai", description: "AI-powered code integrity through test generation." },
  { name: "Sweep", slug: "sweep", category: "apps", website_url: "https://sweep.dev", description: "AI junior developer that handles GitHub issues." },
  { name: "Aider", slug: "aider", category: "apps", website_url: "https://aider.chat", description: "AI pair programming in your terminal with git integration." },
  { name: "Continue", slug: "continue", category: "apps", website_url: "https://continue.dev", description: "Open-source AI code assistant for VS Code and JetBrains." },
  { name: "Claude Code", slug: "claude-code", category: "apps", website_url: "https://claude.ai", description: "Anthropic's CLI tool for AI-assisted software development." },
  { name: "Windsurf", slug: "windsurf", category: "apps", website_url: "https://codeium.com/windsurf", description: "Agentic IDE by Codeium with deep codebase understanding." },

  // ============ APPS - Design ============
  { name: "Figma AI", slug: "figma-ai", category: "apps", website_url: "https://www.figma.com/ai", description: "AI features in Figma for faster design workflows." },
  { name: "Framer AI", slug: "framer-ai", category: "apps", website_url: "https://www.framer.com/ai", description: "AI-powered website builder with instant generation." },
  { name: "Uizard", slug: "uizard", category: "apps", website_url: "https://uizard.io", description: "AI design tool for rapid UI/UX prototyping." },
  { name: "Galileo AI", slug: "galileo-ai", category: "apps", website_url: "https://www.usegalileo.ai", description: "AI UI designer generating editable Figma designs." },
  { name: "Khroma", slug: "khroma", category: "apps", website_url: "https://khroma.co", description: "AI color palette generator that learns your preferences." },
  { name: "Looka", slug: "looka", category: "apps", website_url: "https://looka.com", description: "AI-powered logo maker and brand identity designer." },
  { name: "Designs.ai", slug: "designs-ai", category: "apps", website_url: "https://designs.ai", description: "AI design suite for logos, videos, and mockups." },
  { name: "Diagram", slug: "diagram", category: "apps", website_url: "https://diagram.com", description: "AI design tools including Magician plugin for Figma." },

  // ============ APPS - Productivity ============
  { name: "Otter.ai", slug: "otter-ai", category: "apps", website_url: "https://otter.ai", description: "AI meeting transcription and note-taking assistant." },
  { name: "Fireflies.ai", slug: "fireflies-ai", category: "apps", website_url: "https://fireflies.ai", description: "AI meeting assistant for transcription and analysis." },
  { name: "Mem", slug: "mem", category: "apps", website_url: "https://mem.ai", description: "AI-powered workspace that organizes itself." },
  { name: "Taskade", slug: "taskade", category: "apps", website_url: "https://www.taskade.com", description: "AI-powered productivity platform with task automation." },
  { name: "Reclaim AI", slug: "reclaim-ai", category: "apps", website_url: "https://reclaim.ai", description: "AI calendar assistant for smart time blocking." },
  { name: "Motion", slug: "motion", category: "apps", website_url: "https://www.usemotion.com", description: "AI-powered calendar and project management tool." },
  { name: "Magical", slug: "magical", category: "apps", website_url: "https://www.getmagical.com", description: "AI text expander and automation for repetitive tasks." },
  { name: "Tldv", slug: "tldv", category: "apps", website_url: "https://tldv.io", description: "AI meeting recorder with timestamped transcripts." },
  { name: "Krisp", slug: "krisp", category: "apps", website_url: "https://krisp.ai", description: "AI-powered noise cancellation for calls and meetings." },

  // ============ APPS - Research & Analysis ============
  { name: "Elicit", slug: "elicit", category: "apps", website_url: "https://elicit.org", description: "AI research assistant for finding and analyzing papers." },
  { name: "Consensus", slug: "consensus", category: "apps", website_url: "https://consensus.app", description: "AI search engine for scientific research papers." },
  { name: "Semantic Scholar", slug: "semantic-scholar", category: "apps", website_url: "https://www.semanticscholar.org", description: "AI-powered academic paper search and discovery." },
  { name: "Scholarcy", slug: "scholarcy", category: "apps", website_url: "https://www.scholarcy.com", description: "AI article summarizer for research papers." },
  { name: "Scite", slug: "scite", category: "apps", website_url: "https://scite.ai", description: "AI citation analysis showing how papers cite each other." },
  { name: "Connected Papers", slug: "connected-papers", category: "apps", website_url: "https://www.connectedpapers.com", description: "Visual tool for exploring academic paper connections." },
  { name: "Research Rabbit", slug: "research-rabbit", category: "apps", website_url: "https://www.researchrabbit.ai", description: "AI-powered research discovery and organization." },
  { name: "Explainpaper", slug: "explainpaper", category: "apps", website_url: "https://www.explainpaper.com", description: "AI that explains complex research papers simply." },

  // ============ AGENTS ============
  { name: "AutoGPT", slug: "autogpt", category: "agents", website_url: "https://autogpt.net", description: "Autonomous AI agent that chains thoughts to accomplish goals." },
  { name: "AgentGPT", slug: "agentgpt", category: "agents", website_url: "https://agentgpt.reworkd.ai", description: "Browser-based autonomous AI agent platform." },
  { name: "BabyAGI", slug: "babyagi", category: "agents", website_url: "https://github.com/yoheinakajima/babyagi", description: "Task-driven autonomous agent using AI and vector databases." },
  { name: "SuperAGI", slug: "superagi", category: "agents", website_url: "https://superagi.com", description: "Open-source autonomous AI agent framework." },
  { name: "CrewAI", slug: "crewai", category: "agents", website_url: "https://www.crewai.io", description: "Framework for orchestrating role-playing AI agents." },
  { name: "LangChain Agents", slug: "langchain-agents", category: "agents", website_url: "https://www.langchain.com", description: "Framework for building AI agents with language models." },
  { name: "MetaGPT", slug: "metagpt", category: "agents", website_url: "https://www.deepwisdom.ai", description: "Multi-agent framework simulating a software company." },
  { name: "Devin", slug: "devin", category: "agents", website_url: "https://www.cognition-labs.com", description: "Autonomous AI software engineer by Cognition Labs." },
  { name: "OpenDevin", slug: "opendevin", category: "agents", website_url: "https://github.com/OpenDevin/OpenDevin", description: "Open-source autonomous AI software developer." },
  { name: "SWE-agent", slug: "swe-agent", category: "agents", website_url: "https://swe-agent.com", description: "AI agent that resolves GitHub issues automatically." },
  { name: "GPT Researcher", slug: "gpt-researcher", category: "agents", website_url: "https://gptr.dev", description: "Autonomous agent for comprehensive online research." },
  { name: "CAMEL", slug: "camel", category: "agents", website_url: "https://www.camel-ai.org", description: "Framework for autonomous cooperation among AI agents." },
  { name: "Autogen", slug: "autogen", category: "agents", website_url: "https://microsoft.github.io/autogen", description: "Microsoft's framework for multi-agent conversations." },
  { name: "ChatDev", slug: "chatdev", category: "agents", website_url: "https://chatdev.ai", description: "Virtual software company powered by AI agents." },
  { name: "GPT Pilot", slug: "gpt-pilot", category: "agents", website_url: "https://github.com/Pythagora-io/gpt-pilot", description: "AI developer that writes scalable apps from scratch." },
  { name: "Agentic", slug: "agentic", category: "agents", website_url: "https://agentic.ai", description: "Platform for building and deploying AI agents." },
  { name: "Fixie.ai", slug: "fixie-ai", category: "agents", website_url: "https://www.fixie.ai", description: "Platform for building conversational AI agents." },
  { name: "Multi-On", slug: "multi-on", category: "agents", website_url: "https://multion.ai", description: "AI agent that can browse the web and complete tasks." },
  { name: "Adept AI", slug: "adept-ai", category: "agents", website_url: "https://www.adept.ai", description: "AI teammate that can take actions in software." },
  { name: "Lindy AI", slug: "lindy-ai", category: "agents", website_url: "https://www.lindy.ai", description: "AI assistant that automates workflows and tasks." },
  { name: "Embra", slug: "embra", category: "agents", website_url: "https://embra.app", description: "AI assistant with context from your apps and tools." },

  // ============ APIS ============
  { name: "OpenAI API", slug: "openai-api", category: "apis", website_url: "https://platform.openai.com", description: "API access to GPT-4, DALL-E, Whisper, and more AI models." },
  { name: "Anthropic API", slug: "anthropic-api", category: "apis", website_url: "https://www.anthropic.com/api", description: "API access to Claude models for AI applications." },
  { name: "Google AI Studio", slug: "google-ai-studio", category: "apis", website_url: "https://aistudio.google.com", description: "Build with Gemini models through Google's AI platform." },
  { name: "Cohere", slug: "cohere", category: "apis", website_url: "https://cohere.com", description: "Enterprise AI platform for text generation and embeddings." },
  { name: "AI21 Labs", slug: "ai21-labs", category: "apis", website_url: "https://www.ai21.com", description: "Jurassic language models for enterprise AI applications." },
  { name: "Hugging Face", slug: "hugging-face", category: "apis", website_url: "https://huggingface.co", description: "Platform for open-source AI models and datasets." },
  { name: "Replicate", slug: "replicate", category: "apis", website_url: "https://replicate.com", description: "Run open-source ML models with a cloud API." },
  { name: "Together AI", slug: "together-ai", category: "apis", website_url: "https://www.together.ai", description: "Cloud platform for running open-source AI models." },
  { name: "Anyscale", slug: "anyscale", category: "apis", website_url: "https://www.anyscale.com", description: "Platform for scaling AI workloads with Ray." },
  { name: "Fireworks AI", slug: "fireworks-ai", category: "apis", website_url: "https://fireworks.ai", description: "Fast inference platform for generative AI models." },
  { name: "Groq", slug: "groq", category: "apis", website_url: "https://groq.com", description: "Ultra-fast AI inference with custom LPU hardware." },
  { name: "Mistral AI", slug: "mistral-ai", category: "apis", website_url: "https://mistral.ai", description: "European AI company with powerful open-weight models." },
  { name: "Perplexity API", slug: "perplexity-api", category: "apis", website_url: "https://docs.perplexity.ai", description: "API for Perplexity's search-augmented language models." },
  { name: "Cerebras", slug: "cerebras", category: "apis", website_url: "https://www.cerebras.net", description: "AI compute platform with wafer-scale chips." },
  { name: "Modal", slug: "modal", category: "apis", website_url: "https://modal.com", description: "Cloud platform for running AI workloads serverlessly." },
  { name: "Banana", slug: "banana", category: "apis", website_url: "https://www.banana.dev", description: "Serverless GPU infrastructure for ML inference." },
  { name: "Baseten", slug: "baseten", category: "apis", website_url: "https://www.baseten.co", description: "Platform for deploying ML models as APIs." },
  { name: "DeepInfra", slug: "deepinfra", category: "apis", website_url: "https://deepinfra.com", description: "Serverless inference for popular AI models." },
  { name: "OctoAI", slug: "octoai", category: "apis", website_url: "https://octo.ai", description: "Efficient AI inference cloud for GenAI applications." },
  { name: "AWS Bedrock", slug: "aws-bedrock", category: "apis", website_url: "https://aws.amazon.com/bedrock", description: "Amazon's managed service for foundation models." },
  { name: "Azure OpenAI", slug: "azure-openai", category: "apis", website_url: "https://azure.microsoft.com/en-us/products/ai-services/openai-service", description: "OpenAI models hosted on Microsoft Azure." },
  { name: "Vertex AI", slug: "vertex-ai", category: "apis", website_url: "https://cloud.google.com/vertex-ai", description: "Google Cloud's unified AI platform." },
  { name: "SambaNova", slug: "sambanova", category: "apis", website_url: "https://sambanova.ai", description: "Enterprise AI platform with custom hardware." },
  { name: "Lamini", slug: "lamini", category: "apis", website_url: "https://www.lamini.ai", description: "Enterprise LLM platform for fine-tuning and inference." },
  { name: "Predibase", slug: "predibase", category: "apis", website_url: "https://predibase.com", description: "Platform for fine-tuning and serving LLMs." },
  { name: "RunPod", slug: "runpod", category: "apis", website_url: "https://www.runpod.io", description: "GPU cloud for AI inference and training." },
  { name: "AssemblyAI", slug: "assemblyai", category: "apis", website_url: "https://www.assemblyai.com", description: "API for speech-to-text and audio intelligence." },
  { name: "Deepgram", slug: "deepgram", category: "apis", website_url: "https://deepgram.com", description: "AI speech recognition and transcription API." },
  { name: "Rev.ai", slug: "rev-ai", category: "apis", website_url: "https://www.rev.ai", description: "Speech-to-text API with high accuracy." },
  { name: "Pinecone", slug: "pinecone", category: "apis", website_url: "https://www.pinecone.io", description: "Vector database for AI applications." },
  { name: "Weaviate", slug: "weaviate", category: "apis", website_url: "https://weaviate.io", description: "Open-source vector search engine." },
  { name: "Qdrant", slug: "qdrant", category: "apis", website_url: "https://qdrant.tech", description: "Vector similarity search engine and database." },
  { name: "Chroma", slug: "chroma", category: "apis", website_url: "https://www.trychroma.com", description: "Open-source embedding database for AI apps." },
  { name: "Milvus", slug: "milvus", category: "apis", website_url: "https://milvus.io", description: "Open-source vector database for AI workloads." },
  { name: "LanceDB", slug: "lancedb", category: "apis", website_url: "https://lancedb.com", description: "Serverless vector database for AI applications." },

  // ============ DEVICES ============
  { name: "Rabbit R1", slug: "rabbit-r1", category: "devices", website_url: "https://www.rabbit.tech", description: "Pocket AI companion device with Large Action Model." },
  { name: "Humane AI Pin", slug: "humane-ai-pin", category: "devices", website_url: "https://hu.ma.ne", description: "Wearable AI device with projector and camera." },
  { name: "Ray-Ban Meta", slug: "ray-ban-meta", category: "devices", website_url: "https://www.ray-ban.com/usa/ray-ban-meta-smart-glasses", description: "Smart glasses with Meta AI and camera." },
  { name: "Amazon Echo", slug: "amazon-echo", category: "devices", website_url: "https://www.amazon.com/echo", description: "Smart speaker with Alexa AI assistant." },
  { name: "Google Nest Hub", slug: "google-nest-hub", category: "devices", website_url: "https://store.google.com/product/nest_hub_2nd_gen", description: "Smart display with Google Assistant." },
  { name: "Apple HomePod", slug: "apple-homepod", category: "devices", website_url: "https://www.apple.com/homepod", description: "Smart speaker with Siri and spatial audio." },
  { name: "NVIDIA Jetson", slug: "nvidia-jetson", category: "devices", website_url: "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems", description: "Edge AI computing platform for robotics and IoT." },
  { name: "Google Coral", slug: "google-coral", category: "devices", website_url: "https://coral.ai", description: "Edge TPU devices for local AI inference." },
  { name: "Intel Neural Compute Stick", slug: "intel-ncs", category: "devices", website_url: "https://www.intel.com/content/www/us/en/developer/tools/neural-compute-stick/overview.html", description: "USB device for deep learning inference." },
  { name: "Raspberry Pi AI Kit", slug: "raspberry-pi-ai", category: "devices", website_url: "https://www.raspberrypi.com/products/ai-kit", description: "AI acceleration kit for Raspberry Pi." },
  { name: "Frame AR", slug: "frame-ar", category: "devices", website_url: "https://brilliant.xyz", description: "AI-powered AR glasses with multimodal AI." },
  { name: "Limitless Pendant", slug: "limitless-pendant", category: "devices", website_url: "https://www.limitless.ai", description: "Wearable AI that remembers conversations." },
  { name: "Omi", slug: "omi", category: "devices", website_url: "https://www.omi.me", description: "AI wearable for memory and productivity." },
  { name: "Tab", slug: "tab", category: "devices", website_url: "https://mytab.ai", description: "AI necklace that captures and transcribes conversations." },
  { name: "Compass", slug: "compass", category: "devices", website_url: "https://www.compass.tech", description: "AI-powered smart ring with health tracking." },
  { name: "Friend", slug: "friend", category: "devices", website_url: "https://www.friend.com", description: "AI companion device that listens and responds." },

  // ============ ROBOTS ============
  { name: "Boston Dynamics Spot", slug: "spot", category: "robots", website_url: "https://www.bostondynamics.com/products/spot", description: "Agile mobile robot for inspection and data collection." },
  { name: "Boston Dynamics Atlas", slug: "atlas", category: "robots", website_url: "https://www.bostondynamics.com/atlas", description: "Advanced humanoid robot for research and demos." },
  { name: "Tesla Optimus", slug: "tesla-optimus", category: "robots", website_url: "https://www.tesla.com/optimus", description: "Tesla's humanoid robot for general-purpose tasks." },
  { name: "Figure 01", slug: "figure-01", category: "robots", website_url: "https://www.figure.ai", description: "General-purpose humanoid robot for work tasks." },
  { name: "1X NEO", slug: "1x-neo", category: "robots", website_url: "https://www.1x.tech", description: "Humanoid robot designed for home assistance." },
  { name: "Agility Digit", slug: "agility-digit", category: "robots", website_url: "https://agilityrobotics.com/digit", description: "Human-centric bipedal robot for logistics." },
  { name: "Sanctuary Phoenix", slug: "sanctuary-phoenix", category: "robots", website_url: "https://sanctuary.ai", description: "General-purpose humanoid robot with AI." },
  { name: "Unitree", slug: "unitree", category: "robots", website_url: "https://www.unitree.com", description: "Quadruped and humanoid robots for various applications." },
  { name: "ANYbotics ANYmal", slug: "anymal", category: "robots", website_url: "https://www.anybotics.com", description: "Autonomous legged robot for industrial inspection." },
  { name: "Xiaomi CyberDog", slug: "cyberdog", category: "robots", website_url: "https://www.mi.com/cyberdog", description: "Quadruped robot companion with AI capabilities." },
  { name: "Sony Aibo", slug: "sony-aibo", category: "robots", website_url: "https://us.aibo.com", description: "AI-powered robotic pet dog by Sony." },
  { name: "iRobot Roomba", slug: "irobot-roomba", category: "robots", website_url: "https://www.irobot.com", description: "AI-powered robot vacuum with smart mapping." },
  { name: "Roborock", slug: "roborock", category: "robots", website_url: "https://www.roborock.com", description: "Smart robot vacuums with AI navigation." },
  { name: "Ecovacs Deebot", slug: "ecovacs-deebot", category: "robots", website_url: "https://www.ecovacs.com", description: "Robot vacuums and mops with AI features." },
  { name: "Samsung Ballie", slug: "samsung-ballie", category: "robots", website_url: "https://www.samsung.com", description: "Rolling AI companion robot for the home." },
  { name: "Amazon Astro", slug: "amazon-astro", category: "robots", website_url: "https://www.amazon.com/astro", description: "Home robot with Alexa for monitoring and tasks." },
  { name: "Temi", slug: "temi", category: "robots", website_url: "https://www.robotemi.com", description: "Personal robot assistant with video calling." },
  { name: "Misty Robotics", slug: "misty-robotics", category: "robots", website_url: "https://www.mistyrobotics.com", description: "Programmable robot for education and development." },
  { name: "Jibo", slug: "jibo", category: "robots", website_url: "https://jibo.com", description: "Social robot companion for the home." },
  { name: "Moxie", slug: "moxie", category: "robots", website_url: "https://embodied.com", description: "AI robot companion for children's development." },
  { name: "Vector", slug: "vector", category: "robots", website_url: "https://www.digitaldreamlabs.com/pages/vector-robot", description: "AI-powered desktop companion robot by Anki." },
  { name: "Cozmo", slug: "cozmo", category: "robots", website_url: "https://www.digitaldreamlabs.com/pages/cozmo-robot", description: "Playful AI robot for learning and entertainment." },
  { name: "Pepper", slug: "pepper", category: "robots", website_url: "https://www.aldebaran.com/en/pepper", description: "Humanoid robot for customer service and education." },
  { name: "NAO", slug: "nao", category: "robots", website_url: "https://www.aldebaran.com/en/nao", description: "Programmable humanoid robot for education." },
  { name: "UBTECH Walker", slug: "ubtech-walker", category: "robots", website_url: "https://www.ubtrobot.com/products/walker", description: "Large bipedal service robot for various tasks." },
  { name: "Hanson Sophia", slug: "hanson-sophia", category: "robots", website_url: "https://www.hansonrobotics.com/sophia", description: "Humanoid robot known for realistic expressions." },
];

async function seed() {
  console.log(`Starting seed of ${solutions.length} solutions...`);
  console.log('');

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const s of solutions) {
    try {
      // Check if solution already exists by slug
      const existing = await base('Solutions')
        .select({
          filterByFormula: `{slug} = '${s.slug}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (existing.length > 0) {
        console.log(`⏭ ${s.name} (already exists)`);
        skipped++;
        continue;
      }

      await base('Solutions').create({
        name: s.name,
        slug: s.slug,
        category: s.category,
        website_url: s.website_url,
        description: s.description,
        rds_score: 0,
        review_count: 0,
      });
      console.log(`✓ ${s.name}`);
      success++;
    } catch (e) {
      console.log(`✗ ${s.name} - ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done! ${success} added, ${skipped} skipped, ${failed} failed.`);
}

seed();
