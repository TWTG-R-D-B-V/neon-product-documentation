# LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the Vibration Sensor can be found.

## Overview table

This table gives an overview of the variants and versions.
The device identifier (DS-xx-xx-xx) can be found on the device label.

|                                                 | DS-LD-01-xx with DS-VB-01-xx for all firmware versions | DS-LD-02-00 with DS-VB-02-00 for all firmware versions |
| ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| Protocol version                                | [2](./Protocol%20v2/)                                  | [3](./Protocol%20v3/)                                  |
| NEON Configurator                               | [link](https://neon-configurator.twtg.io/neon/vb/v2/)  | [link](https://neon-configurator.twtg.io/neon/vb/v3/)  |
| LoRaWAN MAC (Layer-2) specification             | 1.0.2                                                  | 1.0.4                                                  |
| LoRaWAN regional parameters (PHY) specification | 1.0.2revB                                              | RP2-1.0.4                                              |
| LoRaWAN class                                   | A                                                      | A                                                      |
| ISM bands                                       | EU868, AS923                                           | US915                                                  |

## Protocol version

The communication protocol depends on the device version and firmware version.

## Online configurator

The device is configurable over LoRaWAN.
To help generate a configuration, our NEON Configurator can be used.
This configurator is an online form with all possible settings within their allowed ranges.
After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.

## Conversion

The Vibration Sensor communicates over LoRaWAN using a binary protocol.
Usually the binary protocol is converted at the LoRa network server to an easier to handle format: JSON.

- encoding: from JSON to a binary string for the Vibration Sensor
- decoding: from a binary string from the Vibration Sensor to JSON

### Encoder / decoder

This folder contains Javascript files which can help with the conversion in for example the LoRa network server.
The scripts are compatible with all protocol versions.

The encoder/decoder script names are postfixed with version information:

    [encoder/decoder]_[type]_rev-[rev].js

- **type**: the sensor type abbreviation
- **rev**: the revision number of improvements of the scripts

### Conversion examples

Per protocol version examples are available for using the encoder and decoder.
The use of the encoder and decoder are demonstrated using the following commands:

```
nodejs ./Protocol\ v2/examples/encoder_vb_prot-2_examples.js

nodejs ./Protocol\ v2/examples/decoder_vb_prot-2_examples.js

nodejs ./Protocol\ v3/examples/encoder_vb_prot-3_examples.js

nodejs ./Protocol\ v3/examples/decoder_vb_prot-3_examples.js
```

## Known issues

| Known issues                                     | Effect                                                                                                         | Effected serial numbers        |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Incorrect sequence number in sensor data message | 1. The sequence number will constantly be two.<br /> 2. The sequence number will wrap to a not expected value. | VB0120AA00001 to VB0120AA00216 |

Contact support.neon@twtg.io for further information.
