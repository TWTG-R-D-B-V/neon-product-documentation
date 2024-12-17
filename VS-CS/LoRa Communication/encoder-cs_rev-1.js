/**
 * Filename             : encoder-cs_rev-1.js
 * Latest commit        : 618fa5c9
 * Protocol v1 document : NEON-Contact-Sensor_Communication-Protocol-v1_VS-xxx-01-CSxx_4003_1_A.pdf
 *
 * Release History
 *
 * 2021-11-09 revision 0
 * - Initial version
 *
 * 2023-12-13 revision 1
 * - Added support of LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 *
 * YYYY-MM-DD revision X
 *
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Encode: Encode,
    Encoder: Encoder,
    encodeDownlink: encodeDownlink,
    EncodeDeviceConfig: EncodeDeviceConfig, // used by generate_config_bin.py
    EncodeCsAppConfig: EncodeCsAppConfig, // used by generate_config_bin.py
    encode_header: encode_header,
    encode_device_config: encode_device_config,
    encode_cs_app_config: encode_cs_app_config,
    encode_config_switch_bitmask: encode_config_switch_bitmask,
    encode_device_config_switch: encode_device_config_switch,
    encode_device_type: encode_device_type,
    encode_uint32: encode_uint32,
    encode_int32: encode_int32,
    encode_uint16: encode_uint16,
    encode_int16: encode_int16,
    encode_uint8: encode_uint8,
    encode_int8: encode_int8,
    calc_crc: calc_crc,
  };
}

var mask_byte = 255;

function Encode(fPort, obj) { // Used for ChirpStack (aka LoRa Network Server)
  // Encode downlink messages sent as
  // object to an array or buffer of bytes.
  var bytes = [];

  switch (obj.header.protocol_version) {
    case 1: {
      switch (obj.header.message_type) {
        case "device_configuration": { // Device message
          encode_header(bytes, 5, obj.header.protocol_version);
          encode_device_config(bytes, obj);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "application_configuration": { // Application message
          switch (obj.device_type) {
            case "cs":
              encode_header(bytes, 6, obj.header.protocol_version);
              encode_cs_app_config(bytes, obj);
              encode_uint16(bytes, calc_crc(bytes.slice(1)));

              break;
            default:
              throw new Error("Invalid device type!");
          }
        }
        break;
        default:
          throw new Error("Invalid message type!");
      }
      break;
    }
    default:
      throw new Error("Protocol version is not suppported!");
  }

  return bytes;
}

function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
}

/**
 * LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 */
function encodeDownlink(input) {
  try {
    return { bytes: Encode(15, input.data), fPort: 15 };
  } catch (error) {
    return { errors: [error.message] };
  }
}

/**
 * Device configuration encoder
 */
function EncodeDeviceConfig(obj) {
  var bytes = [];
  encode_device_config(bytes, obj);

  return bytes;
}

function encode_device_config(bytes, obj) {
  if (typeof obj.bypassSanityCheck == "undefined")
  {
    if (obj.number_of_unconfirmed_messages < 1 || obj.number_of_unconfirmed_messages > 5) {
      throw new Error("number_of_unconfirmed_messages is outside of specification: " + obj.number_of_unconfirmed_messages);
    }
    if (obj.communication_max_retries < 1 || obj.communication_max_retries > 10) {
      throw new Error("communication_max_retries is outside of specification: " + obj.communication_max_retries);
    }
    if (obj.periodic_message_random_delay_seconds < 0 || obj.periodic_message_random_delay_seconds > 255) {
      throw new Error("periodic_message_random_delay_seconds is outside of specification: " + obj.periodic_message_random_delay_seconds);
    }
    if (obj.status_message_interval_seconds < 60 || obj.status_message_interval_seconds > 604800) {
        throw new Error("status_message_interval_seconds is outside of specification: " + obj.status_message_interval_seconds);
    }
    if (obj.status_message_confirmed_interval < 0 || obj.status_message_confirmed_interval > 255) {
        throw new Error("status_message_confirmed_interval is outside of specification: " + obj.status_message_confirmed_interval);
    }
    if (obj.lora_failure_holdoff_count < 0 || obj.lora_failure_holdoff_count > 5) {
        throw new Error("lora_failure_holdoff_count is outside of specification: " + obj.lora_failure_holdoff_count);
    }
    if (obj.lora_system_recover_count < 0 || obj.lora_system_recover_count > 5) {
        throw new Error("lora_system_recover_count is outside of specification: " + obj.lora_system_recover_count);
    }
  }
  encode_device_config_switch(bytes, obj.switch_mask);
  encode_uint8(bytes, obj.communication_max_retries);             // Unit: -
  encode_uint8(bytes, obj.number_of_unconfirmed_messages);        // Unit: -
  encode_uint8(bytes, obj.periodic_message_random_delay_seconds); // Unit: s
  encode_uint16(bytes, obj.status_message_interval_seconds / 60); // Unit: minutes
  encode_uint8(bytes, obj.status_message_confirmed_interval);     // Unit: -
  encode_uint8(bytes, obj.lora_failure_holdoff_count);            // Unit: -
  encode_uint8(bytes, obj.lora_system_recover_count);             // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[0]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[1]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[2]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[3]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[4]);                  // Unit: -
}

