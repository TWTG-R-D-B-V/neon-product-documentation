/**
 * Filename             : encoder_tt_rev-4.js
 * Latest commit        : 3deafe64
 * Protocol v2 document : 6020_P20-002_Communication-Protocol-NEON-Temperature-Transmitter_C.pdf
 * Protocol v3 document : 6020_AB_Communication-Protocol-NEON-Temperature-Transmitter_D.pdf
 * Protocol v4 document : NEON-Temperature-Transmitter_Communication-Protocol-v4_DS-TT-xx-xx_4003_4_A2.pdf
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
 * 2021-07-15 revision 2
 * - Fixed threshold_temperature scale which affect version 2 and 3
 * - Add sensor type to application configuration, according to Protocol D
 * - Add value range assertion to encode_device_config
 * - Fixed the parsing of unconfirmed_repeat to number_of_unconfirmed_messages
 *
 * 2022-11-10 revision 3
 * - Align configuration name in NEON product
 *   + device -> base
 *   + application -> sensor
 * - Updated based on the changes from PT
 *   + added checking the threshold values
 *   + added cs and pt device types
 * - Protocol V4, Updated based on the changes from LD/VB
 * -- Added configUpdateReq.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Updated lorawan_fsb_mask representation to disable_switch to dedicate 1 bit to every band (8 channels)
 * -- Uses ThingPark as default entry point where fPort is not an input but an output.
 * - Used throw new Error instead of throw
 *
 * 2023-12-12 revision 4
 * - Added support of LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 *
 * YYYY-MM-DD revision X
 *
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    encodeDownlink: encodeDownlink,
    Encode: Encode,
    Encoder: Encoder,
    EncodeBaseConfig: EncodeBaseConfig, // used by generate_config_bin.py
    EncodeSensorConfig: EncodeSensorConfig, // used by generate_config_bin.py
    encode_header: encode_header,
    encode_header_v4: encode_header_v4,
    encode_events_mode: encode_events_mode,
    encode_base_config: encode_base_config,
    encode_sensor_config: encode_sensor_config,
    encode_base_config_switch: encode_base_config_switch,
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
    encode_base_config_v4: encode_base_config_v4,
    encode_base_config_switch_v4: encode_base_config_switch_v4,
    encode_status_msg_delay_interval_v4: encode_status_msg_delay_interval_v4,
    encode_region_config_v4: encode_region_config_v4,
    encode_channel_plan_v4: encode_channel_plan_v4,
    encode_sensor_config_v4: encode_sensor_config_v4,
    encode_sensor_config_switch_mask_v4: encode_sensor_config_switch_mask_v4,
    encode_sensor_conditions_configuration_v4: encode_sensor_conditions_configuration_v4,
    encode_event_condition_v4: encode_event_condition_v4,
  };
}

var mask_byte = 255;

function _encode(input) {
  input = input.data;

  // Encode downlink messages sent as
  // object to an array or buffer of bytes.

  var PROTOCOL_VERSION_2 = 2;
  var PROTOCOL_VERSION_3 = 3;
  var PROTOCOL_VERSION_4 = 4;

  // Specific for PROTOCOL_VERSION_2 and PROTOCOL_VERSION_3
  var MSGID_BASE_CONFIG = 5;
  var MSGID_SENSOR_CONFIG = 6;

  // Non default ports are specific for PROTOCOL_VERSION_4
  var FPORT_CONFIG_UPDATE = 7;
  var FPORT_CALIBRATION_UPDATE = 8;
  var FPORT_DEFAULT_APP = 15;

  var CONFIG_UPDATE_STR = "config_update_req"
  var CALIB_UPDATE_STR = "calib_update_req"

  // Config string
  var STR_BASE_CONFIG = "base";
  var STR_REGION_CONFIG = "region";
  var STR_SENSOR_CONFIG = "sensor";
  var STR_SENSOR_CONDITIONS_CONFIG = "sensor_conditions";

  // Prepare output with its default value
  var output = {};
  var bytes = [];
  output.bytes = bytes;
  output.fPort = FPORT_DEFAULT_APP;

  var protocol_version = 0;
  // Get protocol_version from either "input.header" (old protocol) or "input.message_body" (new protocol, e.g. "config_update_req")
  // If it does not find protocol_version in the input, the value will default to '0' where the switch case below will handle it as a fault.
  for (var name in input) {
    if (typeof input[name].protocol_version !== 'undefined') {
      protocol_version = input[name].protocol_version;
    }
  }

  switch (protocol_version) {
    case PROTOCOL_VERSION_2:
    case PROTOCOL_VERSION_3: {
      // We always use default FPORT on protocol V1, V2 and V3
      output.fPort = FPORT_DEFAULT_APP;
      switch (input.header.message_type) {
        case "base_configuration": { // Base configuration message
          encode_header(bytes, MSGID_BASE_CONFIG, input.header.protocol_version);
          encode_base_config(bytes, input);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "sensor_configuration": { // Sensor configuration message
          switch (input.device_type) {
            case "tt":
              encode_header(bytes, MSGID_SENSOR_CONFIG, input.header.protocol_version);
              encode_sensor_config(bytes, input);
              encode_uint16(bytes, calc_crc(bytes.slice(1)));

              break;
            default:
              throw new Error("Invalid device type!");
          }
          break;
        }
        default:
          throw new Error("Invalid message type!");
      }
      break;
    }
    case PROTOCOL_VERSION_4: {
      // Get request type based on message name
      var req_type = Object.keys(input)[0]
      var req = input[req_type]

      switch (req_type) {
        case CONFIG_UPDATE_STR: {
          output.fPort = FPORT_CONFIG_UPDATE;
          switch (req.config_type) {
            case STR_BASE_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_base_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_REGION_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_region_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_sensor_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONDITIONS_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_sensor_conditions_configuration_v4(bytes, req.payload);
              }
              break;
            }
            default:
              output.fPort = 0;
              throw new Error("Invalid config type!");
          }
          break;
        }

        case "calib_update_req": {
          output.fPort = FPORT_CALIBRATION_UPDATE
          // TODO: Implement this!
          break;
        }

        default:
          throw new Error("Unknown request type");
      }
      break;
    }
    default:
      throw new Error("Protocol version is not supported!");
  }

  return output;
}

/**
 * LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 */
