## LoRa Communication

In this folder all documentation and scripts related to LoRa communication of the Vibration Sensor can be found.

### Protocol version

The protocol version depends on the production batch of your product. The communication protocol documents and examples apply to products of a certain batch. The batch can be read from the serial number. The encoder / decoder are compatible with all protocol versions.

The current page is for the latest version. Other versions can be found via the following table.

| Batch  | LD serial number example  | VB serial number example  | Protocol version  |
|---|---|---|---:|
| AA  | LD 02 20 **AA** 00001 | VB 01 20 **AA** 00001 | VB protocol v3 |
| AB  | LD 02 21 **AA** 00001 | VB 01 21 **AB** 00001 | VB protocol v3 |

### Online configurator

The device is configurable over LoRaWAN. To help generate a configuration, our [NEON Configurator](https://neon-configurator.twtg.io/neon/vb/v2/) can be used. This configurator is an online form with all possible settings within their allowed ranges. After tailoring the settings to your application you can then generate a LoRaWAN message to be sent via your network server.

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

	[encoder/decoder]_[type]_doc-[doc]_rev-[rev].js

- **type**: the sensor type abbreviation
- **doc**: the communication protocol document version
- **rev**: the revision number of improvements of the scripts

#### Conversion examples

The examles below are generated using the example Javascript files in the example folder using [nodejs](https://nodejs.org/) (a Linux application to execute Javascript files).

##### Encoding
###### Base config message (Default)
JSON:
```json
{
    "config_update_req": {
        "config_type": "base",
        "protocol_version": 3,
        "tag": "0x096c4970",
        "payload": {
            "switch_mask": {
                "enable_confirmed_event_message": true,
                "enable_confirmed_data_message": true,
                "allow_deactivation": true
            },
            "periodic_message_random_delay_seconds": 31,
            "status_message_interval": "5 days"
        }
    }
}
```
Bytestring (hexidecimal):
```
3070496c0907ff
```
Bytestring (base64):
```
MHBJbAkH/w==
```
###### Base config message (No payload)
JSON:
```json
{
    "config_update_req": {
        "config_type": "base",
        "protocol_version": 3
    }
}
```
Bytestring (hexidecimal):
```
30
```
Bytestring (base64):
```
MA==
```
###### Base config message (Alternative)
JSON:
```json
{
    "config_update_req": {
        "config_type": "base",
        "protocol_version": 3,
        "tag": "0x00000000",
        "payload": {
            "switch_mask": {
                "enable_confirmed_event_message": true,
                "enable_confirmed_data_message": false,
                "allow_deactivation": true
            },
            "periodic_message_random_delay_seconds": 17,
            "status_message_interval": "2 days"
        }
    }
}
```
Bytestring (hexidecimal):
```
300000000005d1
```
Bytestring (base64):
```
MAAAAAAF0Q==
```
###### Sensor config message (Default)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor",
        "protocol_version": 3,
        "tag": "0xfd77daf2",
        "payload": {
            "device_type": "vb",
            "switch_mask": {
                "selection": "avg_only"
            },
            "measurement_interval_minutes": 15,
            "periodic_event_message_interval": 16,
            "frequency_range": {
                "rms_velocity": "range_2",
                "peak_acceleration": "range_2"
            }
        }
    }
}
```
Bytestring (hexidecimal):
```
33f2da77fd06030f100003
```
Bytestring (base64):
```
M/Lad/0GAw8QAAM=
```
###### Sensor config message (No payload)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor",
        "protocol_version": 3
    }
}
```
Bytestring (hexidecimal):
```
33
```
Bytestring (base64):
```
Mw==
```
###### Sensor config message (Alternative)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor",
        "protocol_version": 3,
        "tag": "0x00000000",
        "payload": {
            "device_type": "vb",
            "switch_mask": {
                "selection": "extended"
            },
            "measurement_interval_minutes": 15,
            "periodic_event_message_interval": 16,
            "frequency_range": {
                "rms_velocity": "range_1",
                "peak_acceleration": "range_2"
            }
        }
    }
}
```
Bytestring (hexidecimal):
```
330000000006000f100002
```
Bytestring (base64):
```
MwAAAAAGAA8QAAI=
```
###### Sensor conditions config message (Default)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_conditions",
        "protocol_version": 3,
        "tag": "0x83327baf",
        "payload": {
            "device_type": "vb",
            "event_conditions": [
                {
                    "mode": "off"
                },
                {
                    "mode": "off"
                },
                {
                    "mode": "off"
                },
                {
                    "mode": "off"
                },
                {
                    "mode": "off"
                },
                {
                    "mode": "off"
                }
            ]
        }
    }
}
```
Bytestring (hexidecimal):
```
35af7b32830600000000000000000000
```
Bytestring (base64):
```
Na97MoMGAAAAAAAAAAAAAA==
```
###### Sensor conditions config message (No Payload)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_conditions",
        "protocol_version": 3
    }
}
```
Bytestring (hexidecimal):
```
35
```
Bytestring (base64):
```
NQ==
```
###### Sensor conditions config message (Alternative)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_conditions",
        "protocol_version": 3,
        "tag": "0x00000000",
        "payload": {
            "device_type": "vb",
            "event_conditions": [
                {
                    "mode": "rms_velocity_x",
                    "mode_value": 0
                },
                {
                    "mode": "peak_acceleration_x",
                    "mode_value": 0.5
                },
                {
                    "mode": "rms_velocity_y",
                    "mode_value": 0.4
                },
                {
                    "mode": "peak_acceleration_y",
                    "mode_value": 0.1
                },
                {
                    "mode": "peak_acceleration_z",
                    "mode_value": 0.3
                }
            ]
        }
    }
}
```
Bytestring (hexidecimal):
```
35000000000600100520043001400360
```
Bytestring (base64):
```
NQAAAAAGABAFIAQwAUADYA==
```
###### Sensor data config message (Default)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_data",
        "protocol_version": 3,
        "tag": "0xeec823eb",
        "payload": {
            "device_type": "vb",
            "calculation_trigger": {
                "on_event": false,
                "on_threshold": false,
                "on_button_press": false
            },
            "calculation_interval": 1440,
            "fragment_message_interval": 60,
            "threshold_window": 10,
            "trigger_thresholds": [
                {
                    "unit": "velocity",
                    "frequency": 0,
                    "magnitude": 0
                },
                {
                    "unit": "velocity",
                    "frequency": 0,
                    "magnitude": 0
                },
                {
                    "unit": "velocity",
                    "frequency": 0,
                    "magnitude": 0
                },
                {
                    "unit": "velocity",
                    "frequency": 0,
                    "magnitude": 0
                },
                {
                    "unit": "velocity",
                    "frequency": 0,
                    "magnitude": 0
                }
            ],
            "selection": {
                "axis": "z",
                "resolution": "low_res",
                "enable_hanning_window": false
            },
            "frequency": {
                "span": {
                    "velocity": {
                        "start": 3,
                        "stop": 126
                    },
                    "acceleration": {
                        "start": 61,
                        "stop": 4096
                    }
                },
                "resolution": {
                    "velocity": 1,
                    "acceleration": 2
                }
            },
            "scale": {
                "velocity": 1,
                "acceleration": 40
            }
        }
    }
}
```
Bytestring (hexidecimal):
```
34eb23c8ee0600a0053c000500000000000000000000000000000000000000000203007e003d00001001022134
```
Bytestring (base64):
```
NOsjyO4GAKAFPAAFAAAAAAAAAAAAAAAAAAAAAAAAAAACAwB+AD0AABABAiE0
```
###### Sensor data config message (No payload)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_data",
        "protocol_version": 3
    }
}
```
Bytestring (hexidecimal):
```
34
```
Bytestring (base64):
```
NA==
```
###### Sensor data config message (Alternative)
JSON:
```json
{
    "config_update_req": {
        "config_type": "sensor_data",
        "protocol_version": 3,
        "tag": "0x00000000",
        "payload": {
            "device_type": "vb",
            "calculation_trigger": {
                "on_event": false,
                "on_threshold": false,
                "on_button_press": false
            },
            "calculation_interval": 5,
            "fragment_message_interval": 60,
            "threshold_window": 10,
            "trigger_thresholds": [
                {
                    "unit": "velocity",
                    "frequency": 1,
                    "magnitude": 2
                },
                {
                    "unit": "velocity",
                    "frequency": 3,
                    "magnitude": 4
                },
                {
                    "unit": "velocity",
                    "frequency": 5,
                    "magnitude": 6
                },
                {
                    "unit": "velocity",
                    "frequency": 7,
                    "magnitude": 8
                },
                {
                    "unit": "velocity",
                    "frequency": 9,
                    "magnitude": 10
                }
            ],
            "selection": {
                "axis": "z",
                "resolution": "low_res",
                "enable_hanning_window": false
            },
            "frequency": {
                "span": {
                    "velocity": {
                        "start": 3,
                        "stop": 126
                    },
                    "acceleration": {
                        "start": 61,
                        "stop": 4096
                    }
                },
                "resolution": {
                    "velocity": 1,
                    "acceleration": 2
                }
            },
            "scale": {
                "velocity": 1,
                "acceleration": 40
            }
        }
    }
}
```
Bytestring (hexidecimal):
```
3400000000060005003c00050200c800060090010a0058020e0020031200e8030203007e003d00001001022134
```
Bytestring (base64):
```
NAAAAAAGAAUAPAAFAgDIAAYAkAEKAFgCDgAgAxIA6AMCAwB+AD0AABABAiE0
```

