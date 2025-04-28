import {
    LitElement,
    html,
    css
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";

class SixDegrees extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];
    if (!entity) {
      throw new Error(`Entity ${this.config.entity} not found`);
    }

    // Parse the sensor state and configured range
    const state = Number(entity.state);
    const min = this.config.min;
    const max = this.config.max;
    const range = max - min;
    if (range <= 0) {
      throw new Error('`max` must be greater than `min`');
    }

    // Normalize the state between 0 and 1, then scale to 6 degrees
    let normalized = (state - min) / range;
    let degree = Math.round(normalized * 6);

    // Clamp overflow and underflow
    if (degree < 0) {
      degree = 0;
      // Optional: throw error on underflow
      // throw new Error(`Value ${state} below minimum ${min}`);
    }
    if (degree > 6) {
      degree = 6;
      // Overflow states simply max out the indicator
    }

    const sensor = {
      state,
      degrees: degree
    };

    // Determine display name based on config
    const friendly = entity.attributes.friendly_name;
    if (this.config.name == null || this.config.name === true) {
      sensor.name = friendly.charAt(0).toUpperCase() + friendly.slice(1);
    } else if (this.config.name === false) {
      sensor.name = '';
    } else {
      sensor.name = this.config.name;
    }
    if (this.config.show_value) {
      sensor.name += sensor.name ? ` (${state})` : state;
    }

    // Determine header text
    if (this.config.title == null || this.config.title === true) {
      this.header = `Status för ${friendly.charAt(0).toUpperCase() + friendly.slice(1)}`;
    } else if (this.config.title) {
      this.header = this.config.title;
    }

    this.sensor = sensor;
  }

  _renderMinimalHtml() {
    return html`
      <ha-card>
        ${this.header ? html`<h1 class="card-header">${this.header}</h1>` : ''}
        ${this.config.title === false ? html`<p></p>` : ''}
        <div class="flex-container">
          <div class="sensor">
            <img class="box" src="${this.images[this.sensor.degrees + '_png']}" />
            <p>${this.sensor.name}</p>
          </div>
        </div>
      </ha-card>
    `;
  }

  render() {
    return html`${this._renderMinimalHtml()}`;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to specify an entity');
    }
    if (typeof config.min !== 'number' || typeof config.max !== 'number') {
      throw new Error('You need to specify both `min` and `max` as numbers');
    }
    this.config = config;

    // Preload images for each degree (0-6)
    this.images = {};
    // ... (assign your base64 image strings as before) ...
  }

  static get styles() {
    return css`
      .card-header { font-size: var(--header-font-size, 1.2em); margin-bottom: 0.5em; }
      .flex-container { display: flex; justify-content: center; align-items: center; }
      .sensor { text-align: center; }
      .box { width: 100px; height: auto; }
    `;
  }
}

customElements.define('six-degrees-card', SixDegrees);

