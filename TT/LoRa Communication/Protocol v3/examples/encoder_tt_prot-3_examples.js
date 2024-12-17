var encoder = require('../../encoder_tt_rev-4');

// protocol v3
var tt_AppPattern = {
  "header": { "message_type": "sensor_configuration", "protocol_version": 3 },
  "device_type": "tt",
  "sensor_type": "K",
  "temperature_measurement_interval_seconds": 30,
  "periodic_event_message_interval": 20,
  "events":
  [
    {
      "mode": "above",
      "threshold_temperature": 54.9,
      "measurement_window": 1
    },
    {
      "mode": "below",
      "threshold_temperature": -14.9,
      "measurement_window": 1
    },
    {
      "mode": "increasing",
      "threshold_temperature": 9.9,
      "measurement_window": 20
    },
    {
      "mode": "decreasing",
      "threshold_temperature": 9.9,
      "measurement_window": 20
    }
  ]
};

var ttDevice = {
  "header": { "message_type": "base_configuration", "protocol_version": 3 },
  "switch_mask": {
    "enable_confirmed_event_message": false
  },
  "communication_max_retries": 3,
  "number_of_unconfirmed_messages": 1,
  "periodic_message_random_delay_seconds": 60,
  "status_message_interval_seconds": 86400,
  "status_message_confirmed_interval": 1,
  "lora_failure_holdoff_count": 5,
  "lora_system_recover_count": 1,
  "lorawan_fsb_mask": ["0x00FF", "0x0000", "0x0000", "0x0000", "0x0001"]
};

var tt_ApplicationOfficial = {
  "header": { "message_type": "sensor_configuration", "protocol_version": 3 },
  "device_type": "tt",
  "sensor_type": "K",
  "temperature_measurement_interval_seconds": 900,
  "periodic_event_message_interval": 16,
  "events": [
    {
      "mode": "off",
      "threshold_temperature": 0,
      "measurement_window": 0,
    },
    {
      "mode": "off",
      "threshold_temperature": 0,
      "measurement_window": 0,
    },
    {
      "mode": "off",
      "threshold_temperature": 0,
      "measurement_window": 0,
    },
    {
      "mode": "off",
      "threshold_temperature": 0,
      "measurement_window": 0,
    },
  ],
};

function encode(tag, object) {
  console.log("#### " + tag)
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

console.log("")
console.log("### Encoding TT protocol v3")
console.log("")
console.log("Generated by:")
console.log("```")
console.log("nodejs ./examples/" + __filename.split('/').slice(-1)[0])
console.log("```")
console.log("")
encode("Device config message", ttDevice);
encode("Application config message", tt_ApplicationOfficial);
encode("Application config message (pattern)", tt_AppPattern);
