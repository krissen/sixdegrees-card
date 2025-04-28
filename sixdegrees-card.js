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
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._updateSensor();
  }

  _updateSensor() {
    const entity = this._hass.states[this.config.entity];
    const val = Number(entity.state);
    const frac = (val - this.config.min) / (this.config.max - this.config.min);
    const degs = Math.min(6, Math.max(0, Math.round(frac * 6)));

    const friendly = entity.attributes.friendly_name || "";
    let name = "";
    if (this.config.name === true) {
      name = friendly;
    } else if (typeof this.config.name === "string") {
      name = this.config.name;
    }
    if (this.config.show_value) {
      name += name ? ` (${entity.state})` : `${entity.state}`;
    }

    let titleText = "";
    if (this.config.title === true) {
      titleText = `Status för ${friendly}`;
    } else if (typeof this.config.title === "string") {
      titleText = this.config.title;
    }

    this.sensor = {
      degrees: degs,
      name,
      title: titleText,
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
      <ha-card>
        ${this.sensor.title
          ? html`<div class="card-header">${this.sensor.title}</div>`
          : ""}
        <div class="chart-wrapper"><canvas></canvas></div>
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
      .card-header {
        margin: 0 0 4px 0;
        font-size: var(--paper-font-headline_-_font-size);
        color: var(--primary-text-color);
      }
      .chart-wrapper {
        position: relative;
        width: 100%;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .sensor-label {
        text-align: center;
        margin-top: 8px;
        color: var(--secondary-text-color);
      }
    `;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("sixdegrees-card", SixDegrees);

