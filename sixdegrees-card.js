import {
    LitElement,
    html,
    css
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {
    Chart,
    ArcElement,
    DoughnutController,
    Tooltip,
    Legend
} from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";


// Chart.js registreren
Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

class SixDegrees extends LitElement {
    static get properties() {
        return {
            hass: { state: true },
            config: { type: Object },
        };
    }

    // --- Visual Editor support ---
    // Return the custom editor element for the visual editor
    static async getConfigElement() {
        // 1) Ladda in Lovelace-helpers
        const helpers = await window.loadCardHelpers();

        // 2) Skapa ett dummy-entities-kort för att få med ha-entity-picker
        const entCard = await helpers.createCardElement({
            type: 'entities',
            entities: []
        });
        await entCard.constructor.getConfigElement();

        // if (!customElements.get('mwc-icon-button')) {
        //   // Här är den korrekta sökvägen i Home Assistant
        //   await import('/frontend_latest/@material/mwc-icon-button.js?module');
        // }

        // 4) Vänta på och returnera vår egen editor
        await customElements.whenDefined('sixdegrees-card-editor');
        return document.createElement('sixdegrees-card-editor');
    }


    // Provide a stub/default configuration for the editor
    static getStubConfig() {
        return {
            // almost always present in HA
            entity:      'sensor.time',
            // we treat “time” as minutes 0–59
            min:           0,
            max:          60,
            // label under the chart
            name:        true,
            // header title
            title:       true,
            // append raw value in parentheses
            show_value:  true,

            // chart styling
            thickness:   60,
            gap:          5,
            colors: [
                "#ffeb3b",
                "#ffc107",
                "#ff9800",
                "#ff5722",
                "#e64a19",
                "#d32f2f"
            ],
            empty_color: "var(--divider-color)",
            gap_color:   "var(--card-background-color)",

            // Diameter i pixlar
            size:        100,
            decimals: 0
        };
    }




    setConfig(config) {
        if (!config.entity) {
            throw new Error("You need to specify an entity");
        }
        this.config = {
            entity: config.entity,
            min: config.min ?? 0,
            max: config.max ?? 6,
            name: config.name ?? true,
            title: config.title ?? true,
            show_value: config.show_value ?? false,
            colors:
            config.colors ?? [
                "#ffeb3b",
                "#ffc107",
                "#ff9800",
                "#ff5722",
                "#e64a19",
                "#d32f2f",
            ],
            gap_color: config.gap_color ?? "var(--card-background-color)",
            empty_color: config.empty_color ?? "var(--divider-color)",
            gap: config.gap ?? 5,
            thickness: config.thickness ?? 60,
            size: config.size ?? 100,
            decimals: config.decimals ?? 0
        };
    }

    set hass(hass) {
        this._hass = hass;
        this._updateSensor();
    }

    _updateSensor() {
        const entity = this._hass.states[this.config.entity];
        let val = Number(entity.state);

        // ── Om det inte är ett rent tal, försök tolka “HH:MM” som minuter ──
        if (isNaN(val) && typeof entity.state === 'string' && entity.state.includes(':')) {
            const parts = entity.state.split(':');
            // plocka ut minuterna, t.ex. "14:37" → 37
            val = Number(parts[1]);
        }

        // Beräkna fraktion och grader 0–6
        const span = this.config.max - this.config.min;
        const frac = (val - this.config.min) / span;
        const degs = Math.min(
            6,
            Math.max(0, Math.round(frac * 6))
        );

        // Bygg namn + titel som tidigare
        const friendly = entity.attributes.friendly_name || '';
        let name = '';
        if (this.config.name === true) {
            name = friendly;
        } else if (typeof this.config.name === 'string') {
            name = this.config.name;
        }
        if (this.config.show_value) {
            const num = Number(entity.state);
            // Om state är ett giltigt tal: formatera med rätt antal decimaler
            const txt = !isNaN(num)
                ? num.toFixed(this.config.decimals)
                : entity.state;
            name += name
                ? ` (${txt})`
                : txt;
        }

        let titleText = '';
        if (this.config.title === true) {
            titleText = `Status för ${friendly}`;
        } else if (typeof this.config.title === 'string') {
            titleText = this.config.title;
        }

        // Spara sensordata
        this.sensor = {
            degrees: degs,
            name,
            title: titleText
        };

        this._updateChart();
    }


    firstUpdated() {
        // --- Hämta ut verklig gap-färg
        let gapCol = this.config.gap_color;
        if (gapCol.startsWith("var(")) {
            const prop = gapCol.match(/var\((--[^)]+)\)/)[1];
            const val = getComputedStyle(this).getPropertyValue(prop).trim();
            if (val) gapCol = val;
        }
        this._gapColor = gapCol;

        // --- Hämta ut verklig empty-segment-färg
        let segCol = this.config.empty_color;
        if (segCol.startsWith("var(")) {
            const prop = segCol.match(/var\((--[^)]+)\)/)[1];
        const val = getComputedStyle(this).getPropertyValue(prop).trim();
        if (val) segCol = val;
        }
        this._emptySegmentColor = segCol;

        // Skapa chart
        const ctx = this.renderRoot.querySelector("canvas").getContext("2d");
        this._chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Array(6).fill(""),
                datasets: [{
                    data: Array(6).fill(1),
                    backgroundColor: Array(6).fill(this._emptySegmentColor),
                    borderColor:     Array(6).fill(this._gapColor),
                    borderWidth:     this.config.gap,
                }],
            },
            options: {
                rotation: -Math.PI / 2,                      // skarv uppåt
                cutout:   `${100 - this.config.thickness}%`, // tjocklek
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend:  { display: false },
                    tooltip: { enabled: false },
                },
            },
        });
        this._updateChart();
        }

