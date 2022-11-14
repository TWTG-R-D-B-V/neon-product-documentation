/**
 * Filename          : decoder_tt_doc-D_rev-4.js
 * Latest commit     : 57c762f2
 * Protocol document : D
 *
 * Release History
 *
 * 2020-09-23 revision 0
 * - initial version
 *
 * 2020-04-02 revision 1
 * - prefix hex values with 0x
 * - made reset_flags and bist
 * - updated assert payload formatting in reboot info
 * - added DecodeHexString to directly decode from HEX string
 *
 * 2021-07-15 revision 2
 * - Add support for protocol version 3, document D
 * - Add status element to application temperature
 * - Use a function to decode application_temperature
 * - Verify message length before parsing
 * - Fixed hexadecimal message decoding
 *
 * 2022-11-10 revision 3
 * - Align configuration name in NEON product
 *   + device -> base
 *   + application -> sensor
 * - Align uplink name in NEON product
 *   + application_event -> sensor_event
 * - Updated TT similar to the changes from PT
 * -- updated the decoder to support the new error codes for PT
 * -- added the user trigger for event msg
 * -- completed the list of message types
 * -- completed the list of devices
 * -- added user trigger
 * -- added bist to the status msg
 * - Protocol V4
 * -- Updated Boot, Device status, and Sensor event messages to support normal, extended, debug formats.
 * -- Removed message_type from header.
 * -- Added configUpdateAns.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Ignore null payload OR MAC uplink
 * -- Added entry point for ThingPark
 * - Used throw new Error instead of throw
 *
 * 2022-11-15 revision 4
 * - Fixed: false error on decoding extended event message
 * 
 * YYYY-MM-DD revision X
 */

 if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    decodeUplink: decodeUplink,
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
    decode_reboot_info: decode_reboot_info,
    decode_sensor_temperature: decode_sensor_temperature,
    from_hex_string: from_hex_string,
    decode_temperature_16bit: decode_temperature_16bit,
    decode_sensor_temperature_v2_v3: decode_sensor_temperature_v2_v3,
    decode_sensor_temperature_v4: decode_sensor_temperature_v4,
    decode_header: decode_header,
    decode_header_v4: decode_header_v4,
    decode_boot_msg_v4: decode_boot_msg_v4,
    reboot_lookup_major: reboot_lookup_major,
    reboot_lookup_minor: reboot_lookup_minor,
    decode_device_status_msg_v4: decode_device_status_msg_v4,
    decode_battery_voltage: decode_battery_voltage,
    rssi_lookup: rssi_lookup,
    decode_config_update_ans_msg: decode_config_update_ans_msg,
    config_type_lookup: config_type_lookup,
    decode_deactivated_msg_v4: decode_deactivated_msg_v4,
    deactivation_reason_lookup: deactivation_reason_lookup,
    decode_activated_msg_v4: decode_activated_msg_v4,
    decode_sensor_event_msg_v4: decode_sensor_event_msg_v4,
    decode_sensor_event_msg_normal: decode_sensor_event_msg_normal,
    decode_sensor_event_msg_extended: decode_sensor_event_msg_extended,
    lookup_selection: lookup_selection,
    decode_sensor_temperature_normal_v4: decode_sensor_temperature_normal_v4,
  };
}

/**
 * Decoder for ThingPark network server
 */
 function decodeUplink(input) {
  return Decode(input.fPort, input.bytes)
}

/**
 * Decoder for Chirpstack (loraserver) network server
 *
 * Decode an uplink message from a buffer
 * (array) of bytes to an object of fields.
 */
