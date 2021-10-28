var encoder = require('../../../encoder_vb_doc-E_rev-3.js');

var baseEU868 = {
  "header": { "message_type": "base_configuration", "protocol_version": 1 },
  "switch_mask": {
    "enable_confirmed_event_message": true,
    "enable_confirmed_data_message": false,
    "allow_deactivation": true
  },
  "communication_max_retries": 3,
  "unconfirmed_repeat": 1,
  "periodic_message_random_delay_seconds": 60,
  "status_message_interval_seconds": 86400,
  "status_message_confirmed_interval": 1,
  "lora_failure_holdoff_count": 2,
  "lora_system_recover_count": 1,
  "lorawan_fsb_mask": ["0x0000", "0x0000", "0x0000", "0x0000", "0x0000"]
};

var baseUS915 = {
  "header": { "message_type": "base_configuration", "protocol_version": 1 },
  "switch_mask": {
    "enable_confirmed_event_message": true,
    "enable_confirmed_data_message": false,
    "allow_deactivation": true
  },
  "communication_max_retries": 3,
  "unconfirmed_repeat": 1,
  "periodic_message_random_delay_seconds": 60,
  "status_message_interval_seconds": 86400,
  "status_message_confirmed_interval": 1,
  "lora_failure_holdoff_count": 2,
  "lora_system_recover_count": 1,
  "lorawan_fsb_mask": ["0x00FF", "0x0000", "0x0000", "0x0000", "0x0000"]
};

var sensorConfigDefault = {
  "header": { "message_type": "sensor_configuration", "protocol_version": 1 },
  "device_type": "vb",
  "measurement_interval_seconds": 900,
  "periodic_event_message_interval": 16,
  "frequency_range": {
    "rms_velocity": "range_2",
    "peak_acceleration": "range_2"
  },
  "events":
    [
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      }
    ]
};

var sensorConfigAlternative = {
  "header": { "message_type": "sensor_configuration", "protocol_version": 1 },
  "device_type": "vb",
  "measurement_interval_seconds": 3600,
  "periodic_event_message_interval": 1,
  "frequency_range": {
    "rms_velocity": "range_2",
    "peak_acceleration": "range_1"
  },
  "events":
    [
      {
        "mode": "rms_velocity_x",
        "mode_value": 0.05
      },
      {
        "mode": "rms_velocity_y",
        "mode_value": 99.99
      },
      {
        "mode": "peak_acceleration_z",
        "mode_value": 0.01
      },
      {
        "mode": "peak_acceleration_x",
        "mode_value": 200.00
      },
      {
        "mode": "off",
        "mode_value": 0
      },
      {
        "mode": "off",
        "mode_value": 0
      }
    ]
};

var sensorDataConfigDefault = {
  "header": { "message_type": "sensor_data_configuration", "protocol_version": 1 },
    "device_type": "vb",
    "calculation_trigger": {
        "on_event": false,
        "on_threshold": false,
        "on_button_press": false
    },
    "calculation_interval": 0,
    "fragment_message_interval": 14400,
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
        "enable_hanning_window": true
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
        "velocity": 4,
        "acceleration": 40
    }
};

var sensorDataConfigDefault = {
  "header": { "message_type": "sensor_data_configuration", "protocol_version": 1 },
    "device_type": "vb",
    "calculation_trigger": {
        "on_event": false,
        "on_threshold": false,
        "on_button_press": false
    },
    "calculation_interval": 0,
    "fragment_message_interval": 14400,
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
        "enable_hanning_window": true
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
        "velocity": 4,
        "acceleration": 40
    }
};

var sensorDataConfigAlternative = {
  "header": { "message_type": "sensor_data_configuration", "protocol_version": 1 },
    "device_type": "vb",
    "calculation_trigger": {
        "on_event": false,
        "on_threshold": true,
        "on_button_press": true
    },
    "calculation_interval": 0,
    "fragment_message_interval": 14400,
    "threshold_window": 10,
    "trigger_thresholds": [
        {
            "unit": "velocity",
            "frequency": 100,
            "magnitude": 200
        },
        {
            "unit": "acceleration",
            "frequency": 100,
            "magnitude": 67.89
        },
        {
            "unit": "acceleration",
            "frequency": 4000,
            "magnitude": 123.45
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
        "enable_hanning_window": true
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
        "velocity": 4,
        "acceleration": 40
    }
};

function encode(tag, object) {
  console.log("###### " + tag)
  console.log("JSON:")
  console.log("```json")
  console.log(JSON.stringify(object, null, 4))
  console.log("```")
  bytestring = Buffer.from(encoder.Encode(15, object))
  console.log("Bytestring (hexidecimal):")
  console.log("```")
  console.log(bytestring.toString('hex'))
  console.log("```")
  console.log("Bytestring (base64):")
  console.log("```")
  console.log(bytestring.toString('base64'))
  console.log("```")
}


console.log("##### Encoding")
encode("Base config message (EU868)", baseEU868);
encode("Base config message (US915)", baseUS915);
encode("Sensor config message (default)", sensorConfigDefault);
encode("Sensor config message (alternative)", sensorConfigAlternative);
encode("Sensor data config message (default)", sensorDataConfigDefault);
encode("Sensor data config message (alternative)", sensorDataConfigAlternative);


