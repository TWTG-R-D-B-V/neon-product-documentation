var encoder = require('../encoder_vb_rev-10.js');

var baseConfigDefault = {
  "config_update_req": {
    "config_type": "base",
    "protocol_version": 3,
    "tag": "0x096c4970",
    "payload": {
      "switch_mask": {
        "enable_confirmed_event_message": false,
        "enable_confirmed_data_message": true,
        "allow_deactivation": true
      },
      "periodic_message_random_delay_seconds": 31,
      "status_message_interval": "5 days",
    }
  }
}

var baseConfigNoPayload = {
  "config_update_req": { "config_type": "base", "protocol_version": 3 },
}

var baseConfigAlternative = {
  "config_update_req": {
    "config_type": "base",
    "protocol_version": 3,
    "tag": "0x00000000",
    "payload": {
      "switch_mask": {
        "enable_confirmed_event_message": false,
        "enable_confirmed_data_message": false,
        "allow_deactivation": true
      },
      "periodic_message_random_delay_seconds": 17,
      "status_message_interval": "2 days",
    }
  }
};

var sensorConfigDefault = {
  "config_update_req": {
    "config_type": "sensor",
    "protocol_version": 3,
    "tag": "0xfd77daf2",
    "payload": {
      "device_type": "vb",
      'switch_mask': { 'selection': "avg_only" },
      'measurement_interval_minutes': 15,
      "periodic_event_message_interval": 16,
      "frequency_range": {
        "velocity": "range_2",
        "acceleration": "range_2"
      }
    }
  }
};

var sensorConfigNoPayload = {
  "config_update_req": { "config_type": "sensor", "protocol_version": 3 },
}

var sensorConfigAlternative = {
  "config_update_req": {
    "config_type": "sensor", "protocol_version": 3,
    "tag": "0x00000000",
    "payload": {
      "device_type": "vb",
      'switch_mask': { 'selection': "extended" },
      'measurement_interval_minutes': 15,
      "periodic_event_message_interval": 16,
      "frequency_range": {
        "velocity": "range_1",
        "acceleration": "range_2"
      }
    }
  }
}

var sensorConditionsConfigDefault = {
  "config_update_req": {
    "config_type": "sensor_conditions",
    "protocol_version": 3,
    "tag": "0x83327baf",
    "payload": {
      "device_type": "vb",
      "event_conditions":
        [
          { "mode": "off" },
          { "mode": "off" },
          { "mode": "off" },
          { "mode": "off" },
          { "mode": "off" },
          { "mode": "off" }
        ]
    }
  }
}

var sensorConditionsConfigNoPayload = {
  "config_update_req": { "config_type": "sensor_conditions", "protocol_version": 3 }
}

var sensorConditionsConfigAlternative = {
  "config_update_req": {
    "config_type": "sensor_conditions",
    "protocol_version": 3,
    "tag": "0x00000000",
    "payload": {
      "device_type": "vb",
      "event_conditions":
        [
          { "mode": "rms_velocity_x", "mode_value": 0 },
          { "mode": "peak_acceleration_x", "mode_value": 0.5 },
          { "mode": "rms_velocity_y", "mode_value": 0.4 },
          { "mode": "peak_acceleration_y", "mode_value": 0.1 },
          { "mode": "peak_acceleration_z", "mode_value": 0.3 }
        ]
    }
  }
}

var sensorDataConfigDefault = {
  "config_update_req": {
    "config_type": "sensor_data",
    "protocol_version": 3,
    "tag": "0xeec823eb",
    "payload": {
      "device_type": "vb",
      "calculation_trigger": { "on_event": false, "on_threshold": false, "on_button_press": false },
      "calculation_interval": 1440,
      "fragment_message_interval": 60,
      "threshold_window": 10,
      "trigger_thresholds": [
        { "unit": "velocity", "frequency": 0, "magnitude": 0 },
        { "unit": "velocity", "frequency": 0, "magnitude": 0 },
        { "unit": "velocity", "frequency": 0, "magnitude": 0 },
        { "unit": "velocity", "frequency": 0, "magnitude": 0 },
        { "unit": "velocity", "frequency": 0, "magnitude": 0 }
      ],
      "selection": {
        "axis": "z",
        "resolution": "low_res",
        "enable_hanning_window": false
      },
      "frequency": {
        "span": {
          "velocity": { "start": 3, "stop": 126 },
          "acceleration": { "start": 61, "stop": 4096 }
        },
        "resolution": { "velocity": 1, "acceleration": 2 }
      },
      "scale": {
        "velocity": 1,
        "acceleration": 40
      }
    }
  }
}

var sensorDataConfigNoPayload = {
  "config_update_req": { "config_type": "sensor_data", "protocol_version": 3 }
}

var sensorDataConfigAlternative = {
  "config_update_req": {
    "config_type": "sensor_data",
    "protocol_version": 3,
    "tag": "0x00000000",
    "payload": {
      "device_type": "vb",
      "calculation_trigger": { "on_event": false, "on_threshold": false, "on_button_press": false },
      "calculation_interval": 5,
      "fragment_message_interval": 60,
      "threshold_window": 10,
      "trigger_thresholds": [
        { "unit": "velocity", "frequency": 1, "magnitude": 2 },
        { "unit": "velocity", "frequency": 3, "magnitude": 4 },
        { "unit": "velocity", "frequency": 5, "magnitude": 6 },
        { "unit": "velocity", "frequency": 7, "magnitude": 8 },
        { "unit": "velocity", "frequency": 9, "magnitude": 10 }
      ],
      "selection": {
        "axis": "z",
        "resolution": "low_res",
        "enable_hanning_window": false
      },
      "frequency": {
        "span": {
          "velocity": { "start": 3, "stop": 126 },
          "acceleration": { "start": 61, "stop": 4096 }
        },
        "resolution": { "velocity": 1, "acceleration": 2 }
      },
      "scale": {
        "velocity": 1,
        "acceleration": 40
      }
    }
  }
}

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
encode("Base config message (Default)", baseConfigDefault);
encode("Base config message (No payload)", baseConfigNoPayload);
encode("Base config message (Alternative)", baseConfigAlternative);

encode("Sensor config message (Default)", sensorConfigDefault); 
encode("Sensor config message (No payload)", sensorConfigNoPayload); 
encode("Sensor config message (Alternative)", sensorConfigAlternative); 

encode("Sensor conditions config message (Default)", sensorConditionsConfigDefault);
encode("Sensor conditions config message (No Payload)", sensorConditionsConfigNoPayload);
encode("Sensor conditions config message (Alternative)", sensorConditionsConfigAlternative);

encode("Sensor data config message (Default)", sensorDataConfigDefault);
encode("Sensor data config message (No payload)", sensorDataConfigNoPayload);
encode("Sensor data config message (Alternative)", sensorDataConfigAlternative);