/**
 * CS application encoder
 */
function EncodeCsAppConfig(obj) {
  var bytes = [];
  encode_cs_app_config(bytes, obj);

  return bytes;
}

function encode_cs_app_config(bytes, obj) {
  if (typeof obj.bypassSanityCheck == "undefined")
  {
    if (obj.device_type != "cs") {
      throw new Error( "Incorrect device type: " + obj.device_type);
    }
    if (obj.magnet_measurement_interval_seconds < 1 || obj.magnet_measurement_interval_seconds > 255) {
      throw new Error( "magnet_measurement_interval_seconds is outside of specification: " + obj.magnet_measurement_interval_seconds);
    }
    if (obj.magnitude_threshold < 0 || obj.magnitude_threshold > 31875) {
      throw new Error( "magnitude_threshold is outside of specification: " + obj.magnitude_threshold);
    }
    if (obj.magnitude_hysteresis < 0 || obj.magnitude_hysteresis > 31875) {
      throw new Error( "magnitude_hysteresis is outside of specification: " + obj.magnitude_hysteresis);
    }
    if (obj.magnitude_hysteresis > obj.magnitude_threshold) {
      throw new Error( "magnitude_hysteresis is greater than magnitude_threshold");
    }
    if (obj.periodic_event_message_interval_seconds < 60 || obj.periodic_event_message_interval_seconds > 604800) {
      throw new Error( "periodic_event_message_interval_seconds is outside of specification: " + obj.periodic_event_message_interval_seconds);
    }
  }
  encode_device_type(bytes, obj.device_type);
  encode_uint8(bytes, obj.magnet_measurement_interval_seconds); // Unit: s
  encode_uint8(bytes, obj.magnitude_threshold / 125);                 // 125 milligauss per LSB
  encode_uint8(bytes, obj.magnitude_hysteresis / 125);                // 125 milligauss per LSB
  encode_uint16(bytes, obj.periodic_event_message_interval_seconds / 60.0);  // Unit: minutes
}

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode device type
function encode_device_type(bytes, type) {
  switch (type){
    case 'ts':
      encode_uint8(bytes, 1);
      break;
    case 'vs-qt':
      encode_uint8(bytes, 2);
      break;
    case 'vs-mt':
      encode_uint8(bytes, 3);
      break;
    case 'test':
      encode_uint8(bytes, 4);
      break;
    case 'cs':
      encode_uint8(bytes, 7);
      break;
    default:
      throw new Error("Invalid device type!");
      break;
  }
}

// helper function to encode the config_switch_bitmask
function encode_config_switch_bitmask(bytes, bitmask) {
  var config_switch_bitmask = 0;
  if (bitmask.use_confirmed_changed_message) {
    config_switch_bitmask |= 1 << 0;
  }
  if (bitmask.turn_on_debug_data) {
    config_switch_bitmask |= 1 << 1;
  }
  if (bitmask.activate_magnetometer_stability_test_on_X_axis) {
    config_switch_bitmask |= 1 << 2;
  }
  if (bitmask.activate_magnetometer_stability_test_on_Y_axis) {
    config_switch_bitmask |= 1 << 3;
  }
  if (bitmask.activate_magnetometer_stability_test_on_Z_axis) {
    config_switch_bitmask |= 1 << 4;
  }
  bytes.push(config_switch_bitmask & mask_byte);
}

// helper function to encode the device switch_mask
function encode_device_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_debug_data) {
    config_switch_mask |= 1 << 1;
  }
  bytes.push(config_switch_mask & mask_byte);
}

// helper function to encode an uint32
function encode_uint32(bytes, value) {
  bytes.push(value & mask_byte);
  bytes.push((value >> 8) & mask_byte);
  bytes.push((value >> 16) & mask_byte);
  bytes.push((value >> 24) & mask_byte);
}

// helper function to encode an int32
function encode_int32(bytes, value) {
  encode_uint32(bytes, value);
}

// helper function to encode an uint16
function encode_uint16(bytes, value) {
  bytes.push(value & mask_byte);
  bytes.push((value >> 8) & mask_byte);
}

// helper function to encode an int16
function encode_int16(bytes, value) {
  encode_uint16(bytes, value);
}

// helper function to encode an uint8
function encode_uint8(bytes, value) {
  bytes.push(value & mask_byte);
}

// helper function to encode an int8
function encode_int8(bytes, value) {
  encode_uint8(bytes, value);
}

// calc_crc inspired by https://github.com/SheetJS/js-crc32
function calc_crc(buf) {
  function signed_crc_table() {
    var c = 0, table = new Array(256);

    for (var n = 0; n != 256; ++n) {
      c = n;
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      table[n] = c;
    }

    return typeof Int32Array !== 'undefined' ? new Int32Array(table) :
            table;
  }
  var T = signed_crc_table();

  var C = -1;
  var i = 0;
  while (i < buf.length) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
  return C & 0xFFFF;
}
