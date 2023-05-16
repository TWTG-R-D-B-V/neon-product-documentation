# LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the Pressure Gauge can be found.
The Pressure Sensor and Pressure Gauge use the same RT communication module and therefore their communication protocols are the same.

In case you have any technical question, or an issue to report please use the https://twtg.io/servicedesk.

## Overview table

This table gives an overview of the variants and versions.
The device identifier (DS-xx-xx-xx) can be found on the device label.

|                                                 | DS-RT-02-00 all firmware versions |
| ----------------------------------------------- | --------------------------------- |
| Protocol version                                | [1](./Protocol%20v1/)             |
| NEON Configurator                               | _coming soon_                     |
| LoRaWAN MAC (Layer-2) specification             | 1.0.4                             |
| LoRaWAN regional parameters (PHY) specification | RP2-1.0.1                         |
| LoRaWAN class                                   | A                                 |
| ISM bands                                       | EU868, AS923, US915               |
| Rapid Network Acquisition (US915)               | Yes                               |
| Default subband (US915)                         | NA / Rapid Network Acquisition    |

## Protocol version

The communication protocol depends on the device version and firmware version.

## Online configurator

The device is configurable over LoRaWAN.
To help generate a configuration, our NEON Configurator can be used.
This configurator is an online form with all possible settings within their allowed ranges.
After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.

## Conversion

The Pressure Gauge communicates over LoRaWAN using a binary protocol.
Usually the binary protocol is converted at the LoRa network server to an easier to handle format: JSON.

- encoding: from JSON to a binary string for the Pressure Gauge
- decoding: from a binary string from the Pressure Gauge to JSON

### Encoder / decoder

This folder contains Javascript files which can help with the conversion in for example the LoRa network server.
The scripts are compatible with all protocol versions.

The encoder/decoder script:

    codec_[type]_[generation timestamp]_[commit hash].js

- **type**: the device type abbreviation
- **generation timestamp**: the timestamp on which the codec script was generated
- **commit hash**: the commit hash of the source from which the codec was generated

### Conversion examples

Examples of uplink and downlink messages are available: [./Protocol v1/examples/](./Protocol%20v1/examples/).
The examples follow the [TS013-1.0.0 Payload Codec API](https://resources.lora-alliance.org/technical-specifications/ts013-1-0-0-payload-codec-api) specification.
The examples are in JSON, which is an arrays of messages with input and expected output when encoding/decoding.
JSON schemas for the JSON examples can be found here: https://github.com/TWTG-R-D-B-V/lorawan-payload-codec-tools/tree/main/schemas .

## Known issues

| Known issues | Effect | Effected serial numbers |
| ------------ | ------ | ----------------------- |
| NA           | NA     | NA                      |
