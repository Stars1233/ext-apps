# Say Server - Streaming TTS MCP App

A real-time text-to-speech MCP App with karaoke-style text highlighting, powered by [Kyutai's Pocket TTS](https://github.com/kyutai-labs/pocket-tts).

## MCP App Features Demonstrated

This example showcases several MCP App capabilities:

- **Single-file executable**: Python server with embedded React UI - no build step required
- **Partial tool inputs** (`ontoolinputpartial`): Widget receives streaming text as it's being generated
- **Queue-based streaming**: Demonstrates how to stream text out and audio in via a polling tool (adds text to an input queue, retrieves audio chunks from an output queue)
- **Model context updates**: Widget updates the LLM with playback progress ("Playing: ...snippet...")
- **Native theming**: Uses CSS variables for automatic dark/light mode adaptation
- **Fullscreen mode**: Toggle fullscreen via `requestDisplayMode()` API, press Escape to exit
- **Multi-widget speak lock**: Coordinates multiple TTS widgets via localStorage so only one plays at a time
- **Hidden tools** (`visibility: ["app"]`): Private tools only accessible to the widget, not the model
- **External links** (`openLink`): Attribution popup uses `app.openLink()` to open external URLs
- **CSP metadata**: Resource declares required domains (`esm.sh`) for in-browser transpilation

## Features

- **Streaming TTS**: Audio starts playing as text is being generated
- **Karaoke highlighting**: Words are highlighted in sync with speech
- **Interactive controls**: Click to pause/resume, double-click to restart
- **Low latency**: Uses a polling-based queue for minimal delay

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/) - fast Python package manager
- A CUDA GPU (recommended) or CPU with sufficient RAM (~2GB for model)

## Quick Start

The server is a single self-contained Python file that can be run directly with `uv`:

```bash
# Run directly (uv auto-installs dependencies)
uv run examples/say-server/server.py
```

The server will be available at `http://localhost:3109/mcp`.

## Running with Docker

Run directly from GitHub using the official `uv` Docker image. Mount your HuggingFace cache to avoid re-downloading the model:

```bash
docker run --rm -it \
  -p 3109:3109 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -e HF_HOME=/root/.cache/huggingface \
  ghcr.io/astral-sh/uv:debian \
  uv run https://raw.githubusercontent.com/modelcontextprotocol/ext-apps/main/examples/say-server/server.py
```

For GPU support, add `--gpus all` (requires [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)).

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "say": {
      "command": "uv",
      "args": ["run", "server.py", "--stdio"],
      "cwd": "/path/to/examples/say-server"
    }
  }
}
```

### With MCP Clients

Connect to `http://localhost:3109/mcp` and call the `say` tool:

```json
{
  "name": "say",
  "arguments": {
    "text": "Hello, world! This is a streaming TTS demo."
  }
}
```

## Available Voices

The default voice is `cosette`. Use the `list_voices` tool or pass a `voice` parameter to `say`:

### Predefined Voices

- `alba`, `marius`, `javert`, `jean` - from [alba-mackenna](https://huggingface.co/kyutai/tts-voices/tree/main/alba-mackenna) (CC BY 4.0)
- `cosette`, `eponine`, `azelma`, `fantine` - from [VCTK dataset](https://huggingface.co/kyutai/tts-voices/tree/main/vctk) (CC BY 4.0)

### Custom Voices

You can also use HuggingFace URLs or local file paths:

```json
{"text": "Hello!", "voice": "hf://kyutai/tts-voices/voice-donations/alice.wav"}
{"text": "Hello!", "voice": "/path/to/my-voice.wav"}
```

See the [kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices) repository for more voice collections

## Architecture

The entire server is contained in a single `server.py` file:

1. **`say` tool**: Public tool that triggers the widget with text to speak
2. **Private tools** (`create_tts_queue`, `add_tts_text`, `poll_tts_audio`, etc.): Hidden from the model, only callable by the widget
3. **Embedded React widget**: Uses [Babel standalone](https://babeljs.io/docs/babel-standalone) for in-browser JSX transpilation - no build step needed
4. **TTS backend**: Manages per-request audio queues using Pocket TTS

The widget communicates with the server via MCP tool calls:

- Receives streaming text via `ontoolinputpartial` callback
- Incrementally sends new text to the server as it arrives (via `add_tts_text`)
- Polls for generated audio chunks while TTS runs in parallel
- Plays audio via Web Audio API with synchronized text highlighting

## Multi-Widget Speak Lock

When multiple TTS widgets exist in the same browser (e.g., multiple chat messages each with their own say widget), they coordinate via localStorage to ensure only one plays at a time:

1. **Unique Widget IDs**: Each widget receives a UUID via `toolResult._meta.widgetUUID`
2. **Announce on Play**: When starting, a widget writes `{uuid, timestamp}` to `localStorage["mcp-tts-playing"]`
3. **Poll for Conflicts**: Every 200ms, playing widgets check if another widget took the lock
4. **Yield Gracefully**: If another widget started playing, pause and yield
5. **Clean Up**: On pause/finish, clear the lock (only if owned)

This "last writer wins" protocol ensures a seamless experience: clicking play on any widget immediately pauses others, without requiring cross-iframe postMessage coordination.

## TODO

- Persist caret position in localStorage (resume from where you left off)
- Click anywhere in text to move the cursor/playback position

## Credits

This project uses [Pocket TTS](https://github.com/kyutai-labs/pocket-tts) by [Kyutai](https://kyutai.org/) - a fantastic open-source text-to-speech model. Thank you to the Kyutai team for making this technology available!

The server includes modified Pocket TTS code to support streaming text input (text can be fed incrementally while audio generation runs in parallel). A PR contributing this functionality back to the original repo is planned.

## License

This example is MIT licensed.

### Third-Party Licenses

This project uses the following open-source components:

| Component                                                             | License           | Link                         |
| --------------------------------------------------------------------- | ----------------- | ---------------------------- |
| [pocket-tts](https://github.com/kyutai-labs/pocket-tts)               | MIT               | Python TTS library           |
| [Kyutai TTS model](https://huggingface.co/kyutai/tts-0.75b-en-public) | CC-BY 4.0         | Text-to-speech model weights |
| [kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices)         | Mixed (see below) | Voice prompt files           |

### Voice Collection Licenses

The predefined voices in this example use **CC-BY 4.0** licensed collections:

| Collection      | License             | Commercial Use            |
| --------------- | ------------------- | ------------------------- |
| alba-mackenna   | CC-BY 4.0           | ✅ Yes (with attribution) |
| vctk            | CC-BY 4.0           | ✅ Yes (with attribution) |
| cml-tts/fr      | CC-BY 4.0           | ✅ Yes (with attribution) |
| voice-donations | CC0 (Public Domain) | ✅ Yes                    |
| **expresso**    | CC-BY-NC 4.0        | ❌ Non-commercial only    |
| **ears**        | CC-BY-NC 4.0        | ❌ Non-commercial only    |

⚠️ **Note**: If you use voices from the `expresso/` or `ears/` collections, your use is restricted to non-commercial purposes.
