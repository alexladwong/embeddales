import ReactDom from "react-dom/client";
import { Widget } from "./components/Widget";

export const normalizeAttribute = (attribute) => {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

const TRANSPARENT_COLORS = new Set([
  "transparent",
  "rgba(0, 0, 0, 0)",
  "rgba(0,0,0,0)",
]);

const isUsableColor = (value) => value && !TRANSPARENT_COLORS.has(value.trim().toLowerCase());

const getComputedColor = (element, property) => {
  if (!element || !window.getComputedStyle) return "";
  return window.getComputedStyle(element).getPropertyValue(property).trim();
};

const findSurfaceColor = () => {
  const candidates = [document.body, document.documentElement];

  for (const element of candidates) {
    const color = getComputedColor(element, "background-color");
    if (isUsableColor(color)) return color;
  }

  return "#ffffff";
};

const findAccentColor = () => {
  const cssVariables = [
    "--accent-color",
    "--brand-color",
    "--primary-color",
    "--color-primary",
    "--theme-primary",
  ];

  for (const variable of cssVariables) {
    const value = getComputedColor(document.documentElement, variable);
    if (isUsableColor(value)) return value;
  }

  const candidates = Array.from(
    document.querySelectorAll("button, a, [role='button'], input[type='submit']")
  );

  for (const element of candidates) {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.getPropertyValue("background-color").trim();
    const color = styles.getPropertyValue("color").trim();

    if (element.tagName === "A" && isUsableColor(color)) return color;
    if (isUsableColor(backgroundColor)) return backgroundColor;
  }

  return "#2563eb";
};

const findRadius = () => {
  const candidates = Array.from(
    document.querySelectorAll("button, input, textarea, [role='button'], .card, [class*='card']")
  );

  for (const element of candidates) {
    const radius = getComputedColor(element, "border-radius");
    if (radius && radius !== "0px") return radius;
  }

  return "12px";
};

const getPageTheme = () => {
  if (typeof window === "undefined") return {};

  const bodyStyles = window.getComputedStyle(document.body);
  const rootStyles = window.getComputedStyle(document.documentElement);

  return {
    accentColor: findAccentColor(),
    surfaceColor: findSurfaceColor(),
    textColor: bodyStyles.getPropertyValue("color").trim() || "#111827",
    mutedColor: rootStyles.getPropertyValue("--muted-color").trim() || "#6b7280",
    radius: findRadius(),
    fontFamily:
      bodyStyles.getPropertyValue("font-family").trim() ||
      rootStyles.getPropertyValue("font-family").trim() ||
      "Inter, ui-sans-serif, system-ui, sans-serif",
  };
};

class WidgetWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.root = null;
  }

  connectedCallback() {
    if (!this.root) {
      this.root = ReactDom.createRoot(this.shadowRoot);
    }
    this.renderWidget();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.renderWidget();
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  renderWidget() {
    if (!this.root) return;

    const props = this.getPropsFromAttributes();
    this.root.render(<Widget {...props} pageTheme={getPageTheme()} />);
  }

  getPropsFromAttributes() {
    const props = {};
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value;
    }
    return props;
  }

  static get observedAttributes() {
    return [
      "accent-color",
      "accent-contrast",
      "surface-color",
      "text-color",
      "muted-color",
      "radius",
      "font-family",
      "position",
      "button-label",
      "title",
      "description",
      "success-title",
      "success-message",
      "brand-name",
      "brand-url",
      "default-rating",
      "project-id",
    ];
  }
}

export default WidgetWebComponent;
