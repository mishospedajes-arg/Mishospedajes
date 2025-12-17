name: "PRP for Interactive SVG Map Feature"
description: |
  This PRP outlines the implementation of an interactive SVG map component in a Next.js application, featuring zoom/pan controls, animated interactions, and dynamic data loading.

## Purpose
To create a rich, interactive map experience for users, allowing them to explore a floor plan, view details about specific zones, and interact with points of interest.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats.
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix.
3. **Information Dense**: Use keywords and patterns from the codebase.
4. **Progressive Success**: Start simple, validate, then enhance.

---

## Goal
Build a responsive and interactive web component that displays an SVG-based map in section /mapa. The component should support zoom and pan functionality, highlight zones on hover, and display informational cards on click, with smooth animations for all interactions.

## Why
- **Business value**: Enhance user engagement by providing an intuitive and visually appealing way to navigate spatial data.
- **User impact**: Allow users to easily understand layouts and access information about specific areas without leaving the map view.
- **Problems this solves**: Replaces static images with a dynamic, interactive experience that is more informative and engaging.

## What
A Next.js project with a primary component (`InteractiveMap`) that integrates `react-zoom-pan-pinch` for navigation . The map will render an SVG with distinct, interactive zones and data-driven pins.

### Success Criteria
- [ ] Map component renders correctly with the SVG background.
- [ ] Zoom and pan functionality works smoothly on desktop and mobile.
- [ ] Zones highlight on hover with a visual effect (e.g., drop shadow, scale).
- [ ] Clicking a zone or pin opens an animated information cards from chalets.
- [ ] All interactive elements are accessible via keyboard.
- [ ] The component is responsive and functions across different screen sizes.

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://www.npmjs.com/package/react-zoom-pan-pinch
  why: Core library for zoom/pan functionality. Need to understand TransformWrapper and TransformComponent props.
- url: https://nextjs.org/docs
  why: General Next.js architecture and component structure.
- url: https://www.w3.org/TR/SVG2/
  why: Reference for SVG structure, especially <defs>, <filter>, <path>, and <g> elements.
- url: https://github.com/gregberge/svgr
  why: For converting SVG files into React components.
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: react-zoom-pan-pinch can sometimes conflict with page scroll.
// Use onZoomStart/onZoomEnd to conditionally disable body scroll.

// CRITICAL: SVGR-generated components should be memoized to prevent unnecessary re-renders.
```
