---
name: responsive-ui
description: Transforms or builds a desktop-first UI to be responsive and mobile-friendly.
---

# Responsive UI Skill

When building or reviewing frontend UI components, apply these responsive design and mobile-first principles:

## 1. Grid and Flexbox
- Use CSS Flexbox or Grid for layouts to ensure they seamlessly reflow on smaller screens.
- Avoid hardcoded widths (`width: 500px`). Prefer relative units (`%`, `vw/vh`) or `max-width`.

## 2. Media Queries
- Implement standard breakpoints for mobile (`< 768px`), tablet (`768px - 1024px`), and desktop (`> 1024px`).
- Stack columns on mobile (e.g., change `flex-direction: row` to `flex-direction: column`).

## 3. Touch Targets & Usability
- Ensure buttons and interactive elements are large enough for touch screens (minimum 44x44 pixels).
- Add adequate spacing (margin/padding) between clickable elements to prevent accidental clicks.

## 4. Navigation
- Convert top horizontal navigation bars into drawer menus (hamburger menus) or bottom navigation bars on mobile devices.
- Ensure the state of the navigation menu is easily toggled and accessible.

## 5. Typography and Spacing
- Scale down font sizes on smaller screens to prevent text from overwhelming the interface.
- Reduce paddings and margins on containers to maximize usable screen real estate on mobile devices.

## 6. Testing Responsive Design
- Always inspect the component in browser dev tools simulating mobile devices (like iPhone 12/13 or Pixel).
- Verify that no horizontal scrolling occurs un-intentionally (`overflow-x: hidden` on body or containers often helps).