_updateChart() {
    if (!this._chart) return;
    const bg = [];
    const bc = [];
    for (let i = 0; i < 6; i++) {
        // ifyllt vs ofyllt
        bg.push(i < this.sensor.degrees
            ? this.config.colors[i]
            : this._emptySegmentColor
        );
        // gap alltid gap-färg
        bc.push(this._gapColor);
    }
    this._chart.data.datasets[0].backgroundColor = bg;
    this._chart.data.datasets[0].borderColor     = bc;
    this._chart.data.datasets[0].borderWidth     = this.config.gap;
    this._chart.options.rotation = -Math.PI / 2; // återställ skarv-rotation
    this._chart.update();
}

render() {
    return html`
    <ha-card
      .header=${this.sensor.title || ''}
    >
      <div
        class="chart-wrapper"
        style="width:${this.config.size}px; height:${this.config.size}px;"
      >
        <canvas></canvas>
      </div>
      ${this.sensor.name
              ? html`<div class="sensor-label">${this.sensor.name}</div>`
              : ""}
    </ha-card>
  `;
}


static get styles() {
    return css`
    :host { display: block; }
    ha-card { padding: 16px; }

    .chart-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
    }

    .sensor-label {
      text-align: center;
      margin-top: 8px;
    }
  `;
}


getCardSize() {
    return 3;
}
}

customElements.define("sixdegrees-card", SixDegrees);

class SixdegreesCardEditor extends LitElement {
    static get properties() {
        return {
            _config: { type: Object },
            hass:    { type: Object },
        };
    }

    constructor() {
        super();
        // Starta med stub‐config som getStubConfig()
        this._config = SixDegrees.getStubConfig();
        this._defaults = SixDegrees.getStubConfig();
    }

    setConfig(config) {
        // Slå ihop användarens config med stub
        this._config = { ...SixDegrees.getStubConfig(), ...config };
    }

    set hass(hass) {
        this._hass = hass;
    }

