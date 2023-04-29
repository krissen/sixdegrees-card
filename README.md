# sixdegrees-card
Lovelace card, like a gauge but only in six degrees. As seen in [pollenprognos-card](https://github.com/krissen/pollenprognos-card/).

<img width="356" alt="notitle_value_name" src="https://user-images.githubusercontent.com/2943684/235319743-46b39731-06b7-4f53-8879-b7f1d10e5a6f.png">

## Install with HACS

Add https://github.com/krissen/sixdegrees-card/ as a custom integration.
See more info: https://hacs.xyz/docs/faq/custom_repositories

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)  

## Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:sixdegrees-card`
| entity | string | **Required** | Entity (sensor) to show
| min | integer | **Required** | Minimal value of entity (sensor). Used to calculate degrees.
| max | integer | **Required** | Maximum value of entity (sensor).  Used to calculate degrees.
| title | string | **Optional** | Custom title if string, boolean value if generated or not to show. Default is generated text based of entity's friendly name.
| name | string | **Optional** |  Custom name below image if string, boolean value if generated or not to show. Default is entity's friendly name.
| show_value | boolean | **Optional** | If value of sensor is to be shown below image.

## Examples

<table>
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