function Decode(fPort, bytes) { // Used for ChirpStack (aka LoRa Network Server)

  // Protocol Versions
  var PROTOCOL_VERSION_V2 = 2;
  var PROTOCOL_VERSION_V3 = 3;
  var PROTOCOL_VERSION_V4 = 4;

  // Message Ports
  var FPORT_BOOT = 1;
  var FPORT_DEVICE_STATUS = 2;
  var FPORT_SENSOR_EVENT = 3;
  var FPORT_SENSOR_DATA = 4;
  var FPORT_ACTIVATION = 5;
  var FPORT_DEACTIVATION = 6;
  var FPORT_CONFIG_UPDATE = 7;
  var FPORT_CALIBRATION_UPDATE = 8;
  var FPORT_DEFAULT_APP = 15;

  // Message headers strings
  var STR_BOOT = "boot";
  var STR_ACTIVATED = "activated";
  var STR_DEACTIVATED = "deactivated";
  var STR_SENSOR_EVENT = "sensor_event";
  var STR_DEVICE_STATUS = "device_status";

  var decoded = {};
  var cursor = {};   // keeping track of which byte to process.
  cursor.value = 0;  // Start from 0

  if (fPort == 0 || bytes.length == 0) {
    // Ignore null payload OR MAC uplink
    return decoded;
  }

  var protocol_version = get_protocol_version(bytes);

  switch (protocol_version) {
    case PROTOCOL_VERSION_V2:
    case PROTOCOL_VERSION_V3: {
      decoded.header = decode_header(bytes, cursor);
      if (fPort == FPORT_DEFAULT_APP) {
        switch (decoded.header.message_type) {
          case STR_BOOT:
            decoded.boot = decode_boot_msg(bytes, cursor);
            break;

          case STR_ACTIVATED:
            // Only header
            break;

          case STR_DEACTIVATED:
            // only header
            break;

          case STR_SENSOR_EVENT:
            decoded.sensor_event = decode_sensor_event_msg(bytes, cursor, protocol_version);
            break;

          case STR_DEVICE_STATUS:
            decoded.device_status = decode_device_status_msg(bytes, cursor, protocol_version);
            break;

          default:
            throw new Error("Invalid message type!");
        }
      }
      break;
    }

    case PROTOCOL_VERSION_V4: {
      // Protocol V4 reserves each fPort for different purpose
      switch (fPort) {
        case FPORT_BOOT:
          header = decode_header_v4(bytes, cursor);
          decoded.boot = decode_boot_msg_v4(bytes, cursor);
          decoded.boot.protocol_version = header.protocol_version;
          break;

        case FPORT_DEVICE_STATUS:
          header = decode_header_v4(bytes, cursor);
          decoded.device_status = decode_device_status_msg_v4(bytes, cursor);
          decoded.device_status.protocol_version = header.protocol_version;
          break;

        case FPORT_SENSOR_EVENT:
          header = decode_header_v4(bytes, cursor);
          decoded.sensor_event = decode_sensor_event_msg_v4(bytes, cursor);
          decoded.sensor_event.protocol_version = header.protocol_version;
          break;

        case FPORT_ACTIVATION:
          header = decode_header_v4(bytes, cursor);
          decoded.activated = decode_activated_msg_v4(bytes, cursor);
          decoded.activated.protocol_version = header.protocol_version;
          break;

        case FPORT_DEACTIVATION:
          header = decode_header_v4(bytes, cursor);
          decoded.deactivated = decode_deactivated_msg_v4(bytes, cursor);
          decoded.deactivated.protocol_version = header.protocol_version;
          break;

        case FPORT_CONFIG_UPDATE:
          decoded.config_update_ans = decode_config_update_ans_msg(bytes, cursor);
          break;

        case FPORT_CALIBRATION_UPDATE:
          // TODO: Implement this
          break;

        default:
          // NOTE: It could be unsupported device management message so there should be no assertion!
          break;
      }
      break;
    }
  
    default:
      throw new Error("Unsupported protocol version!");
  }
  
  return decoded;
}

/**
 * Decoder for The Things Network network server
 */
function Decoder(obj, fPort) { // for The Things Network server
  return Decode(fPort, obj);
}

/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
  return Decode(fPort, from_hex_string(hex_string));
}

/******************
 * Helper functions
 */

/**
  * Get protocol version without increasing cursor
  */
 function get_protocol_version(bytes) {
  var cursor = {};
  cursor.value = 0;

  var data = decode_uint8(bytes, cursor);

  var protocol_version = data >> 4;

  return protocol_version;
}

// helper function to convert a ASCII HEX string to a byte string
function from_hex_string(hex_string) {
  if (typeof hex_string != "string") throw new Error("hex_string must be a string");
  if (!hex_string.match(/^[0-9A-F]*$/gi)) throw new Error("hex_string contain only 0-9, A-F characters");
  if (hex_string.length & 0x01 > 0) throw new Error("hex_string length must be a multiple of two");

  var byte_string = [];
  for (i = 0; i < hex_string.length; i += 2) {
    var hex = hex_string.slice(i, i + 2);
    byte_string.push(parseInt(hex, 16));
  }
  return byte_string;
}

