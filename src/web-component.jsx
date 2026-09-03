import ReactDom from "react-dom/client";
import { Widget } from "./components/Widget";

export const normalizeAttribute = (attribute) => {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
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

    const props = {};
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value;
    }
    this.root.render(<Widget {...props} />);
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