function encodeDownlink(input) {
  try {
    return _encode(input);
  } catch (error) {
    return { errors: [error.message] };
  }
}

/**
  * Entry point for Chirpstack v3
  */
 function Encode(fPort, obj) {
  return _encode({data: obj}).bytes;
}

/**
  * Entry point for TTN
  */
function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
}

/**
 * Base configuration encoder
 */
function EncodeBaseConfig(input) {
  var bytes = [];
  encode_base_config(bytes, input);

  return bytes;
}

function encode_base_config(bytes, obj) {
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
  if (typeof obj.bypass_sanity_check == "undefined" || obj.bypass_sanity_check == false) {
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
  }
  encode_base_config_switch(bytes, obj.switch_mask);
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
 * TT sensor configuration
 */
function EncodeSensorConfig(obj) {
  var bytes = [];
  encode_sensor_config(bytes, obj);

  return bytes;
}

function encode_sensor_config(bytes, obj) {
  if (obj.header.protocol_version == 2) {
    encode_device_type_v2(bytes, obj.device_type, obj.enable_rtd);
  } else if (obj.header.protocol_version == 3
    || obj.header.protocol_version == 4) {
    encode_device_type_v3(bytes, obj.device_type);
    encode_sensor_type(bytes, obj.sensor_type);
  } else {
    throw new Error("Protocol version is not supported!");
  }

  for (var i = 0; i != 4; ++i){
    // All mode should not be above 1850 C
    if(obj.events[i].threshold_temperature > 2120){
      throw new Error("threshold is above supported value");
    }

    if(obj.events[i].mode == "increasing" || obj.events[i].mode == "decreasing"){
      // Mode 3 and 4 (increasing and decreasing) only support positive number, while ...
      if(obj.events[i].threshold_temperature < -2120){
        throw new Error("threshold is below supported value1");
      }
    } else if(obj.events[i].threshold_temperature < -270){
      // Mode 0, 1, and 2 (off, above, below) support threshold down to -270
      throw new Error("threshold is below supported value2");
    }
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

function encode_sensor_conditions_configuration_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "tt") {
    throw new Error("Invalid device type!");
  }

  encode_device_type_v3(bytes, payload.device_type);
  // Events configs
  var idx = 0;
  for (idx = 0; idx < 4; idx++) {                             // Unit: -
    // threshold_temperature
    if (payload.event_conditions[idx].mode == 'above' ||
      payload.event_conditions[idx].mode == 'below') {
      if (payload.event_conditions[idx].threshold_temperature > 1850 ||
        payload.event_conditions[idx].threshold_temperature < -270) {
        throw new Error("Threshold_temperature is outside of specification: " + payload.event_conditions[idx].threshold_temperature);
      }
    }
    else {
      if (payload.event_conditions[idx].threshold_temperature > 2120 ||
        payload.event_conditions[idx].threshold_temperature < 0) {
        throw new Error("Threshold_temperature is outside of specification: " + payload.event_conditions[idx].threshold_temperature);
      }
    }

    // measurement_window
    if (payload.event_conditions[idx].measurement_window < 0 ||
      payload.event_conditions[idx].measurement_window > 63) {
        throw new Error("Measurement_window is outside of specification: " + payload.event_conditions[idx].measurement_window);
    }

    encode_event_condition_v4(bytes, payload.event_conditions[idx]);
  }
}

function encode_sensor_config_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "tt") {
    throw new Error("Invalid device type!");
  }

  encode_device_type_v3(bytes, payload.device_type);
  encode_sensor_type(bytes, payload.sensor_type);

  encode_sensor_config_switch_mask_v4(bytes, payload.switch_mask);

  // Timing configs
  if (payload.measurement_interval_minutes == 0 || payload.measurement_interval_minutes > 240) {
    throw new Error("measurement_interval_minutes outside of specification: " + payload.measurement_interval_minutes);
  }
  else {
    encode_uint8(bytes, payload.measurement_interval_minutes);     // Unit: m
  }
  if (payload.periodic_event_message_interval > 10080 || payload.periodic_event_message_interval < 0) { // maximum allowed value
    throw new Error("periodic_event_message_interval outside of specification: " + payload.periodic_event_message_interval);
  }
  else {
    encode_uint16(bytes, payload.periodic_event_message_interval);  // Unit: -
  }
}