// helper function to parse an 32 bit float
function decode_float(bytes, cursor) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = decode_int32(bytes, cursor);
  var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits >>> 23 & 0xff;
  if (e == 0xFF) {
    if (bits & 0x7fffff) {
      return NaN;
    } else {
      return sign * Infinity;
    }
  }
  var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

// helper function to parse an unsigned uint32
function decode_uint32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned int32
function decode_int32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned uint16
function decode_uint16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse a signed int16
function decode_int16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  if (bytes[i] & 0x80) {
    result = 0xFFFF;
  }
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse an unsigned int8
function decode_uint8(bytes, cursor) {
  var result = bytes[cursor.value];
  cursor.value += 1;

  return result;
}

// helper function to parse an unsigned int8
function decode_int8(bytes, cursor) {
  var result = 0;
  var i = cursor.value;
  if (bytes[i] & 0x80) {
    result = 0xFFFFFF;
  }
  result = (result << 8) | bytes[i--];
  cursor.value += 1;

  return result;
}

// helper function to parse a single temperature_16bit value
function decode_temperature_16bit(bytes, cursor) {
  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  // Get raw value which could be an error code
  var temperature = decode_int16(bytes, cursor);

  if (
    temperature == PT100_LOWER_BOUND_ERROR_CODE ||
    temperature == PT100_UPPER_BOUND_ERROR_CODE ||
    temperature == HARDWARE_ERROR_CODE) {
    return temperature;
  } else {
    // Convert value to temperature value
    temperature = temperature / 10;
    return temperature;
  }
}

// helper function to parse tt application temperature for version = 4
function decode_sensor_temperature_v4(bytes, cursor) {
  var temperature = {};

  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  var min = decode_temperature_16bit(bytes, cursor);
  var max = decode_temperature_16bit(bytes, cursor);
  var avg = decode_temperature_16bit(bytes, cursor);

  if (
    min == PT100_LOWER_BOUND_ERROR_CODE ||
    max == PT100_LOWER_BOUND_ERROR_CODE ||
    avg == PT100_LOWER_BOUND_ERROR_CODE
  ) {
    if (max == min && avg == min) { // In case of error min, max, and ave are all the same
      temperature.status = "PT100 Lower Bound Error";
    }
    else {
      throw new Error("Invalid min, max, avg. PT100 lower bound error is included!");
    }
  } else if (
    min == PT100_UPPER_BOUND_ERROR_CODE ||
    max == PT100_UPPER_BOUND_ERROR_CODE ||
    avg == PT100_UPPER_BOUND_ERROR_CODE
  ) {
    if (max == min && avg == min) {
      temperature.status = "PT100 Upper Bound Error";
    }
    else {
      throw new Error("Invalid min, max, avg. PT100 Upper bound error is included!");
    }
  } else if (
    min == HARDWARE_ERROR_CODE ||
    max == HARDWARE_ERROR_CODE ||
    avg == HARDWARE_ERROR_CODE
  ) {
    if (max == min && avg == min) {
      temperature.status = "Hardware Error";
    }
    else {
      console.log(min, max, avg);
      throw new Error("Invalid min, max, avg. Hardware Error is included!");
    }
  } else {
    temperature.min = min;
    temperature.max = max;
    temperature.avg = avg;

    temperature.status = "OK";
  }

  return temperature;
}

// helper function to parse tt application temperature for version = 4
function decode_sensor_temperature_normal_v4(bytes, cursor, selection) {
  var temperature = {};

  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  var value = decode_temperature_16bit(bytes, cursor);

  if ( value == PT100_LOWER_BOUND_ERROR_CODE ) {
    temperature.status = "PT100 Lower Bound Error";
  } else if ( value == PT100_UPPER_BOUND_ERROR_CODE ) {
    temperature.status = "PT100 Upper Bound Error";
  } else if ( value == HARDWARE_ERROR_CODE ) {
    temperature.status = "Hardware Error";
  } else {
    if (selection == "min_only") {
      temperature.min = value;
    } else if (selection == "max_only") {
      temperature.max = value;
    } else if (selection == "avg_only") {
      temperature.avg = value;
    } else {
      throw new Error("Only min, max, or, avg is accepted!");
    }
    temperature.status = "OK";
  }

  return temperature;
}

