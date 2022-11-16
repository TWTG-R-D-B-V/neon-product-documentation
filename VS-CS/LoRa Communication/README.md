## LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the specific product can be found. 

### Conversion

The sensor communicates over LoRaWAN using a binary protocol. Usually the binary protocol is converted at the LoRa network server to a easier to handle format: JSON.

- encoding: from JSON to a binary string for the sensor
- decoding: from a binary string from the sensor to JSON

#### Encoder / decoder

This folder contains Javascript files which can help with the conversion, for example in the LoRa network server. The scripts are known to be compatible with the following network servers:

- [ChirpStack](https://www.chirpstack.io/)
- [The Things Network](https://www.thethingsnetwork.org/)


The encoder/decoder script names are postfixed with version information: 

	[encoder/decoder]_[type]_doc-[doc]_rev-[rev].js

- **type**: the sensor type abbreviation
- **doc**: the communication protocol document version
- **rev**: the revision number of improvements of the scripts

