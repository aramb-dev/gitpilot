#!/bin/bash
set -euo pipefail

# Ralph Loop Script for looped
# Usage:
#   ./loop.sh              # Run building mode with Claude (unlimited iterations)
#   ./loop.sh 20           # Run building mode with Claude (max 20 iterations)
#   ./loop.sh plan         # Run planning mode with Claude
#   ./loop.sh plan 5       # Run planning mode with Claude (max 5 iterations)
#   ./loop.sh --agent codex plan    # Run planning mode with Codex
#   RALPH_AGENT=codex ./loop.sh     # Use environment variable to select agent

# Parse arguments
MODE="build"
PROMPT_FILE="PROMPT_build.md"
MAX_ITERATIONS=0
AGENT="${RALPH_AGENT:-claude}"  # Default to Claude, can override with env var
CODEX_PROFILE="${CODEX_PROFILE:-default}"  # Codex profile, can override with env var

# Parse command-line arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --agent)
            AGENT="$2"
            shift 2
            ;;
        --codex-profile)
            CODEX_PROFILE="$2"
            shift 2
            ;;
        plan)
            MODE="plan"
            PROMPT_FILE="PROMPT_plan.md"
            shift
            # Check if next arg is a number (max iterations)
            if [ $# -gt 0 ] && [[ "$1" =~ ^[0-9]+$ ]]; then
                MAX_ITERATIONS=$1
                shift
            fi
            ;;
        [0-9]*)
            MAX_ITERATIONS=$1
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Verify agent is valid
if [ "$AGENT" != "claude" ] && [ "$AGENT" != "codex" ]; then
    echo "Error: Invalid agent '$AGENT'. Must be 'claude' or 'codex'"
    exit 1
fi

# Verify prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

# Verify required files exist
if [ ! -f "AGENTS.md" ]; then
    echo "Error: AGENTS.md not found"
    exit 1
fi

# Initialize iteration counter
ITERATION=0

echo "Starting Ralph loop in $MODE mode with $AGENT agent..."
if [ $MAX_ITERATIONS -gt 0 ]; then
    echo "Max iterations: $MAX_ITERATIONS"
else
    echo "Running until manually stopped (Ctrl+C)"
fi
echo "Using prompt file: $PROMPT_FILE"
echo ""

# Function to run the agent
run_agent() {
    if [ "$AGENT" = "claude" ]; then
        cat "$PROMPT_FILE" | claude \
            -p \
            --dangerously-skip-permissions \
            --output-format=stream-json \
            --model opus \
            --verbose
    elif [ "$AGENT" = "codex" ]; then
        cat "$PROMPT_FILE" | codex exec \
            --dangerously-bypass-approvals-and-sandbox \
            --json \
            --model opus
    fi
}

# Main loop
while true; do
    ITERATION=$((ITERATION + 1))
    
    echo "========================================"
    echo "Iteration $ITERATION - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
    
    # Feed prompt to agent
    run_agent
    
    EXIT_CODE=$?
    
    # Check if agent failed
    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        echo "Error: Agent exited with code $EXIT_CODE"
        echo "Stopping loop"
        exit $EXIT_CODE
    fi
    
    # Push changes after each iteration
    echo ""
    echo "Pushing changes..."
    git push || echo "Warning: git push failed (may not have remote configured)"
    
    echo ""
    echo "Iteration $ITERATION complete"
    
    # Check max iterations
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo ""
        echo "Reached max iterations ($MAX_ITERATIONS)"
        echo "Stopping loop"
        exit 0
    fi
    
    echo ""
    echo "Starting next iteration in 2 seconds..."
    sleep 2
done