    render() {
        // Om det mot förmodan inte finns någon config ännu, visa ingenting
        if (!this._config) {
            return html``;
        }

        // Säkerställ att colors är en array
        const colors = Array.isArray(this._config.colors) ? this._config.colors : [];

        return html`
    <div class="card-config">
      <!-- Entity -->
      <ha-formfield label="Entity">
      <ha-entity-picker
        allow-custom-entity
        .hass=${this._hass}
        .value=${this._config.entity}
        @value-changed=${e => this._updateConfig('entity', e.detail.value)}
      ></ha-entity-picker>
      </ha-formfield>



      <!-- Title (boolean|string) -->
      <ha-formfield label="Title (boolean | string)">
        <ha-textfield
          .value=${this._config.title === true ? '' : String(this._config.title)}
          placeholder="Leave empty for default, or type text/true/false"
          @input=${e => {
              const raw = e.target.value.trim().toLowerCase();
              let val;
              if (raw === '') {
                  val = true;
              } else if (raw === 'true') {
              val = true;
            } else if (raw === 'false') {
              val = false;
            } else {
              val = e.target.value;
            }
            this._updateConfig('title', val);
          }}
        ></ha-textfield>
      </ha-formfield>

      <!-- Size (px) -->
      <ha-formfield label="Size (px)">
        <ha-textfield
          type="number"
          .value=${this._config.size}
          @input=${e => this._updateConfig('size', Number(e.target.value))}
        ></ha-textfield>
      </ha-formfield>

      <!-- Name (boolean|string) -->
      <ha-formfield label="Name (boolean | string)">
        <ha-textfield
          .value=${this._config.name === true ? '' : String(this._config.name)}
          placeholder="Leave empty for default, or type text/true/false"
          @input=${e => {
              const raw = e.target.value.trim().toLowerCase();
              let val;
              if (raw === '') {
                  val = true;
              } else if (raw === 'true') {
              val = true;
            } else if (raw === 'false') {
              val = false;
            } else {
              val = e.target.value;
            }
            this._updateConfig('name', val);
          }}
        ></ha-textfield>
      </ha-formfield>

      <!-- Min value -->
      <ha-formfield label="Min value">
        <ha-textfield
          type="number"
          .value=${this._config.min}
          @input=${e => this._updateConfig('min', Number(e.target.value))}
        ></ha-textfield>
      </ha-formfield>

      <!-- Max value -->
      <ha-formfield label="Max value">
        <ha-textfield
          type="number"
          .value=${this._config.max}
          @input=${e => this._updateConfig('max', Number(e.target.value))}
        ></ha-textfield>
      </ha-formfield>

      <!-- Show value -->
      <ha-formfield label="Show value">
        <ha-switch
          .checked=${this._config.show_value}
          @change=${e => this._updateConfig('show_value', e.target.checked)}
        ></ha-switch>
      </ha-formfield>
      <!-- Decimal places (0–5) -->

    <ha-formfield label="Decimal places">
      <div class="slider-with-value">
        <ha-slider
          min="0" max="5" step="1"
          .value=${this._config.decimals}
          @input=${e => this._updateConfig('decimals', Number(e.target.value))}
        ></ha-slider>
        <span>${this._config.decimals}</span>
      </div>
    </ha-formfield>

      <!-- Thickness (%) -->
      <ha-formfield label="Thickness (%)">
        <div class="slider-with-value">
          <ha-slider
            min="10" max="90" step="1"
            .value=${this._config.thickness}
            @input=${e => this._updateConfig('thickness', Number(e.target.value))}
          ></ha-slider>
          <span>${this._config.thickness}</span>
        </div>
      </ha-formfield>

      <!-- Gap (px) -->
      <ha-formfield label="Gap (px)">
        <div class="slider-with-value">
          <ha-slider
            min="0" max="20" step="1"
            .value=${this._config.gap}
            @input=${e => this._updateConfig('gap', Number(e.target.value))}
          ></ha-slider>
          <span>${this._config.gap}</span>
        </div>
      </ha-formfield>

      <!-- Segment colors -->
      ${colors.map((col, i) => {
          const hexMatch = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(col) ? col : "#000000";
        return html`
              <ha-formfield label="Segment color ${i+1}">
              <div class="color-picker-row">
              <input
              type="color"
              .value=${hexMatch}
              @input=${e => this._updateConfigColor(i, e.target.value)}
              >
              <ha-textfield
              .value=${col}
              placeholder="#rrggbb or var(--…)"
              @input=${e => this._updateConfigColor(i, e.target.value)}
              ></ha-textfield>
              <ha-icon-button
              title="Reset to default"
              @click=${() => this._updateConfigColor(i, this._defaults.colors[i])}
              >
              <ha-icon icon="mdi:refresh"></ha-icon>
              </ha-icon-button>
              </div>
              </ha-formfield>`;
      })}

      <!-- Empty segment color -->
<ha-formfield label="Empty segment color">
  <div class="color-picker-row">
    <input
      type="color"
      .value=${/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(this._config.empty_color)
        ? this._config.empty_color
        : "#000000"
      }
      @input=${e => this._updateConfig('empty_color', e.target.value)}
    >
    <ha-textfield
      .value=${this._config.empty_color}
      placeholder="#rrggbb or var(--…)"
      @input=${e => this._updateConfig('empty_color', e.target.value)}
    ></ha-textfield>
    <ha-icon-button
      title="Reset to default"
      @click=${() => this._updateConfig('empty_color', this._defaults.empty_color)}
    >
      <ha-icon icon="mdi:refresh"></ha-icon>
    </ha-icon-button>
  </div>
</ha-formfield>

<!-- --- Gap color --- -->
<ha-formfield label="Gap color">
  <div class="color-picker-row">
    <input
      type="color"
      .value=${/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(this._config.gap_color)
        ? this._config.gap_color
        : "#000000"
      }
      @input=${e => this._updateConfig('gap_color', e.target.value)}
    >
    <ha-textfield
      .value=${this._config.gap_color}
      placeholder="#rrggbb or var(--…)"
      @input=${e => this._updateConfig('gap_color', e.target.value)}
    ></ha-textfield>
    <ha-icon-button
      title="Reset to default"
      @click=${() => this._updateConfig('gap_color', this._defaults.gap_color)}
    >
      <ha-icon icon="mdi:refresh"></ha-icon>
    </ha-icon-button>
  </div>
</ha-formfield>
    </div>
  `;
      }

