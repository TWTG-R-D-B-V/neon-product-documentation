/**
 * Filename          : encoder_tt_doc-D_rev-2.js
 * Latest commit     : 2b5c8c54
 * Protocol document : D
 *
 * Release History
 *
 * 2020-09-23 revision 0
 * - initial version
 *
 * 2021-06-28 revision 1
 * - rename unconfirmed_repeat to number_of_unconfirmed_messages
 * - Added limitation to base configuration
 * - Update minimum number of number_of_unconfirmed_messages
 *
 * YYYY-MM-DD revision 2
 * - Fixed threshold_temperature scale which affect version 2 and 3
 * - Add sensor type to application configuration, according to Protocol D
 * - Add value range assertion to encode_device_config
 * - Fixed the parsing of unconfirmed_repeat to number_of_unconfirmed_messages
 *
 * YYYY-MM-DD revision X
 * - None
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Encode: Encode,
    Encoder: Encoder,
    EncodeDeviceConfig: EncodeDeviceConfig, // used by generate_config_bin.py
    EncodeTtAppConfig: EncodeTtAppConfig, // used by generate_config_bin.py
    encode_header: encode_header,
    encode_events_mode: encode_events_mode,
    encode_device_config: encode_device_config,
    encode_tt_app_config: encode_tt_app_config,
    encode_device_config_switch: encode_device_config_switch,
    encode_device_type_v2: encode_device_type_v2,
    encode_device_type_v3: encode_device_type_v3,
    encode_sensor_type: encode_sensor_type,
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
    case 2:
    case 3: {  // Protocol version 2 and 3
      switch (obj.header.message_type) {
        case "device_configuration": { // Device message
          encode_header(bytes, 5, obj.header.protocol_version);
          encode_device_config(bytes, obj);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "application_configuration": { // Application message
          switch (obj.device_type) {
            case "tt":
              encode_header(bytes, 6, obj.header.protocol_version);
              encode_tt_app_config(bytes, obj);
              encode_uint16(bytes, calc_crc(bytes.slice(1)));

              break;
            default:
              throw "Invalid device type!";
          }
        }
        break;
        default:
          throw "Invalid message type!"
      }
      break;
    }
    default:
      throw "Protocol version is not suppported!"
  }

  return bytes;
}

function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
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
  // The following parameters refers to the same configuration, only different naming on different
  // protocol version.
  // Copy the parameter to a local one
  var number_of_unconfirmed_messages = 0;
  if (typeof obj.number_of_unconfirmed_messages != "undefined") {
    number_of_unconfirmed_messages = obj.number_of_unconfirmed_messages;
  } else if (typeof obj.unconfirmed_repeat != "undefined") {
    number_of_unconfirmed_messages = obj.unconfirmed_repeat;
  } else {
    throw new Error("Missing number_of_unconfirmed_messages OR unconfirmed_repeat parameter");
  }

  if (number_of_unconfirmed_messages < 1 || number_of_unconfirmed_messages > 5) {
    throw new Error("number_of_unconfirmed_messages is outside of specification: " + number_of_unconfirmed_messages);
  }
  if (obj.communication_max_retries < 1) {
      throw new Error("communication_max_retries is outside specification: " + obj.communication_max_retries);
  }
  if (obj.status_message_interval_seconds < 60 || obj.status_message_interval_seconds > 604800) {
      throw new Error("status_message_interval_seconds is outside specification: " + obj.status_message_interval_seconds);
  }
  if (obj.lora_failure_holdoff_count < 0 || obj.lora_failure_holdoff_count > 255) {
      throw new Error("lora_failure_holdoff_count is outside specification: " + obj.lora_failure_holdoff_count);
  }
  if (obj.lora_system_recover_count < 0 || obj.lora_system_recover_count > 255) {
      throw new Error("lora_system_recover_count is outside specification: " + obj.lora_system_recover_count);
  }
  encode_device_config_switch(bytes, obj.switch_mask);
  encode_uint8(bytes, obj.communication_max_retries);             // Unit: -
  encode_uint8(bytes, number_of_unconfirmed_messages);            // Unit: -
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
 * TS application encoder
 */
function EncodeTtAppConfig(obj) {
  var bytes = [];
  encode_tt_app_config(bytes, obj);

  return bytes;
}

function encode_tt_app_config(bytes, obj) {
  if (obj.header.protocol_version == 2) {
    encode_device_type_v2(bytes, obj.device_type, obj.enable_rtd);
  } else if (obj.header.protocol_version == 3) {
    encode_device_type_v3(bytes, obj.device_type);
    encode_sensor_type(bytes, obj.sensor_type);
  } else {
    throw "Protocol version is not suppported!";
  }
  encode_uint16(bytes, obj.temperature_measurement_interval_seconds);   // Unit: s
  encode_uint16(bytes, obj.periodic_event_message_interval);            // Unit: -
  encode_events_mode(bytes, obj.events[0].mode);                        // Unit: -
  encode_int16(bytes, obj.events[0].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[0].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[1].mode);                        // Unit: -
  encode_int16(bytes, obj.events[1].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[1].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[2].mode);                        // Unit: -
  encode_int16(bytes, obj.events[2].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[2].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[3].mode);                        // Unit: -
  encode_int16(bytes, obj.events[3].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[3].measurement_window);                // Unit: -'
}

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode device type V2
function encode_device_type_v2(bytes, type, enable_rtd) {
  var value = 0;

  switch (type) {
    case "ts":
      value = 1;
      break;
    case "vs-qt":
      value = 2;
      break;
    case "vs-mt":
      value = 3;
      break;
    case "tt":
      value = 4;
      break;
    default:
      throw "Invalid device type!";
  }

  if (enable_rtd) {
    value |= 1 << 7;
  }

  encode_uint8(bytes, value);
}

// helper function to encode device type V3
function encode_device_type_v3(bytes, type) {
  var value = 0;

  switch (type) {
    case "ts":
      value = 1;
      break;
    case "vs-qt":
      value = 2;
      break;
    case "vs-mt":
      value = 3;
      break;
    case "tt":
      value = 4;
      break;
    default:
      throw "Invalid device type!";
  }

  encode_uint8(bytes, value);
}

// helper function to encode sensor type
function encode_sensor_type(bytes, type) {
  var value = 0;

  switch (type) {
    case 'PT100':
      value = 0;
      break;
    case 'J':
      value = 1;
      break;
    case 'K':
      value = 2;
      break;
    case 'T':
      value = 3;
      break;
    case 'N':
      value = 4;
      break;
    case 'E':
      value = 5;
      break;
    case 'B':
      value = 6;
      break;
    case 'R':
      value = 7;
      break;
    case 'S':
      value = 8;
      break;
    default:
      throw "Invalid thermocouple type!";
  }

  encode_uint8(bytes, value);
}

// helper function to encode event.mode
function encode_events_mode(bytes, mode) {
  switch (mode){
    case 'above':
      encode_uint8(bytes, 1);
      break;
    case 'below':
      encode_uint8(bytes, 2);
      break;
    case 'increasing':
      encode_uint8(bytes, 3);
      break;
    case 'decreasing':
      encode_uint8(bytes, 4);
      break;
    case 'off':
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode the device switch_mask
function encode_device_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
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