// helper function to parse tt application temperature
function decode_sensor_temperature_v2_v3(bytes, cursor, version) {
  var temperature = {};
  var PT100LowerErrorCode = -3000;
  var PT100UpperErrorCode = -3001;
  var VboundLowerErrorCode = -3002;
  var VboundUpperErrorCode = -3003;
  var UnknownType = -3004;

  min = decode_int16(bytes, cursor) / 10;
  max = decode_int16(bytes, cursor) / 10;
  avg = decode_int16(bytes, cursor) / 10;

  if (version == 2) {
    temperature.min = min;
    temperature.max = max;
    temperature.avg = avg;
  } else if (version == 3) {
    if (
      min == PT100LowerErrorCode ||
      avg == PT100LowerErrorCode ||
      max == PT100LowerErrorCode
    ) {
      temperature.status = "PT100 bound Lower Error";
    } else if (
      min == PT100UpperErrorCode ||
      avg == PT100UpperErrorCode ||
      max == PT100UpperErrorCode
    ) {
      temperature.status = "PT100 bound Upper Error";
    } else if (
      min == VboundLowerErrorCode ||
      avg == VboundLowerErrorCode ||
      max == VboundLowerErrorCode
    ) {
      temperature.status = "V bound Lower Error";
    } else if (
      min == VboundUpperErrorCode ||
      avg == VboundUpperErrorCode ||
      max == VboundUpperErrorCode
    ) {
      temperature.status = "V bound Upper Error";
    } else if (min == UnknownType || avg == UnknownType || max == UnknownType) {
      temperature.status = "Unrecognized sensor type";
    } else {
      temperature.min = min;
      temperature.max = max;
      temperature.avg = avg;
      temperature.status = "OK";
    }
  } else {
    throw new Error("Invalid protocol version");
  }

  return temperature;
}


// helper function to parse tt application temperature
function decode_sensor_temperature(bytes, cursor, version) {
  var temperature = {};

  switch (version) {
    case 2:
    case 3: {
      temperature = decode_sensor_temperature_v2_v3(bytes, cursor, version);
      break;
    }

    case 4: {
      temperature = decode_sensor_temperature_v4(bytes, cursor);
      break;
    }

    default:
      throw new Error("Unsupported protocol version");
  }

  return temperature;
}

// helper function to parse reboot_info
function decode_reboot_info(reboot_type, bytes, cursor) {
  var result;

  var reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
  reboot_payload[0] += decode_uint8(bytes, cursor);
  reboot_payload[1] += decode_uint8(bytes, cursor);
  reboot_payload[2] += decode_uint8(bytes, cursor);
  reboot_payload[3] += decode_uint8(bytes, cursor);
  reboot_payload[4] += decode_uint8(bytes, cursor);
  reboot_payload[5] += decode_uint8(bytes, cursor);
  reboot_payload[6] += decode_uint8(bytes, cursor);
  reboot_payload[7] += decode_uint8(bytes, cursor);

  switch (reboot_type) {
    case 0: // REBOOT_INFO_TYPE_NONE
      result = 'none';
      break;

    case 1: // REBOOT_INFO_TYPE_POWER_CYCLE
      result = 'power cycle';
      break;

    case 2: // REBOOT_INFO_TYPE_WDOG
      result = 'swdog (' + String.fromCharCode(
        reboot_payload[0],
        reboot_payload[1],
        reboot_payload[2],
        reboot_payload[3]).replace(/[^\x20-\x7E]/g, '') + ')';

      break;

    case 3: // REBOOT_INFO_TYPE_ASSERT
      var payloadCursor = {}; // keeping track of which byte to process.
      payloadCursor.value = 4; // skip caller address
      actualValue = decode_int32(reboot_payload, payloadCursor);
      result = 'assert (' +
        'caller: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; value: ' + actualValue.toString() + ')';
      break;

    case 4: // REBOOT_INFO_TYPE_APPLICATION_REASON
      result = 'application (0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) + ')';
      break;

    case 5: // REBOOT_INFO_TYPE_SYSTEM_ERROR
      result = 'system (error: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; caller: 0x' +
        uint8_to_hex(reboot_payload[7]) +
        uint8_to_hex(reboot_payload[6]) +
        uint8_to_hex(reboot_payload[5]) +
        uint8_to_hex(reboot_payload[4]) + ')';
      break;

    default:
      result = 'unknown (' +
        '0x' + uint8_to_hex(reboot_payload[0]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[1]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[2]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[3]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[4]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[5]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[6]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[7]) + ')';
      break;
  }

  return result;
}

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16).toUpperCase())).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16).toUpperCase())).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16).toUpperCase())).slice(-8);
}

