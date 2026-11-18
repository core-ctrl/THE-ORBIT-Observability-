# Accessibility (a11y) Evaluation (accessibility.md)

Evaluated according to WCAG 2.1 AA specifications.

## Findings
| Issue Type | Element Snippet | Recommended Fix |
| :--- | :--- | :--- |
| `input_missing_label` | `<input readonly="" class="w-full bg-zinc-900/60 border border-white/10 rounded-lg px-3.5 p` | Add explicit `aria-label` or `<label>` |
| `input_missing_label` | `<select class="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5` | Add explicit `aria-label` or `<label>` |
