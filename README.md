# Nexx Widget

Embeddable React feedback widget packaged as a web component.

## Embed

```html
<script type="module" src="/path/to/widget.js"></script>

<my-widget project-id="1"></my-widget>
```

By default the widget auto-themes realistically from the host page and uses
the page styles as its default UI:

- **Surface & text** – the panel mirrors the page's background (solid colors and
  gradients, light and dark pages) and text color.
- **Brand color** – the launcher, icon, submit button, stars and links use the
  page's real accent/brand color, detected from CSS brand variables and from
  actual buttons/CTAs (ghost buttons and faint tints are ignored).
- **Readable contrast** – text drawn on the accent is automatically black or
  white, whichever has the higher contrast.
- **Font & radius** – inherited from the page's typography and control radius.
- **Strong adaptive border** – a 2px border that flips between white and dark
  based on the page background so the widget always stands out.

Every auto-detected value can still be overridden with the attributes below.

## Customization

All settings are optional.

```html
<my-widget
  project-id="1"
  accent-color="#0f766e"
  accent-contrast="#ffffff"
  surface-color="#ffffff"
  text-color="#111827"
  muted-color="#667085"
  radius="10px"
  font-family="Inter, system-ui, sans-serif"
  position="right-middle"
  button-label="Write a review"
  title="Send us your feedback"
  description="Tell us what worked and what should improve."
  success-title="Feedback received"
  success-message="Thanks for helping us improve this page."
  brand-name="Your Brand"
  brand-url="https://example.com"
  default-rating="4"
></my-widget>
```

Supported positions: `right-middle`, `left-middle`, `bottom-right`, `bottom-left`,
`top-right`, `top-left`.
