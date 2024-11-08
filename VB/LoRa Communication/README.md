# LoRa Communication

In this folder, all documentation and scripts related to LoRa communication of the Vibration Sensor can be found.

In case you have any technical questions, or an issue to report please use the https://twtg.io/servicedesk.

## Overview table

This table gives an overview of the variants and versions.
The device identifier (DS-xx-xx-xx) can be found on the device label.
The production batch can be found in the serial number (LD 01 20 **AA** 00001).

|                                                 | DS-LD-01-xx with DS-VB-01-xx for all firmware versions | DS-LD-01-03 with DS-VB-01-03 production batch AD and higher | DS-LD-02-00 with DS-VB-02-00 from production batch AA until and including batch AD | DS-LD-02-00 with DS-VB-02-00 from production batch AF and DS-LD-xx-xx with DS-VB-xx-xx after firmware update |
| ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------      | ------------------------------------------------------ | ------------------------------------------------------ |
| Protocol version| [2](./Protocol%20v2/) | [3](./Protocol%20v3/) | [3](./Protocol%20v3/) | [4](./Protocol%20v4/) |
| NEON Configurator                               | [link](https://neon-configurator.twtg.io/neon/vb/v2/)  | [link](https://neon-configurator.twtg.io/neon/vb/v3/)       | [link](https://neon-configurator.twtg.io/neon/vb/v3/)  | [link](https://neon-configurator.twtg.io/neon/vb/v4/)  |
| LoRaWAN MAC (Layer-2) specification             | 1.0.2 | 1.0.4 | 1.0.4 |1.0.4 |
| LoRaWAN regional parameters (PHY) specification | 1.0.2revB | RP2-1.0.1 | RP2-1.0.1 | RP2-1.0.3 |
| LoRaWAN class                                   | A      | A | A | A and B|
| ISM bands                                       | EU868, AS923| AS923| US915, AU915, AS923 (on request), EU868 (on request) | EU868, US915, AS923, AU915|
| Rapid Network Acquisition (US915/ AU915)        | NA | NA | Yes | Yes |
| Default subband (US915/ AU915)                  | NA | NA | NA / Rapid Network Acquisition | NA / Rapid Network Acquisition |

## Protocol version

The communication protocol depends on the device version and firmware version.

## Online configurator

The device is configurable over LoRaWAN.
To help generate a configuration, our NEON Configurator can be used.
This configurator is an online form with all possible settings within their allowed ranges.
After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.

## Conversion

The Vibration Sensor communicates over LoRaWAN using a binary protocol.
Usually, the binary protocol is converted at the LoRa network server to an easier-to-handle format: JSON.

- encoding: from JSON to a binary string for the Vibration Sensor
- decoding: from a binary string from the Vibration Sensor to JSON

### Encoder / decoder

Each folder contains the respective Javascript files which can help with the conversion in, for example, the LoRa network server.

For protocols v2 and v3, the encoder/decoder script names are postfixed with version information:

    [encoder/decoder]_[type]_rev-[rev].js

- **type**: the sensor type abbreviation
- **rev**: the revision number of improvements of the scripts

For protocol v4, the codec script names are postfixed with the version information:

    [type]-[format]-[rev].js

- **type**: the sensor type and protocol version abbreviation
- **format**: script in plain or minified format
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
