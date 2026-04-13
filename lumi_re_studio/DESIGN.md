# Design System Documentation

## 1. Overview & Creative North Star: "The Nocturnal Editor"

This design system is built for the "Build-in-Public" era—a high-fidelity, tool-first environment where utility meets editorial elegance. It moves away from the generic "SaaS dashboard" look toward a **Nocturnal Editor** aesthetic: a focused, immersive workspace that feels like a premium darkroom for digital creators.

The "Figma/Raycast" influence is executed through high-density UI components, sharp focus states, and a layout that prioritizes content over chrome. By utilizing intentional asymmetry, oversized display typography, and tonal layering, we move beyond templates into a bespoke digital craft experience.

---

## 2. Colors & Surface Philosophy

The palette is rooted in deep obsidian tones, punctuated by a luminous Amber accent that signifies action and focus.

### Surface Hierarchy & Tonal Layering
We do not use lines to define space; we use light.
- **Surface Dim (`#131315`):** The canvas. Used for the main application background.
- **Surface Container Lowest (`#0e0e10`):** Used for "recessed" areas like sidebars or utility panels to create a sense of architectural depth.
- **Surface Container High (`#2a2a2c`):** Used for interactive elements or elevated cards that need to "float" above the workspace.

### The "No-Line" Rule
Explicitly prohibit 1px solid borders for sectioning. Boundaries between the navigation, sidebar, and workspace must be defined solely through background color shifts. If a section needs to stand out, shift its background from `surface` to `surface-container-low`.

### The "Glass & Gradient" Rule
Floating overlays—such as command palettes, tooltips, or dropdowns—must use **Glassmorphism**. Apply a semi-transparent `surface-container-highest` with a `backdrop-blur` of 12px–20px. 
*   **Signature Texture:** Primary CTAs should use a subtle linear gradient from `primary` (`#ffc174`) to `primary-container` (`#f59e0b`) to provide a tactile, "lit from within" quality.

---

## 3. Typography: Editorial Authority

The system uses a dual-font strategy to balance utility with high-impact storytelling.

*   **Display & Headlines (Epilogue):** Used for slide content and major section headers. Epilogue’s geometric weight provides an authoritative, editorial feel. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for high-impact carousel headlines.
*   **UI & Metadata (Inter):** Used for the interface, labels, and inputs. Inter provides maximum legibility at small scales. 
*   **Contrast as Hierarchy:** Create drama by pairing `display-md` headlines with extremely small `label-sm` metadata in `text-muted` (`#A1A1AA`). This "Big/Small" contrast is the hallmark of premium design.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Stack containers to create "natural lift." Place a `surface-container-highest` card on a `surface-container-low` section. The contrast in value creates a soft, sophisticated edge.
*   **Ambient Shadows:** For floating elements (menus/modals), use extra-diffused shadows.
    *   *Shadow:* `0px 24px 48px -12px rgba(0, 0, 0, 0.5)`
*   **The "Ghost Border" Fallback:** Where containment is strictly required for accessibility, use a **Ghost Border**. This is a 1px stroke using `outline-variant` at 15% opacity. Never use 100% opaque borders.
*   **Focus States:** Use the Amber accent (`primary_container`) as a 2px outer glow (`blur: 4px`) to mimic a "lit" physical switch.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), `on-primary` text, `xl` (0.75rem) roundedness.
*   **Secondary/Ghost:** No fill. `ghost-border` on rest. Subtle `surface-bright` fill on hover.
*   **Interaction:** On press, scale the button to 98% to provide tactile feedback.

### Input Fields
*   **Styling:** `surface-container-lowest` background with a `ghost-border`. 
*   **Typography:** Use `body-md` for user input and `label-md` for persistent labels.
*   **State:** On focus, the border transitions to a subtle Amber glow.

### The "Canvas" Card (Carousel Slide)
*   **Forbid Dividers:** Do not use lines to separate slide elements. Use vertical white space (from the `xl` spacing scale) to create groupings.
*   **Edge Treatment:** Slides should use `xl` (0.75rem) rounded corners to feel like physical cards.

### Command Palette (Raycast Style)
*   **Styling:** Centered modal, `surface-container-highest` with 80% opacity and 24px backdrop-blur.
*   **Search Input:** No border, oversized `title-lg` typography for immediate focus.

---

## 6. Do's and Don'ts

### Do
*   **Do** use intentional asymmetry in carousel layouts to keep the "Build-in-Public" content feeling fresh and non-templated.
*   **Do** use `text-muted` for secondary information to keep the UI from feeling cluttered.
*   **Do** leverage the `full` (9999px) roundedness for status chips and toggle tracks.

### Don't
*   **Don't** use pure black (`#000000`). Use `surface-dim` (`#131315`) to maintain "inkiness" while allowing for depth.
*   **Don't** use standard blue for links. Use the Amber `primary` color or a clean `FAFAFA` underline.
*   **Don't** use "Drop Shadows" on cards. Use background color steps (Tonal Layering) instead.
*   **Don't** use 100% white for text. Use `FAFAFA` (Text Primary) to reduce eye strain in dark environments.