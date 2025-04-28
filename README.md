# sixdegrees-card

Lovelace card, like a gauge but only in six degrees. As seen in [pollenprognos-card](https://github.com/krissen/pollenprognos-card/).

<img width="356" alt="notitle_value_name" src="https://user-images.githubusercontent.com/2943684/235319743-46b39731-06b7-4f53-8879-b7f1d10e5a6f.png">

## Install with HACS

Add <https://github.com/krissen/sixdegrees-card/> as a custom integration.
See more info: <https://hacs.xyz/docs/faq/custom_repositories>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)  

## Options

| Name            | Type                 | Default                                                   | Description                                                                                                            |
| --------------- | -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **type**        | string               | **Required**                                              | Must be `custom:sixdegrees-card`.                                                                                      |
| **entity**      | string               | **Required**                                              | The sensor entity to display (e.g. `sensor.pollen_level`).                                                             |
| **min**         | integer              | **Required**                                              | Minimum sensor value for the 6-segment scale.                                                                          |
| **max**         | integer              | **Required**                                              | Maximum sensor value for the 6-segment scale.                                                                          |
| **title**       | string \| boolean    | `true`                                                    | Header title. Use a string to hard-code, `true` to auto-generate from entity’s friendly name, or `false` to hide.     |
| **name**        | string \| boolean    | `true`                                                    | Label below the graphic. Use a string to hard-code, `true` to use entity’s friendly name, or `false` to hide.         |
| **show_value**  | boolean              | `false`                                                   | When `true`, appends the raw sensor value to the `name`.                                                               |
| **colors**      | string[]             | `["#ffeb3b","#ffc107","#ff9800","#ff5722","#e64a19","#d32f2f"]` | Array of 6 CSS colors for the filled segments, in order from segment 1 to 6.                                            |
| **empty_color** | string               | `"var(--card-background-color)"`                                           | CSS color for the unfilled segments. Can also be a CSS variable (e.g. `var(--primary-background-color)`).             |
| **gap**         | integer              | `5`                                                       | Border width (in pixels) between segments. Increase for a more pronounced gap.                                         |
| **thickness** | integer | 60 | Thickness of the segments, where 20 would be very thin and 90 rather pie-like.

## Examples

<table>
 <tr>
  <td>Custom colors</td>
  <td><img width="149" alt="Custom colors" src="https://github.com/user-attachments/assets/655f66f9-a6f3-44a2-a6cf-48aed45a7fe9" />
</td>
  <td>
   
   ```yaml
   type: custom:sixdegrees-card
entity: sensor.0000021c6bae3410_update_count
min: 0
max: 1800
show_value: true
title: false
name: false
gap: 5
thickness: 90
colors:
  - "#800080"  # Purple
  - "#00FF00"  # Green
  - "#A52A2A"  # Brown
  - "#FFFFFF"  # White
  - "#000000"  # Black
  - "#FF0000"  # Red
```
  </td>
 </tr>
<tr>
<td>Title, value, no name</td>
<td><img width="358" alt="title_value_noname" src="https://user-images.githubusercontent.com/2943684/235320322-3ffce258-437e-47a0-af76-9ec99fe82d21.png"></td>
<td>

```yaml
 - type: 'custom:sixdegrees-card'
    entity: sensor.fibaro_luminance_hall_uppe
    title: "Ljus, uppe"
    name: false
    show_value: true
    min: 0
    max: 60
```

</td>
</tr>
<tr>
<td>No title, with value and name</td>
<td><img width="356" alt="notitle_value_name" src="https://user-images.githubusercontent.com/2943684/235320239-5111e606-3b30-49e7-bb6e-fbe56b7058f4.png"></td>
<td>

```yaml
  - type: 'custom:sixdegrees-card'
    entity: sensor.fibaro_luminance_hall_uppe
    title: false
    name: "Uppe"
    show_value: true
    min: 0
    max: 60
```

</td></tr>
<tr>
<td>Mixed with/without title, value, and name. Using `horizontal-stack` and `vertical-stack` (light)</td>
<td style="vertical-align: top;"><img width="431" alt="horizontal_vertical_mixed--light" src="https://user-images.githubusercontent.com/2943684/235320397-94545297-1115-43b5-947e-7176ecaa49b4.png"></td>
<td>

```yaml
 - type: vertical-stack
    title: Six degrees of
    cards:
      - type: horizontal-stack
        cards:
          - type: 'custom:sixdegrees-card'
            entity: sensor.ljusniva
            title: false
            name: false
            show_value: false
            min: 0
            max: 5
          - type: 'custom:sixdegrees-card'
            entity: sensor.fibaro_luminance_hall_uppe
            title: false
            name: false
            show_value: false
            min: 0
            max: 60
          - type: 'custom:sixdegrees-card'
            entity: sensor.fibaro_luminance_hall_nere
            title: false
            name: false
            show_value: false
            min: 0
            max: 60
      - type: horizontal-stack
        cards:
          - type: 'custom:sixdegrees-card'
            entity: sensor.ljusniva
            title: false
            show_value: false
            min: 0
            max: 5
          - type: 'custom:sixdegrees-card'
            entity: sensor.fibaro_luminance_hall_uppe
            title: false
            name: "Lux"
            show_value: true
            min: 0
            max: 60
          - type: 'custom:sixdegrees-card'
            entity: sensor.fibaro_luminance_hall_nere
            title: false
            name: false
            show_value: true
            min: 0
            max: 60
    - type: horizontal-stack
        cards:
          - type: 'custom:sixdegrees-card'
            entity: sensor.pollen_forshaga_ambrosia
            title: false
            show_value: true
            min: 0
            max: 5
      - type: horizontal-stack
        cards:
          - type: 'custom:sixdegrees-card'
            entity: sensor.pollen_forshaga_al
            title: false
            show_value: true
            min: 0
            max: 5
          - type: 'custom:sixdegrees-card'
            entity: sensor.pollen_forshaga_gras
            title: false
            show_value: true
            min: 0
            max: 5
          - type: 'custom:sixdegrees-card'
            entity: sensor.pollen_forshaga_bjork
            title: false
            name: "Björk"
            show_value: true
            min: 0
            max: 7
```

</td>
</tr>
</table>

## Credits

Using gauges from [pollen-card](https://github.com/nidayand/lovelace-pollen-card) by @nidayand , who in turn rewrote @isabellaalstrom's [pollenprognos-card](https://github.com/isabellaalstrom/lovelace-pollenprognos-card).
