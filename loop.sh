#!/bin/bash
set -euo pipefail

# Ralph Loop Script for GitPilot
# Usage:
#   ./loop.sh              # Run building mode (unlimited iterations)
#   ./loop.sh 20           # Run building mode (max 20 iterations)
#   ./loop.sh plan         # Run planning mode
#   ./loop.sh plan 5       # Run planning mode (max 5 iterations)

# Parse arguments
MODE="build"
PROMPT_FILE="PROMPT_build.md"
MAX_ITERATIONS=0

if [ $# -gt 0 ]; then
    if [ "$1" = "plan" ]; then
        MODE="plan"
        PROMPT_FILE="PROMPT_plan.md"
        MAX_ITERATIONS=${2:-0}
    elif [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS=$1
    fi
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

echo "Starting Ralph loop in $MODE mode..."
if [ $MAX_ITERATIONS -gt 0 ]; then
    echo "Max iterations: $MAX_ITERATIONS"
else
    echo "Running until manually stopped (Ctrl+C)"
fi
echo "Using prompt file: $PROMPT_FILE"
echo ""

# Main loop
while true; do
    ITERATION=$((ITERATION + 1))
    
    echo "========================================"
    echo "Iteration $ITERATION - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
    
    # Feed prompt to Claude
    cat "$PROMPT_FILE" | claude \
        -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model opus \
        --verbose
    
    EXIT_CODE=$?
    
    # Check if Claude failed
    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        echo "Error: Claude exited with code $EXIT_CODE"
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