function encode_base_config_v4(bytes, payload) {
  // Check if payload is empty
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.periodic_message_random_delay_seconds < 0 || payload.periodic_message_random_delay_seconds > 31) {
    throw new Error("periodic_message_random_delay_seconds is outside of specification: " + payload.periodic_message_random_delay_seconds);
  }

  encode_base_config_switch_v4(bytes, payload.switch_mask);
  encode_status_msg_delay_interval_v4(bytes, payload.periodic_message_random_delay_seconds, payload.status_message_interval); // bit[0..4]: delay, bit[5..7]: interval
}

function encode_region_config_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  encode_channel_plan_v4(bytes, payload.channel_plan);

  // join_trials
  if (payload.join_trials.holdoff_steps > 7) {
    throw new Error("Hold off steps too large");
  }
  burst_min1 = (payload.join_trials.burst_count - 1) & 0xff;
  if (burst_min1 > 31) {
    throw new Error("Burst range 1..32");
  }
  join_trials = payload.join_trials.holdoff_hours_max & 0xff;
  join_trials |= payload.join_trials.holdoff_steps << 8;
  join_trials |= burst_min1 << 11;
  encode_uint16(bytes, join_trials);

  // disable_switch
  disable_switch = payload.disable_switch.frequency_bands & 0x0FFF;
  if ((disable_switch ^ 0x0FFF) == 0) {
    throw new Error("Not disable all bands");
  }
  disable_switch |= payload.disable_switch.dwell_time ? 0x1000 : 0x0000;
  encode_uint16(bytes, disable_switch);

  encode_uint8(bytes, payload.rx1_delay &  0x0f);

  // ADR
  adr = payload.adr.mode;
  adr |= (payload.adr.ack_limit_exp & 0x07) << 2;
  adr |= (payload.adr.ack_delay_exp & 0x07) << 5;
  encode_uint8(bytes, adr);

  encode_int8(bytes, payload.max_tx_power);
}

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode the header for PROTOCOL_VERSION_4
function encode_header_v4(bytes, header) {
  var b = 0;
  b += (lookup_config_type(header.config_type) & 0x0F);
  b += (header.protocol_version & 0x0F) << 4;

  encode_uint8(bytes, b);
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
    case "cs":
      value = 7;
      break;
    case "pt":
      value = 8;
      break;
    default:
      throw new Error("Invalid device type!");
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
      throw new Error("Invalid device type!");
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
      throw new Error("Invalid thermocouple type!");
  }

  encode_uint8(bytes, value);
}