          _updateConfig(prop, value) {
              const cfg = { ...this._config, [prop]: value };
              this._config = cfg;
              this.dispatchEvent(new CustomEvent('config-changed', {
                  detail: { config: cfg },
                  bubbles: true,
                  composed: true,
              }));
          }

          _updateConfigColor(index, value) {
              const cols = [...this._config.colors];
              cols[index] = value;
              this._updateConfig('colors', cols);
          }

          static get styles() {
              return css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    /* Alla formfields fyller ut bredden */
    ha-formfield {
      width: 100%;
      box-sizing: border-box;
    }

    /* Entity-pickern tar full bredd */
    ha-entity-picker {
      width: 100%;
      box-sizing: border-box;
    }

    /* Textfields fyller formfield-delen */
    ha-formfield > ha-textfield {
      width: 100%;
      box-sizing: border-box;
    }

    /* Sliders behåller sin flex-uppsättning */
    .slider-with-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .slider-with-value ha-slider {
      flex: 1;
      min-width: 150px;
    }
    .slider-with-value span {
      width: 3em;
      text-align: center;
    }

    /* Rad med färg-picker + textfält */
    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* native <input type="color"> */
    .color-picker-row input[type="color"] {
      border: none;
      width: 28px;
      height: 28px;
      padding: 0;
      background: none;
    }
    /* textfältet får växa */
    .color-picker-row ha-textfield {
      flex: 1;
    }

    .color-picker-row mwc-icon-button,
    .color-picker-row ha-icon-button {
      cursor: pointer;
      --mdc-icon-button-ink-color: var(--primary-text-color);
    }
    .color-picker-row mwc-icon-button:hover,
    .color-picker-row ha-icon-button:hover {
      opacity: 0.8;
  }

  `;
  }
}

  customElements.define('sixdegrees-card-editor', SixdegreesCardEditor);


  // --- Visual editor-registrering ---
  window.customCards = window.customCards || [];
  window.customCards.push({
      type: 'sixdegrees-card',
      name: 'Six Degrees Card',
      preview: true,
      description: 'Visualises a value 0–6 with a six-segment doughnut chart',
      documentationURL: 'https://github.com/krissen/sixdegrees-card'
  });

// vim: set ts=4 sw=4 et:
