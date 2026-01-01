# Product Guidelines - GitPilot

## Tone & Voice
- **Friendly & Casual**: The interface and documentation should feel approachable and easy to use, reducing the intimidation of bulk operations.
- **Developer-Centric**: Language should be technically accurate and direct, respecting the user's expertise while maintaining a helpful demeanor.

## Visual Design Principles
- **Clean & Minimal**: Prioritize data clarity and ease of navigation using whitespace and a modern aesthetic.
- **High Contrast for Actions**: Use clear visual distinction between standard operations and destructive actions (like repository deletion) to prevent accidental loss.
- **Brand Consistency**: Adhere to established brand colors and typography to provide a professional and cohesive user experience.

## Error Handling & Feedback
- **Unobtrusive Notifications**: Use toasts or inline messages for non-critical updates and small errors to keep the workflow fluid.
- **Detailed Technical Context**: When errors occur, provide enough technical detail (such as API status codes or specific failure reasons) to help developers self-diagnose and resolve issues.

## Interaction Patterns
- **Standard Confirmation**: Destructive actions should trigger a clear confirmation modal ("Are you sure?") to ensure intentionality.
- **Silent Execution with Revert**: Where technically feasible (e.g., visibility toggles), allow for swift execution with a temporary "Undo" or "Revert" option to maintain momentum while providing a safety net.