// helper function to encode event.mode
function encode_events_mode(bytes, mode) {
  switch (mode) {
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

// helper function to encode the base configuration switch_mask
function encode_base_config_switch(bytes, bitmask) {
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

function encode_base_config_switch_v4(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_confirmed_data_message) {
    config_switch_mask |= 1 << 1;
  }
  if (bitmask.allow_deactivation) {
    config_switch_mask |= 1 << 2;
  }
  if (bitmask.enable_debug_info) {  // Only for internal usage
    config_switch_mask |= 1 << 3;
  }
  bytes.push(config_switch_mask & mask_byte);
}

function encode_status_msg_delay_interval_v4(bytes, periodic_message_random_delay, status_message_interval) {
  var interval_val = 0;
  switch (status_message_interval) {
    case ("2 minutes"):
      interval_val = 0;
      break;
    case ("15 minutes"):
      interval_val = 1;
      break;
    case ("1 hour"):
      interval_val = 2;
      break;
    case ("4 hours"):
      interval_val = 3;
      break;
    case ("12 hours"):
      interval_val = 4;
      break;
    case ("1 day"):
      interval_val = 5;
      break;
    case ("2 days"):
      interval_val = 6;
      break;
    case ("5 days"):
      interval_val = 7;
      break;
    default:
      throw new Error("status_message_interval is outside of specification: " + status_message_interval);
  }
  var byte = periodic_message_random_delay | (interval_val << 5);
  bytes.push(byte);
}

function encode_channel_plan_v4(bytes, channel_plan) {
  switch (channel_plan) {
    case "EU868": {
      bytes.push(1);
      break;
    }
    case "US915": {
      bytes.push(2);
      break;
    }
    case "CN779": {
      bytes.push(3);
      break;
    }
    case "EU433": {
      bytes.push(4);
      break;
    }
    case "AU915": {
      bytes.push(5);
      break;
    }
    case "CN470": {
      bytes.push(6);
      break;
    }
    case "AS923": {
      bytes.push(7);
      break;
    }
    case "AS923-2": {
      bytes.push(8);
      break;
    }
    case "AS923-3": {
      bytes.push(9);
      break;
    }
    case "KR920": {
      bytes.push(10);
      break;
    }
    case "IN865": {
      bytes.push(11);
      break;
    }
    case "RU864": {
      bytes.push(12);
      break;
    }
    case "AS923-4": {
      bytes.push(13);
      break;
    }
    default:
      throw new Error("channel_plan outside of specification: " + obj.channel_plan);
  }
}

// helper function to encode the sensor configuration switch_mask
function encode_sensor_config_switch_mask_v4(bytes, bitmask) {
  var config_switch_mask = 0;
  switch (bitmask.selection) {
    case "extended": // zero
      break;
    case "min_only":
      config_switch_mask |= 1 << 0;
      break;
    case "max_only":
      config_switch_mask |= 2 << 0;
      break;
    case "avg_only":
      config_switch_mask |= 3 << 0;
      break;
    default:
      throw new Error("Out of bound, selection: " + bitmask.selection);
  }
  bytes.push(config_switch_mask);
}

// helper function to encode the event condition
function encode_event_condition_v4(bytes, event_condition) {
  encodeModeMeasurementWindow(bytes, event_condition.mode, event_condition.measurement_window);
  encode_int16(bytes, event_condition.threshold_temperature * 10);        // Unit: 0.1'
}

// helper function to encode the mode and measurement_window into one byte
function encodeModeMeasurementWindow(bytes, mode, measWindow) {
  var temporary_mode = []; // to store the mode
  var temporary_measurement_window = [];
  var mode_meas_window = 0;
  switch (mode) {
    case 'above':
      encode_uint8(temporary_mode, 0);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'below':
      encode_uint8(temporary_mode, 1);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'increasing':
      encode_uint8(temporary_mode, 2);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'decreasing':
      encode_uint8(temporary_mode, 3);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'off':
      encode_uint8(temporary_mode, 0); // mode off is translated into measurement_window = 0 and mode = above
      encode_uint8(temporary_measurement_window, 0);
      break;
    default:
      throw new Error("mode is outside of specification: " + mode);
  }

    mode_meas_window = temporary_mode[0] | (temporary_measurement_window[0] << 2); // bits[0,1]: mode, bits[2..7]: measurement_window

    encode_uint8(bytes, mode_meas_window);
}

// Helper function to encode config_type for PROTOCOL_VERSION_3
function lookup_config_type(config_type) {
  switch (config_type) {
    case "base":
      return 0;
    case "region":
      return 1;
    case "reserved":
      return 2;
    case "sensor":
      return 3;
    case "sensor_data":
      return 4;
    case "sensor_conditions":
      return 5;
    default:
      throw new Error("Unknown config_type: " + config_type);
  }
}
