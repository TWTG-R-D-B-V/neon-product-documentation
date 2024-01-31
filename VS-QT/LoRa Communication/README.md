# LoRa Communication

In this folder, all documentation and scripts related to LoRa communication of the NEON quarter-turn Valve Sensor can be found.

In case you have any technical questions, or an issue to report please use the https://twtg.io/servicedesk.

## Overview table

This table gives an overview of the variants and versions.

|                                                 | All VS-QT devices                                     |
| ----------------------------------------------- | ----------------------------------------------------- |
| Protocol version                                | 2                                                     |
| NEON Configurator                               | [link](https://neon-configurator.twtg.io/neon/qt/v2/) |
| LoRaWAN MAC (Layer-2) specification             | 1.0.2                                                 |
| LoRaWAN regional parameters (PHY) specification | 1.0.2revB                                             |
| LoRaWAN class                                   | A                                                     |
| ISM bands                                       | EU868, AS923, US915                                   |
| Rapid Network Acquisition (US915/ AU915)        | No                                                    |
| Default subband (US915/ AU915)                  | Subband 1 (first 8 channels), others on request       |

### Online configurator

The device is configurable over LoRaWAN. To help generate a configuration, our NEON Configurator can be used.
This configurator is an online form with all possible settings within their allowed ranges.
After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.