function message_types_lookup_v2(type_id) {
  type_names = ["boot",
    "activated",
    "deactivated",
    "sensor_event",
    "device_status",
    "base_configuration",
    "sensor_configuration",
    "sensor_data_configuration",
    "sensor_data",
    "calibration_info",
    "user_calibration",
    "factory_calibration"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function device_types_lookup(type_id) {
  type_names = ["", // reserved
    "ts",
    "vs-qt",
    "vs-mt",
    "tt",
    "ld",
    "vb",
    "cs",
    "pt"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function trigger_lookup(trigger_id) {
  switch (trigger_id) {
    case 0:
      return "timer";
    case 1:
      return "condition_0";
    case 2:
      return "condition_1";
    case 3:
      return "condition_2";
    case 4:
      return "condition_3";
    case 5:
      return "user trigger";
    default:
      return "unknown";
  }
}

Object.prototype.in =
  function() {
    for (var i = 0; i < arguments.length; i++)
      if (arguments[i] == this) return true;
    return false;
  }

/***************************
 * Message decoder functions
 */

 function decode_boot_msg_v4(bytes, cursor) {
  var expected_length_normal = 2;
  var expected_length_debug = 18;
  if (bytes.length != expected_length_normal && bytes.length != expected_length_debug) {
    throw new Error("Invalid boot message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_debug);
  }

  var boot = {};

  // byte[1]
  reboot_reason = decode_uint8(bytes, cursor);
  boot.reboot_reason = {};
  boot.reboot_reason.major = reboot_lookup_major(reboot_reason);
  boot.reboot_reason.minor = reboot_lookup_minor(reboot_reason);

  // debug data
  if (bytes.length == expected_length_debug) {
    boot.debug = '0x'
    for (var i = cursor.value; i < bytes.length; i++) {
      boot.debug = boot.debug + uint8_to_hex(bytes[i]);
    }
  }

  return boot;
}

function decode_boot_msg(bytes, cursor) {
  var boot = {}

  var expected_length = 23;
  if (bytes.length != expected_length) {
    throw new Error("Invalid boot message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  device_type = decode_uint8(bytes, cursor);
  boot.device_type = device_types_lookup(device_type);

  // byte[2..5]
  var version_hash = decode_uint32(bytes, cursor);
  boot.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[6..7]
  var base_config_crc = decode_uint16(bytes, cursor);
  boot.base_config_crc = '0x' + uint16_to_hex(base_config_crc);

  // byte[8..9]
  var sensor_config_crc = decode_uint16(bytes, cursor);
  boot.sensor_config_crc = '0x' + uint16_to_hex(sensor_config_crc);

  // byte[10]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[11]
  boot.reboot_counter = decode_uint8(bytes, cursor);

  // byte[12]
  boot_type = decode_uint8(bytes, cursor);

  // byte[13..20]
  boot.reboot_info = decode_reboot_info(boot_type, bytes, cursor);

  // byte[21]
  boot.last_device_state = decode_uint8(bytes, cursor);

  // byte[22]
  var bist = decode_uint8(bytes, cursor);
  boot.bist = '0x' + uint8_to_hex(bist);

  return boot;
}

function decode_sensor_event_msg_normal(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection == "extended") {
    throw new Error("Mismatch between extended bit flag and message length!");
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.temperature = {};
  sensor_event.temperature =  decode_sensor_temperature_normal_v4(bytes, cursor, sensor_event.selection);

  return sensor_event;
}

function decode_sensor_event_msg_extended(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection != "extended") {
    throw new Error("Mismatch between extended bit flag and message length!");
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.temperature = {};
  sensor_event.temperature =  decode_sensor_temperature_v4(bytes, cursor);

  return sensor_event;
}

function decode_sensor_event_msg(bytes, cursor, version) {
  var sensor_event = {}

  var expected_length = 9;
  if (bytes.length != expected_length) {
    throw new Error("Invalid sensor_event message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  trigger = decode_uint8(bytes, cursor);
  sensor_event.trigger = trigger_lookup(trigger);

  // byte[2..7]
  sensor_event.temperature = {};

  sensor_event.temperature = decode_sensor_temperature(bytes, cursor, version);

  // byte[8]
  conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  return sensor_event;
}

function decode_device_status_msg_v4(bytes, cursor) {
  var expected_length = 9;
  if (bytes.length != expected_length) {
    throw new Error("Invalid device status message length " + bytes.length + " instead of " + expected_length);
  }

  var device_status = {};

  // byte[1]
  device_status.battery_voltage = decode_battery_voltage(bytes, cursor);

  // byte[2]
  device_status.temperature = decode_int8(bytes, cursor);

  // byte[3,4]
  device_status.lora_tx_counter = decode_uint16(bytes, cursor);

  // byte[5]
  rssi = decode_uint8(bytes, cursor);
  device_status.avg_rssi = rssi_lookup(rssi);

  // byte[6]
  var bist = decode_uint8(bytes, cursor);
  device_status.bist = '0x' + uint8_to_hex(bist);

  // byte[7]
  device_status.event_counter = decode_uint8(bytes, cursor);

  // byte[8]
  var sensor_type = decode_uint8(bytes, cursor);
  device_status.sensor_type = decode_sensor_type(sensor_type);

  return device_status;
}

function decode_device_status_msg(bytes, cursor, version) {
  var device_status = {};


  var expected_length;
  switch (version) {
    case 2:
    case 3: {
      expected_length = 18;
      break;
    }

    case 4: {
      expected_length = 19;
      break;
    }

    default:
      throw new Error("Invalid protocol version");
  }

  if (bytes.length != expected_length) {
    throw new Error("Invalid device_status message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1..2]
  var base_config_crc = decode_uint16(bytes, cursor);
  device_status.base_config_crc = '0x' + uint16_to_hex(base_config_crc);

  // byte[3..4]
  var sensor_config_crc = decode_uint16(bytes, cursor);
  device_status.sensor_config_crc = '0x' + uint16_to_hex(sensor_config_crc);

  // byte[5]
  device_status.event_counter = decode_uint8(bytes, cursor);

  // byte[6..11]
  device_status.battery_voltage = {};
  device_status.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
  device_status.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
  device_status.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

  // byte[12..14]
  device_status.temperature = {};
  device_status.temperature.min = decode_int8(bytes, cursor);
  device_status.temperature.max = decode_int8(bytes, cursor);
  device_status.temperature.avg = decode_int8(bytes, cursor);

  // byte[15]
  device_status.tx_counter = decode_uint8(bytes, cursor);

  // byte[16]
  device_status.avg_rssi = -decode_uint8(bytes, cursor);

  // byte[17]
  device_status.avg_snr = decode_int8(bytes, cursor);

  if (version == 4) {
    // byte[18]
    device_status.bist = decode_uint8(bytes, cursor);
  }


  return device_status;
}

/**
  * Decode header
  */
 function decode_header(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  header.message_type = message_types_lookup_v2(data & 0x0F);

  return header;
}

/**
  * Decode header V4
  */
 function decode_header_v4(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;

  return header;
}

function reboot_lookup_major(reboot_reason) {
  major_reboot_reason = reboot_reason & 0x0F;
  switch (major_reboot_reason) {
    case 0:
      return "none";
    case 1:
      return "config update";
    case 2:
      return "firmware update";
    case 3:
      return "button reset"
    case 4:
      return "power";
    case 5:
      return "communication failure";
    default:
      return "system failure";
  }
}

function reboot_lookup_minor(reboot_reason) {
  major_reboot_reason = reboot_reason & 0x0F;
  minor_reboot_reason = (reboot_reason >> 4) & 0x0F;

  switch (major_reboot_reason) {
    case 0:
      return ""; // No minor reboot reason
    case 1:
      switch (minor_reboot_reason) {
        case 0:
          return "success";
        case 1:
          return "rejected";
        default:
          return "unknown";
      }
    case 2:
      switch (minor_reboot_reason) {
        case 0:
          return "success";
        case 1:
          return "rejected";
        case 2:
          return "error";
        case 3:
          return "in progress";
        default:
          return "unknown";
      }
    case 3:
      return ""; // No minor reboot reason
    case 4:
      switch (minor_reboot_reason) {
        case 0:
          return "black out";
        case 1:
          return "brown out";
        case 2:
          return "power safe state";
        default:
          return "unknown";
      }
    case 5:
      return ""; // No minor reboot reason
    case 6:
      return ""; // No minor reboot reason
    default:
      return "unknown";
  }
}

/**
  * Decode battery voltage based on protocol version 4
  *
  * Raw value is between 0 - 255
  * 0 represent 2 V, while 255 represent 4 V
  */
 function decode_battery_voltage(bytes, cursor) {
  var raw = decode_uint8(bytes, cursor);

  var offset = 2; // Lowest voltage is 2 V
  var scale = 2 / 255;

  var voltage = raw * scale + offset;

  return voltage;
}

function rssi_lookup(rssi) {
  switch (rssi) {
    case 0:
      return "0..-79";
    case 1:
      return "-80..-99";
    case 2:
      return "-100..-129";
    case 3:
      return "<-129";
    default:
      return "unknown";
  }
}

// helper function to decode sensor type
function decode_sensor_type(type) {
  switch (type) {
    case 0:
      return "PT100";
    case 1:
      return 'J';
    case 2:
      return 'K';
    case 3:
      return 'T';
    case 4:
      return 'N';
    case 5:
      return 'E';
    case 6:
      return 'B';
    case 7:
      return 'R';
    case 8:
      return 'S';
    default:
      throw new Error("Invalid thermocouple type!");
  }
}

function decode_config_update_ans_msg(bytes, cursor) {
  var expected_length = 6;
  if (bytes.length != expected_length) {
    throw new Error("Invalid config update ans message length " + bytes.length + " instead of " + expected_length);
  }

  var ans = {};

  // byte[0]
  ans = decode_config_header(bytes, cursor);

  // byte[1..4]
  tag = decode_uint32(bytes, cursor);
  ans.tag = '0x' + uint32_to_hex(tag);

  // byte[5]
  counter = decode_uint8(bytes, cursor);
  ans.counter = counter & 0x0F;

  return ans;
}

/**
  * Decode config header
  */
 function decode_config_header(bytes, cursor) {
  var PROTOCOL_VERSION_V4 = 4;

  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  if (header.protocol_version != PROTOCOL_VERSION_V4) {
    throw new Error("Invalid protocol version: " + header.protocol_version + "instead of" + PROTOCOL_VERSION_V4);
  }
  header.config_type = config_type_lookup(data & 0x0F);

  return header;
}

function config_type_lookup(type_id) {
  type_names = [
    "base",
    "region",
    "reserved",
    "sensor",
    "unknown", // Not applicable to TT
    "sensor_conditions"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function decode_deactivated_msg_v4(bytes, cursor) {
  var deactivated = {};

  var expected_length = 3;
  if (bytes.length != expected_length) {
    throw new Error("Invalid deactivated message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  var reason = decode_uint8(bytes, cursor);
  deactivated.reason = deactivation_reason_lookup(reason);

  // byte[2]
  var reason_length = decode_uint8(bytes, cursor);

  if (reason_length != 0) {
    throw new Error("Unsupported deactivated reason length");
  }

  return deactivated;
}

function deactivation_reason_lookup(deactivation_id) {
  switch (deactivation_id) {
    case 0:
      return "user_triggered"; // REVIEW: For TT we currently only have this one, right?
    default:
      return "unknown";
  }
}

function decode_activated_msg_v4(bytes, cursor) {
  var activated = {};

  var expected_length = 2;
  if (bytes.length != expected_length) {
    throw new Error("Invalid activated message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  device_type = decode_uint8(bytes, cursor);
  activated.device_type = device_types_lookup(device_type);

  return activated;
}

function decode_sensor_event_msg_v4(bytes, curser) {
  var expected_length_normal = 5;
  var expected_length_extended = 9;
  if (bytes.length == expected_length_normal) {
    return decode_sensor_event_msg_normal(bytes, curser);
  }
  else if (bytes.length == expected_length_extended) {
    return decode_sensor_event_msg_extended(bytes, curser);
  }
  else {
    throw new Error("Invalid sensor_event message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_extended);
  }
}

function lookup_selection(selection) {
  switch (selection) {
    case 0:
      return "extended";
    case 1:
      return "min_only";
    case 2:
      return "max_only";
    case 3:
      return "avg_only";
    default:
      return "unknown";
  }
}

function lookup_trigger(trigger) {
  switch (trigger) {
    case (0):
      return "condition change";
    case (1):
      return "periodic";
    case (2):
      return "button press";
    default:
      return "unknown";
  }
}