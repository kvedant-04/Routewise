---
phase: 9
plan: 3
wave: 2
depends_on: [".gsd/phases/9/02-components.md"]
files_modified: [
  "d:\Routewise\frontend\src\index.css"
]
autonomous: true
user_setup: []

must_haves:
  truths:
    - "The Stitch AI Design System is applied natively."
    - "Component transitions follow the 200ms ease specification."
    - "Glassmorphism cards glow on hover and display clean typography."
  artifacts: []
---

# Plan 9.3: Stitch AI UI Upgrade & Styling

<objective>
Adopt premium visual aesthetics by styling the normalized data components using Stitch AI design tokens. This ensures not only functional data but a high-end SaaS look-and-feel.

Purpose: Implement 200ms transitions, glowing active elements, elevated hover cards, and clean typographical hierarchies.
Output: Upgraded `index.css` and associated aesthetic classes.
</objective>

<context>
Load for context:
- d:\Routewise\frontend\src\index.css
</context>

<tasks>

<task type="auto">
  <name>Implement Stitch AI Enhancements</name>
  <files>d:\Routewise\frontend\src\index.css</files>
  <action>
    Add CSS tokens for glassmorphism elevated states, ensuring cards have 200ms `ease-luxury` transitions upon hover, and add glow effects to active elements. Define clean, legible typography for the new badges like `cost` and `notes`. Apply these explicitly to List cards, Timeline blocks, Calendar blocks, and Map popups.
    AVOID: Hardcoding magic numbers outside of the root token structure.
  </action>
  <verify>UI complies with visually defined dark-mode glass styling.</verify>
  <done>The visual aesthetic feels responsive, animated out correctly, and premium.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `.glass:hover` and related element glows are present.
- [ ] Component transitions feel liquid and rapid.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
