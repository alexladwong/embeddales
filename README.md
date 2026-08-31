# Nexx Widget

Embeddable React feedback widget packaged as a web component.

## Embed

```html
<script type="module" src="/path/to/widget.js"></script>

<my-widget project-id="1"></my-widget>
```

By default, the widget samples the host page's font, text color, background,
brand/accent color, and border radius so it fits the surrounding UI.

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
