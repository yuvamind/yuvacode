<p align="center">
  <strong>YUVA Code</strong> — AI coding CLI that reads, edits, and runs code instead of pasting it into chat.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/yuva-code"><img src="https://img.shields.io/npm/v/yuva-code" alt="npm version"></a>
  <a href="https://github.com/Aftab-web-dev/yuvacode/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/yuva-code" alt="license"></a>
  <img src="https://img.shields.io/node/v/yuva-code" alt="node version">
</p>

---

YUVA Code gives an AI model real tools — file read/write/edit, shell access, and grep — so it can actually work on your codebase. It supports **14 providers** out of the box, including free options.

## Quick Start

```bash
npm install -g yuva-code
yuva --setup     # pick a provider and model
yuva             # start coding
```

## Providers

| Provider | Cost | Key |
|----------|------|-----|
| **NVIDIA NIM** | Free | [build.nvidia.com](https://build.nvidia.com/) |
| **Ollama** | Free (local) | No key needed |
| **LM Studio** | Free (local) | No key needed |
| **Jan** | Free (local) | No key needed |
| Google Gemini | Paid | [aistudio.google.com](https://aistudio.google.com/apikey) |
| OpenAI | Paid | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic Claude | Paid | [console.anthropic.com](https://console.anthropic.com/) |
| DeepSeek | Paid | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| Moonshot Kimi | Paid | [platform.moonshot.cn](https://platform.moonshot.cn/) |
| Groq | Paid | [console.groq.com](https://console.groq.com/keys) |
| Alibaba Qwen | Paid | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| xAI Grok | Paid | [console.x.ai](https://console.x.ai/) |
| OpenRouter | Paid | [openrouter.ai](https://openrouter.ai/keys) |
| Custom API | — | Any OpenAI-compatible endpoint |

Switch providers anytime with `/provider`.

## Usage

```bash
yuva                  # start interactive chat
yuva --setup, -s      # run setup wizard
yuva --help, -h       # show help
yuva --version, -v    # show version
```

Type a request like `add a hello function to src/foo.js`. The model reads files, edits them, and runs shell commands as needed.

### Tools

The model has access to 7 tools:

| Tool | Permission | Description |
|------|------------|-------------|
| `read_file` | Auto | Read file contents (capped at 256 KB) |
| `list_files` | Auto | List directory entries (recursive up to 5 levels) |
| `grep_search` | Auto | Search for patterns across the codebase |
| `write_file` | Ask | Write a file (creates parent dirs) |
| `edit_file` | Ask | Replace a unique substring in a file |
| `shell` | Ask | Run a shell command (5 min timeout) |
| `delete_file` | Ask | Delete a file or empty directory |

Destructive tools (`write_file`, `edit_file`, `shell`, `delete_file`) prompt for approval. Type `a` to allow all for the session.

### Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/model` | Switch AI model (interactive picker) |
| `/provider` | Switch AI provider |
| `/undo` | Revert the last file change |
| `/diff` | Show all files changed this session |
| `/save` | Export conversation to markdown |
| `/cost` | Show token usage stats |
| `/clear` | Clear conversation and reset |
| `/config` | Show config path and masked API key |
| `/cd <path>` | Change working directory |
| `/exit` | Quit |

### Shell Escape

Prefix any input with `!` to run a shell command directly (no approval prompt):

```
❯ !git status
❯ !npm test
❯ !ls -la
```

## Features

- **Multi-provider** — 14 providers including 4 free/local options
- **Streaming** — responses stream in real-time with markdown rendering
- **Tab completion** — slash commands auto-complete
- **Undo** — `/undo` reverts the last file change
- **Session export** — `/save` dumps the full conversation to a markdown file
- **Auto-context** — project tree and `package.json` are sent to the model on first message
- **Loop detection** — stops the model if it calls the same tool with the same args repeatedly
- **Rate limit retry** — automatically retries on 429/502/503/504 with exponential backoff

## Requirements

- Node.js >= 20
- An API key for your chosen provider (free for NVIDIA NIM, Ollama, LM Studio, Jan)

## Config

Config is stored at `~/.yuva-ai/config.json`. Override the directory with:

```bash
set YUVA_CONFIG_DIR=C:\my-config    # Windows
export YUVA_CONFIG_DIR=/my-config   # macOS/Linux
```

## License

[MIT](LICENSE)
