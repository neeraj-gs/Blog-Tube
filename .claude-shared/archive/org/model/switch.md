---
description: "Switch between Claude models for optimal cost and performance balance"
allowed-tools: ["Bash"]
---

# Model Switch Command

Switch between Claude models for optimal cost and performance balance.

## Usage

```bash
/org:model:switch <model>
```

Available models:
- `sonnet-3.5` - Best price/performance for most coding tasks  
- `sonnet-3.7` - Hybrid reasoning with controllable thinking depth
- `sonnet-4` - Most capable for complex architecture decisions

## Implementation

```bash
#!/bin/bash

MODEL_PARAM="$1"

# Validate input
if [[ -z "$MODEL_PARAM" ]]; then
    echo "❌ Error: Please specify a model"
    echo "Usage: /org:model:switch <model>"
    echo "Available: sonnet-3.5, sonnet-3.7, sonnet-4"
    exit 1
fi

# Map user-friendly names to actual model names
case "$MODEL_PARAM" in
    "sonnet-3.5"|"3.5")
        MODEL_NAME="claude-3-5-sonnet-20241022"
        DISPLAY_NAME="Claude 3.5 Sonnet"
        COST_INFO="💰 Optimized for cost efficiency"
        ;;
    "sonnet-3.7"|"3.7")
        MODEL_NAME="claude-3-7-sonnet"
        DISPLAY_NAME="Claude 3.7 Sonnet"
        COST_INFO="⚡ Hybrid reasoning - controllable thinking depth"
        ;;
    "sonnet-4"|"4"|"4.0")
        MODEL_NAME="claude-sonnet-4-0"
        DISPLAY_NAME="Claude Sonnet 4"
        COST_INFO="🧠 Most capable - highest cost"
        ;;
    *)
        echo "❌ Error: Invalid model '$MODEL_PARAM'"
        echo "Available models: sonnet-3.5, sonnet-3.7, sonnet-4"
        exit 1
        ;;
esac

echo "🔄 Switching to $DISPLAY_NAME..."
echo "$COST_INFO"

# Method 1: Create/update local settings.json
SETTINGS_FILE=".claude/settings.json"

if [[ ! -d ".claude" ]]; then
    echo "📁 Creating .claude directory..."
    mkdir -p ".claude"
fi

if [[ ! -f "$SETTINGS_FILE" ]]; then
    echo "📄 Creating new settings.json..."
    echo "{}" > "$SETTINGS_FILE"
fi

# Update settings.json with new model
if command -v jq &> /dev/null; then
    echo "📝 Updating .claude/settings.json..."
    jq --arg model "$MODEL_NAME" '. + {model: $model}' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
    echo "✅ Local settings updated"
else
    echo "📝 Updating model in settings.json..."
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' 's/"model": ".*"/"model": "'$MODEL_NAME'"/' "$SETTINGS_FILE"
    else
        sed -i 's/"model": ".*"/"model": "'$MODEL_NAME'"/' "$SETTINGS_FILE"
    fi
fi

echo ""
echo "🎯 Model Switch Summary:"
echo "   Model: $DISPLAY_NAME"
echo "   ID: $MODEL_NAME"
echo "   $COST_INFO"
echo ""
echo "💡 Tip: Restart your Claude Code session to ensure the change takes effect"
```

## Examples

```bash
# Switch to cost-optimized model
/org:model:switch sonnet-3.5

# Switch to hybrid reasoning model  
/org:model:switch sonnet-3.7

# Switch to most capable model
/org:model:switch sonnet-4

# Short aliases work too
/org:model:switch 3.5
/org:model:switch 3.7
/org:model:switch 4
```

## Cost Optimization Tips

- **sonnet-3.5**: Best for routine coding, debugging, implementation
- **sonnet-3.7**: Use thinking mode for complex problems, standard mode for speed
- **sonnet-4**: Reserve for architecture decisions, complex reasoning

## Verification

After switching, verify with:
```bash
cat .claude/settings.json | grep model
```

## Notes

- Changes apply to new Claude Code sessions
- Local settings.json only affects current repository