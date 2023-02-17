## LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the Vibration Sensor can be found.

### Protocol version

The protocol version depends on the production batch of your product. The communication protocol documents and examples apply to products of a certain batch. The batch can be read from the serial number. The encoder / decoder are compatible with all protocol versions.

The current page is for the latest version. Other versions can be found via the following table.

| Batch  | LD serial number example  | VB serial number example  | Protocol version  |
|---|---|---|---:|
| AA  | LD 01 20 **AA** 00001 | VB 01 20 **AA** 00001 | [TT protocol v2](legacy/protocol_v2) |
| AB  | LD 01 21 **AA** 00001 | VB 01 21 **AB** 00001 | [TT protocol v2](legacy/protocol_v2) |
| AA  | LD 02 22 **AA** 00001 | VB 02 22 **AA** 00001 | VB protocol v3 |

### Online configurator

The device is configurable over LoRaWAN. To help generate a configuration, our [NEON Configurator](https://neon-configurator.twtg.io/neon/vb/v3/) can be used. This configurator is an online form with all possible settings within their allowed ranges. After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.

### Conversion

The Vibration Sensor communicates over LoRaWAN using a binary protocol. Usually the binary protocol is converted at the LoRa network server to an easier to handle format: JSON.

- encoding: from JSON to a binary string for to the Vibration Sensor
- decoding: from a binary string from the Vibration Sensor to JSON

#### Known issues
| Known issues  | Effect    | Effected serial numbers   |
|-              |-          |-                          |
| Incorrect sequence number in sensor data message | 1. The sequence number will constantly be two.<br /> 2. The sequence number will wrap to a not expected value. | VB0120AA00001 to VB0120AA00216 |

Contact support.neon@twtg.io for futher information.

#### Encoder / decoder

This folder contains Javascript files can help with the conversion in for example the LoRa network server. The scripts are known to be compatible with the following network servers:

- [ChirpStack](https://www.chirpstack.io/)
- [The Things Network](https://www.thethingsnetwork.org/)


The encoder/decoder script names are postfixed with version information: 

	[encoder/decoder]_[type]_rev-[rev].js

- **type**: the sensor type abbreviation
- **rev**: the revision number of improvements of the scripts

#### Conversion examples

The examples below are generated using the example Javascript files in the example folder using [nodejs](https://nodejs.org/) (a Linux application to execute Javascript files).

*Conversion examples will be added soon*