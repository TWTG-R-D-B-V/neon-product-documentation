## LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the specific product can be found. 

### Protocol version

The protocol version depends on the production batch of your product. The communication protocol documents and examples apply to products of a certain batch. The batch can be read from the serial number. The encoder / decoder are compatible with all protocol versions.

| Batch  | Serial number example  | Protocol version  |
|---|---|---:|
| AA  | TT 01 20 **AA** 00001 | [TT protocol v2](protocol_v2) |
| AB  | TT 01 21 **AB** 00001 | [TT protocol v3](protocol_v3) |

### Conversion

The sensor communicates over LoRaWAN using a binary protocol. Usally the binary protocol is converted at the LoRa network server to a easier to handle format: JSON.

- encoding: from JSON to a binary string for to the sensor
- decoding: from a binary string from the sensor to JSON

#### Encoder / decoder

This folder contains Javascript files can help with the conversion, for example in the LoRa network server. The scripts are known to be compatible with the following network servers:

- [ChirpStack](https://www.chirpstack.io/)
- [The Things Network](https://www.thethingsnetwork.org/)


The encoder/decoder script names are postfixed with version information: 

	[encoder/decoder]_[type]_doc-[doc]_rev-[rev].js

- **type**: the sensor type abbreviation
- **doc**: the communication protocol document version
- **rev**: the revision number of improvements of the scripts

#### Conversion examples

See the following README(s) for conversion examples.
- [protocol v2 examples](protocol_v2/README.md)
- [protocol v3 examples](protocol_v3/README.md)
 