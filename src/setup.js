import chalk from 'chalk';
import { password, select } from '@inquirer/prompts';
import { loadConfig, saveConfig, getConfigPath } from './config.js';
import { NVIDIA_MODELS, DEFAULT_MODEL, PROVIDERS, getModelsForProvider, fetchLocalModels } from './nvidia.js';

const purple = chalk.hex('#7C3AED').bold;
const gray = chalk.gray;
const green = chalk.green;
const orange = chalk.hex('#FFAB70');
const white = chalk.white;
const dim = chalk.hex('#6A737D');

export async function runSetup() {
  console.log();
  console.log(purple('  YUVA Code — Setup'));
  console.log(gray('  ─────────────────────────────'));
  console.log();

  const config = loadConfig();

  // Step 1: Choose provider
  let provider;
  try {
    provider = await select({
      message: 'Choose AI provider:',
      default: config.provider || 'nvidia',
      choices: Object.entries(PROVIDERS).map(([key, p]) => ({
        name: `${p.name}${p.free ? green(' (FREE)') : orange(' (needs API key)')}`,
        value: key
      })),
      loop: false
    });
  } catch {
    console.log(gray('\n  Setup cancelled.\n'));
    return;
  }
  config.provider = provider;

  const providerInfo = PROVIDERS[provider];

  // Step 2: API key (skip for local providers — Ollama, LM Studio, Jan)
  if (providerInfo?.local) {
    // No key needed — just set a placeholder so the app knows it's configured
    config.apiKey = 'local';
    console.log();
    console.log(green('  ✓ No API key needed for local providers.'));
    console.log(gray(`  Endpoint: ${providerInfo.endpoint}`));
    console.log();
  } else {
    // Cloud provider — ask for API key
    if (provider === 'nvidia') {
      console.log();
      console.log(gray('  Get a free API key at: ') + white('https://build.nvidia.com/'));
      console.log(gray('  (Paste with Ctrl+V — input will be masked)'));
      console.log();
    } else {
      console.log();
      console.log(gray(`  Get your ${providerInfo.name} API key from their dashboard.`));
      console.log();
    }

    let apiKey;
    try {
      apiKey = await password({
        message: `${providerInfo?.name || 'API'} key:`,
        mask: '*',
        validate: v => v.trim().length > 0 || 'API key is required'
      });
    } catch {
      console.log(gray('\n  Setup cancelled.\n'));
      return;
    }
    config.apiKey = apiKey.trim();
  }

  // Step 3: Choose model
  let models;
  if (providerInfo?.local) {
    // Local provider — try to detect installed models automatically
    console.log(gray('  Scanning for installed models...'));
    const liveModels = await fetchLocalModels(provider);
    if (liveModels.length > 0) {
      console.log(green(`  ✓ Found ${liveModels.length} models from ${providerInfo.name}`));
      models = liveModels;
    } else {
      // Check if server is reachable at all
      let serverReachable = false;
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 3000);
        const ping = await fetch(providerInfo.endpoint.replace('/v1/chat/completions', '/api/tags'), { signal: ac.signal });
        clearTimeout(timer);
        serverReachable = ping.ok;
      } catch { /* not reachable */ }

      if (serverReachable) {
        // Server is running but no models installed
        console.log();
        console.log(orange(`  ⚠ ${providerInfo.name} is running but no models are installed.`));
        console.log();
        if (provider === 'ollama') {
          console.log(white('  Download a model first:'));
          console.log(dim('    ollama pull qwen2.5-coder:14b    ') + dim('← recommended for coding'));
          console.log(dim('    ollama pull llama3.3:70b          ') + dim('← general purpose'));
          console.log(dim('    ollama pull deepseek-coder-v2:16b ') + dim('← coding specialist'));
          console.log();
          console.log(gray('  Browse all models: ') + white('https://ollama.com/library'));
          console.log(gray('  After downloading, run ') + white('yuva --setup') + gray(' again.'));
        } else if (provider === 'lmstudio') {
          console.log(white('  Download a model in LM Studio:'));
          console.log(gray('  1. Open LM Studio'));
          console.log(gray('  2. Go to the "Discover" tab'));
          console.log(gray('  3. Search and download a model'));
          console.log(gray('  4. Load it in the "Local Server" tab'));
          console.log();
          console.log(gray('  Download: ') + white('https://lmstudio.ai/'));
        } else if (provider === 'jan') {
          console.log(white('  Download a model in Jan:'));
          console.log(gray('  1. Open Jan'));
          console.log(gray('  2. Go to "Hub" in the sidebar'));
          console.log(gray('  3. Download a model'));
          console.log();
          console.log(gray('  Download: ') + white('https://jan.ai/'));
        }
        console.log();
        process.exit(0);
      } else {
        // Server not reachable at all
        console.log();
        console.log(orange(`  ⚠ Cannot connect to ${providerInfo.name}.`));
        console.log();
        if (provider === 'ollama') {
          console.log(white('  Ollama is not running. To install and start:'));
          console.log();
          console.log(dim('  1. Download:  ') + white('https://ollama.com/download'));
          console.log(dim('  2. Install and run it'));
          console.log(dim('  3. Download a model:'));
          console.log();
          console.log(dim('     ollama pull qwen2.5-coder:14b'));
          console.log();
          console.log(dim('  4. Run ') + white('yuva --setup') + dim(' again'));
        } else if (provider === 'lmstudio') {
          console.log(white('  LM Studio is not running.'));
          console.log(gray('  Download: ') + white('https://lmstudio.ai/'));
          console.log(gray('  Start LM Studio, load a model, and enable the local server.'));
        } else if (provider === 'jan') {
          console.log(white('  Jan is not running.'));
          console.log(gray('  Download: ') + white('https://jan.ai/'));
          console.log(gray('  Start Jan, download a model, and enable the API server.'));
        }
        console.log();
        process.exit(0);
      }
    }
  } else {
    models = getModelsForProvider(provider);
  }

  if (models.length > 0) {
    let model;
    try {
      model = await select({
        message: 'Choose model:',
        default: provider === 'nvidia' ? DEFAULT_MODEL : models[0].id,
        choices: models.map(m => ({
          name: `${m.name}  ${dim(`(${m.tag})`)}`,
          value: m.id
        })),
        loop: false
      });
    } catch {
      console.log(gray('\n  Setup cancelled. API key not saved.\n'));
      return;
    }
    config.model = model;
  } else if (providerInfo?.local) {
    // No models detected and no presets — let user type the model name
    let modelId;
    try {
      const { input } = await import('@inquirer/prompts');
      modelId = await input({ message: 'Model name (e.g. llama3.3:70b, qwen2.5-coder:14b):' });
    } catch {
      console.log(gray('\n  Setup cancelled. API key not saved.\n'));
      return;
    }
    config.model = modelId.trim();
  }

  saveConfig(config);

  console.log();
  console.log(green('  ✓ Setup complete.'));
  console.log(gray('  Config:   ') + white(getConfigPath()));
  console.log(gray('  Provider: ') + white(PROVIDERS[provider]?.name || provider));
  console.log(gray('  Model:    ') + white(config.model));
  console.log(gray('  Run ') + white('yuva') + gray(' to start chatting.'));
  console.log();
}
