/*
 * Six Degrees Card
 *
 * Configuration Options:
 *
 * type (string, required):
 *   - Value: "custom:sixdegrees-card"
 *   - Description: Card type identifier.
 *
 * entity (string, required):
 *   - Description: Entity ID to display (e.g., sensor.pollen_level).
 *
 * min (integer, required):
 *   - Description: Minimum sensor value for segment calculation.
 *
 * max (integer, required):
 *   - Description: Maximum sensor value for segment calculation.
 *
 * title (string|boolean, optional):
 *   - Default: true
 *   - Description: Custom card header title. Use a string to set a fixed title, true to generate from entity's friendly name, or false to hide.
 *
 * name (string|boolean, optional):
 *   - Default: true
 *   - Description: Custom label below segments. Use a string to set a fixed name, true to use entity's friendly name, or false to hide.
 *
 * show_value (boolean, optional):
 *   - Default: false
 *   - Description: When true, appends the raw sensor value to the name.
 *
 * colors (string[], optional):
 *   - Description: Array of six hex color codes, one for each segment (indices 0–5).
 *   - Default Gradient Array:
 *     ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026']
 *
 * filled_color (string, optional):
 *   - Description: Single hex code to fill all active segments if 'colors' is not provided.
 *
 * empty_color (string, optional):
 *   - Default: 'transparent'
 *   - Description: Color for inactive (empty) segments.
 *
 * border_color (string, optional):
 *   - Default: 'var(--divider-color, #ddd)'
 *   - Description: Color or CSS variable for segment borders.
 *
 * Examples:
 *
 * 1. Default configuration (uses gradient colors):
 *
 *    type: 'custom:sixdegrees-card'
 *    entity: 'sensor.pollen_level'
 *    min: 0
 *    max: 180
 *    colors: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026']
 *    show_value: true
 *
 * 2. Custom single fill color:
 *
 *    filled_color: '#00ff00'
 *
 * 3. Custom color array:
 *
 *    colors: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4']
 */
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

  setConfig(config) {
    console.log('sixdegrees CONFIG.colors 👉', config.colors);
    if (!config.entity) {
      throw new Error('You need to specify an entity');
    }
    if (typeof config.min !== 'number' || typeof config.max !== 'number') {
      throw new Error('You need to specify both `min` and `max` as numbers');
    }

    // Default gradient from yellow to red in six steps
    const defaultColors = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];

    // Determine per-segment fill colors: priority - `colors` array, then single `filled_color`, then default gradient
    let segmentColors;
    if (Array.isArray(config.colors) && config.colors.length >= 6) {
      segmentColors = config.colors.slice(0, 6);
    } else if (config.filled_color) {
      segmentColors = Array(6).fill(config.filled_color);
    } else {
      segmentColors = defaultColors;
    }

    // Optional general styles
    this.config = {
      ...config,
      segmentColors,
      empty_color: config.empty_color || 'transparent',
      border_color: config.border_color || 'var(--divider-color, #ddd)'
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];
    if (!entity) {
      throw new Error(`Entity ${this.config.entity} not found`);
    }

    const state = Number(entity.state);
    const min = this.config.min;
    const max = this.config.max;
    const range = max - min;
    if (range <= 0) {
      throw new Error('`max` must be greater than `min`');
    }

    // Normalize and clamp between 0 and 6 segments
    let normalized = (state - min) / range;
    let degrees = Math.round(normalized * 6);
    degrees = Math.min(6, Math.max(0, degrees));

    const friendly = entity.attributes.friendly_name || this.config.entity;
    let name = '';
    if (this.config.name == null || this.config.name === true) {
      name = friendly.charAt(0).toUpperCase() + friendly.slice(1);
    } else if (this.config.name === false) {
      name = '';
    } else {
      name = this.config.name;
    }
    if (this.config.show_value) {
      name += name ? ` (${state})` : String(state);
    }

    if (this.config.title == null || this.config.title === true) {
      this.header = `Status för ${friendly.charAt(0).toUpperCase() + friendly.slice(1)}`;
    } else if (this.config.title) {
      this.header = this.config.title;
    }

    this.sensor = { state, degrees, name };
    this.requestUpdate();
  }

  render() {
    const { segmentColors, empty_color, border_color } = this.config;
    return html`
      <ha-card>
        ${this.header ? html`<h1 class="card-header">${this.header}</h1>` : ''}
        <div class="flex-container">
          <div class="sensor">
            <div class="segments">
              ${[0,1,2,3,4,5].map(i => html`
                <div
                  class="segment"
                  style="background: ${i < this.sensor.degrees ? segmentColors[i] : empty_color}; border: 1px solid ${border_color};"
                ></div>
              `)}
            </div>
            <p>${this.sensor.name}</p>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .card-header { font-size: var(--header-font-size, 1.2em); margin-bottom: 0.5em; }
      .flex-container { display: flex; justify-content: center; align-items: center; }
      .sensor { text-align: center; }
      .segments { display: flex; gap: 4px; margin: 0.5em 0; }
      .segment {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }
    `;
  }
}

customElements.define('sixdegrees-card', SixDegrees);

