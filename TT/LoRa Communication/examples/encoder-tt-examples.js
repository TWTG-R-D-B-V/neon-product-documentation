var encoder = require('../encoder_tt_prot-2_doc-C_rev-0.js');

var ttAppPattern = {
  "header": { "message_type": "application_configuration", "protocol_version": 2 },
  "device_type": "tt",
  "enable_rtd": false,
  "temperature_measurement_interval_seconds": 1,
  "periodic_event_message_interval": 2,
  "events":
    [
      {
        "mode": "above",
        "threshold_temperature": 0.03,
        "measurement_window": 7
      },
      {
        "mode": "below",
        "threshold_temperature": 0.04,
        "measurement_window": 8
      },
      {
        "mode": "increasing",
        "threshold_temperature": 0.05,
        "measurement_window": 9
      },
      {
        "mode": "decreasing",
        "threshold_temperature": 0.06,
        "measurement_window": 10
      }
    ]
};

var ttDeviceEU868 = {
  "header": { "message_type": "device_configuration", "protocol_version": 2 },
  "switch_mask": {
    "enable_confirmed_event_message": true,
    "enable_rtd": false,
  },
  "communication_max_retries": 3,
  "unconfirmed_repeat": 2,
  "periodic_message_random_delay_seconds": 60,
  "status_message_interval_seconds": 86400,
  "status_message_confirmed_interval": 1,
  "lora_failure_holdoff_count": 2,
  "lora_system_recover_count": 1,
  "lorawan_fsb_mask": [0, 0, 0, 0, 0],
};

var ttDeviceUS915 = {
  "header": { "message_type": "device_configuration", "protocol_version": 2 },
  "switch_mask": {
    "enable_confirmed_event_message": true,
    "enable_rtd": false,
  },
  "communication_max_retries": 3,
  "unconfirmed_repeat": 2,
  "periodic_message_random_delay_seconds": 60,
  "status_message_interval_seconds": 86400,
  "status_message_confirmed_interval": 1,
  "lora_failure_holdoff_count": 2,
  "lora_system_recover_count": 1,
  "lorawan_fsb_mask": [0x00FF, 0x0000, 0x0000, 0x0000, 0x0002],
};

var ttApplicationOfficial = {
  "header": { "message_type": "application_configuration", "protocol_version": 2 },
  "device_type": "tt",
  "temperature_measurement_interval_seconds": 900,
  "periodic_event_message_interval": 16,
  "events":
    [
      {
        "mode": "off",
        "threshold_temperature": 0,
        "measurement_window": 0
      },
      {
        "mode": "off",
        "threshold_temperature": 0,
        "measurement_window": 0
      },
      {
        "mode": "off",
        "threshold_temperature": 0,
        "measurement_window": 0
      },
      {
        "mode": "off",
        "threshold_temperature": 0,
        "measurement_window": 0
      }
    ]
};

function encode(tag, object) {
  console.log("###### " + tag)
  console.log("JSON:")
  console.log("```")
  console.log(JSON.stringify(object, null, 4))
  console.log("```")
  bytestring = Buffer.from(encoder.Encode(15, object))
  console.log("Bytestring (hexidecimal):")
  console.log("```")
  console.log(bytestring.toString('hex'))
  console.log("```")
}


console.log("##### Encoding")
encode("Device config message (EU868)", ttDeviceEU868);
encode("Device config message (US915)", ttDeviceUS915);
encode("Application config message", ttApplicationOfficial);
encode("Application config message (pattern)", ttAppPattern);