##### Decoding

Generated by:
```
nodejs examples/decoder-vb-examples.js
```

###### Boot message
Bytestring (hexidecimal):
```
310103
```
JSON:
```json
{
    "boot": {
        "base": {
            "reboot_reason": {
                "major": "config update",
                "minor": "success"
            }
        },
        "sensor": {
            "reboot_reason": {
                "major": "button reset",
                "minor": ""
            }
        },
        "protocol_version": 3
    }
}
```
###### Activated message
Bytestring (hexidecimal):
```
3506080102030405
```
JSON:
```json
{
    "activated": {
        "sensor": {
            "device_type": "vb",
            "device_id": "8-0067305985"
        },
        "base": {
            "device_type": "ld"
        },
        "protocol_version": 3
    }
}
```
###### Deactivated message
Bytestring (hexidecimal):
```
360200
```
JSON:
```json
{
    "deactivated": {
        "reason": "activation_sensor_comm_fail",
        "protocol_version": 3
    }
}
```
###### Device status message
Bytestring (hexidecimal):
```
327515030002060107
```
JSON:
```json
{
    "device_status": {
        "base": {
            "battery_voltage": 2.9176470588235293,
            "temperature": 21,
            "lora_tx_counter": 3,
            "avg_rssi": "-100..-129",
            "bist": "0x06"
        },
        "sensor": {
            "event_counter": 1,
            "bist": "0x07"
        },
        "protocol_version": 3
    }
}
```
###### Sensor event message
Bytestring (hexidecimal):
```
3300950100d20488130200d30487130300d40486130400d50485130500d60484130600d704831361f0d204401f
```
JSON:
```json
{
    "sensor_event": {
        "selection": "extended",
        "condition_0": 1,
        "condition_1": 0,
        "condition_2": 1,
        "condition_3": 0,
        "condition_4": 1,
        "condition_5": 0,
        "trigger": "button press",
        "rms_velocity": {
            "x": {
                "min": 0.01,
                "max": 12.34,
                "avg": 50
            },
            "y": {
                "min": 0.02,
                "max": 12.35,
                "avg": 49.99
            },
            "z": {
                "min": 0.03,
                "max": 12.36,
                "avg": 49.98
            }
        },
        "acceleration": {
            "x": {
                "min": 0.04,
                "max": 12.37,
                "avg": 49.97
            },
            "y": {
                "min": 0.05,
                "max": 12.38,
                "avg": 49.96
            },
            "z": {
                "min": 0.06,
                "max": 12.39,
                "avg": 49.95
            }
        },
        "temperature": {
            "min": -39.99,
            "max": 12.34,
            "avg": 80
        },
        "protocol_version": 3
    }
}
```
###### Sensor data message
Bytestring (hexidecimal):
```
342b994406020102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728
```
JSON:
```json
{
    "sensor_data": {
        "config": {
            "frame_number": 43,
            "sequence_number": 1,
            "axis": "z",
            "unit": "acceleration",
            "scale": 4,
            "start_frequency": 200,
            "spectral_line_frequency": 2
        },
        "raw": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
            40
        ],
        "frequency": [
            5924.536800000001,
            5927.792040000001,
            5931.047280000001,
            5934.302520000001,
            5937.557760000001,
            5940.813000000001,
            5944.0682400000005,
            5947.323480000001,
            5950.57872,
            5953.833960000001,
            5957.0892,
            5960.344440000001,
            5963.599680000001,
            5966.854920000001,
            5970.110160000001,
            5973.365400000001,
            5976.620640000001,
            5979.8758800000005,
            5983.131120000001,
            5986.38636,
            5989.641600000001,
            5992.89684,
            5996.152080000001,
            5999.407320000001,
            6002.662560000001,
            6005.917800000001,
            6009.173040000001,
            6012.428280000001,
            6015.6835200000005,
            6018.938760000001,
            6022.194,
            6025.449240000001,
            6028.70448,
            6031.959720000001,
            6035.214960000001,
            6038.470200000001,
            6041.725440000001,
            6044.980680000001,
            6048.235920000001,
            6051.4911600000005
        ],
        "magnitude": [
            0.01568627450980392,
            0.03137254901960784,
            0.047058823529411764,
            0.06274509803921569,
            0.0784313725490196,
            0.09411764705882353,
            0.10980392156862745,
            0.12549019607843137,
            0.1411764705882353,
            0.1568627450980392,
            0.17254901960784313,
            0.18823529411764706,
            0.20392156862745098,
            0.2196078431372549,
            0.23529411764705882,
            0.25098039215686274,
            0.26666666666666666,
            0.2823529411764706,
            0.2980392156862745,
            0.3137254901960784,
            0.32941176470588235,
            0.34509803921568627,
            0.3607843137254902,
            0.3764705882352941,
            0.39215686274509803,
            0.40784313725490196,
            0.4235294117647059,
            0.4392156862745098,
            0.4549019607843137,
            0.47058823529411764,
            0.48627450980392156,
            0.5019607843137255,
            0.5176470588235295,
            0.5333333333333333,
            0.5490196078431373,
            0.5647058823529412,
            0.5803921568627451,
            0.596078431372549,
            0.611764705882353,
            0.6274509803921569
        ],
        "protocol_version": 3
    }
}
```
###### Base config answer
Bytestring (hexidecimal):
```
37123456780b
```
JSON:
```json
{
    "config_update_ans": {
        "protocol_version": 3,
        "config_type": "unknown",
        "tag": "0x78563412",
        "counter": 11
    }
}
```
###### Region config answer
Bytestring (hexidecimal):
```
37123456780c
```
JSON:
```json
{
    "config_update_ans": {
        "protocol_version": 3,
        "config_type": "unknown",
        "tag": "0x78563412",
        "counter": 12
    }
}
```
###### Sensor config answer
Bytestring (hexidecimal):
```
37123456780e
```
JSON:
```json
{
    "config_update_ans": {
        "protocol_version": 3,
        "config_type": "unknown",
        "tag": "0x78563412",
        "counter": 14
    }
}
```
###### Sensor conditions config answer
Bytestring (hexidecimal):
```
37123456780f
```
JSON:
```json
{
    "config_update_ans": {
        "protocol_version": 3,
        "config_type": "unknown",
        "tag": "0x78563412",
        "counter": 15
    }
}
```