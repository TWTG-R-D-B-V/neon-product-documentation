/**
 * Filename             : decoder-cs_rev-2.js
 * Latest commit        : 4320aed4
 * Protocol v1 document : NEON-Contact-Sensor_Communication-Protocol-v1_VS-xxx-01-CSxx_4003_1_A.pdf

 * Release History
 *
 * 2021-11-09 revision 0
 * - Initial version
 *
 * 2023-12-13 revision 1
 * - Added support of LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 * 
 * 2024-10-14 revision 2
 * - Handle truncated payloads (e.g. due to max payload size depending on region and data rate)
 *
 * YYYY-MM-DD revision X
 *
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    decodeUplink: decodeUplink,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
    decode_reboot_info: decode_reboot_info,
    from_hex_string: from_hex_string
  };
}

// Decode an uplink message from a buffer
// (array) of bytes to an object of fields.
function Decode(fPort, bytes) { // Used for ChirpStack (aka LoRa Network Server)
  var decoded = {};
  decoded.header = {};
  decoded.header.protocol_version = bytes[0] >> 4;
  message_type = bytes[0] & 0x0F;

  switch (decoded.header.protocol_version) {
    case 1: { // protocol_version = 1
      decoded.header.message_type = message_types_lookup_v2(message_type);

      var cursor = {}; // keeping track of which byte to process.
      cursor.value = 1; // skip header that is already done

      switch (message_type) {
        case 0: { // Boot message
          decoded.boot = decode_boot_msg(bytes, cursor);
          break;
        }

        case 1: { // Activated message
          break;
        }

        case 2: { // Deactivated message
          break;
        }

        case 3: { // Application event message
          decoded.application_event = decode_application_event_msg(bytes, cursor)
          break;
        }

        case 4: { // Device status message
          decoded.device_status = decode_device_status_msg(bytes, cursor);
          break;
        }

      }
      break;
    }
  }

  return decoded;
}

function Decoder(obj, fPort) { // for The Things Network server
  return Decode(fPort, obj);
}

/**
 * LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 */
function decodeUplink(input) {
  let result = {};
  try {
    result.data = Decode(input.fPort, input.bytes);
  } catch (error) {
    result.errors = [error.message];
  }
  return result;
}

/**
 * Decoder for plain HEX string
 */
function DecodeHexString(hex_string) {
  return Decode(15, from_hex_string(hex_string));
}

/******************
 * Helper functions
 */

// helper function to convert a ASCII HEX string to a byte string
function from_hex_string(hex_string) {
  if (typeof hex_string != "string") throw new Error("hex_string must be a string");
  if (!hex_string.match(/^[0-9A-F]*$/gi)) throw new Error("hex_string contain only 0-9, A-F characters");
  if (hex_string.length & 0x01 > 0) throw new Error("hex_string length must be a multiple of two");

  var byte_string = [];
  for (i = 0; i < hex_string.length; i += 2)
  {
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

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16).toUpperCase())).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16).toUpperCase())).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16).toUpperCase())).slice(-8);
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

function message_types_lookup_v2(type_id) {
  type_names = ["boot",
                "activated",
                "deactivated",
                "application_event",
                "device_status",
                "device_configuration",
                "application_configuration"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

//https://docs.google.com/spreadsheets/d/1jBYUyNSFuDW65eaMB6TkMFg6F1rLXn-mgAp75D7A8ak/edit#gid=0
function device_types_lookup_v2(type_id) {
  type_names = ["", // reserved
                "ts",
                "vs-qt",
                "vs-mt",
                "TT",
                "vb",
                "ld",
                "cs"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function state_lookup(state_id) {
  switch (state_id)
  {
    case 0:
      return "open";
    case 1:
      return "closed";
    default:
      throw new Error("Invalid state");
    }
}

Object.prototype.in = function () {
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i] == this) return true;
  return false;
};

/***************************
 * Message decoder functions
 */

function decode_boot_msg(bytes, cursor) {
  var boot = {};

  var expected_length = 23;
  if (bytes.length != expected_length && bytes.length != 11) {
    throw new Error(
      "Invalid boot message length " +
      bytes.length +
      " instead of " +
      expected_length
    );
  }

  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  boot.device_type = device_types_lookup_v2(device_type);

  // byte[2..5]
  var version_hash = decode_uint32(bytes, cursor);
  boot.version_hash = "0x" + uint32_to_hex(version_hash);

  // byte[6..7]
  var device_config_crc = decode_uint16(bytes, cursor);
  boot.device_config_crc = "0x" + uint16_to_hex(device_config_crc);

  // byte[8..9]
  var application_config_crc = decode_uint16(bytes, cursor);
  boot.application_config_crc = "0x" + uint16_to_hex(application_config_crc);

  // byte[10]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.reset_flags = "0x" + uint8_to_hex(reset_flags);

  if (bytes.length == 11)
  {
    // truncated (DR0), fill in blanks
    boot.reboot_counter = null;
    boot.reboot_info = null;
    boot.last_device_state = null;
    boot.bist = null;
    return boot; // don't continue
  }

  // byte[11]
  boot.reboot_counter = decode_uint8(bytes, cursor);

  // byte[12]
  var boot_type = decode_uint8(bytes, cursor);

  // byte[13..20]
  boot.reboot_info = decode_reboot_info(boot_type, bytes, cursor);

  // byte[21]
  boot.last_device_state = decode_uint8(bytes, cursor);

  // byte[22]
  var bist = decode_uint8(bytes, cursor);
  boot.bist = "0x" + uint8_to_hex(bist);

  return boot;
}

function decode_application_event_msg(bytes, cursor) {
  var application_event = {}

  var expected_length = 3;
  var expected_length_debug = 8;

  if ((bytes.length != expected_length) && (bytes.length != expected_length_debug)) {
    throw new Error(
      "Invalid application_event message length " +
      bytes.length +
      " instead of " +
      expected_length + " or " +
      expected_length_debug
    );
  }

  // byte[1]
  var state = decode_uint8(bytes, cursor);
  application_event.state = state_lookup(state);

  // byte[2]
  application_event.state_transition_sequence = decode_uint8(bytes, cursor);


  if (bytes.length > cursor.value) { // any debug values provided?
    // byte[3]
    application_event.debug = {};
    application_event.debug.temperature = decode_int8(bytes, cursor);

    // byte[4..7]
    application_event.debug.magnet_magnitude = decode_uint32(bytes, cursor);
  }

  return application_event;
}

function decode_device_status_msg(bytes, cursor) {
  var device_status = {};

  var expected_length = 18;
  if (bytes.length != expected_length && bytes.length != 11) {
    throw new Error(
      "Invalid device_status message length " +
      bytes.length +
      " instead of " +
      expected_length
    );
  }

  // byte[1..2]
  var device_config_crc = decode_uint16(bytes, cursor);
  device_status.device_config_crc = "0x" + uint16_to_hex(device_config_crc);

  // byte[3..4]
  var application_config_crc = decode_uint16(bytes, cursor);
  device_status.application_config_crc = "0x" + uint16_to_hex(application_config_crc);

  // byte[5]
  device_status.event_counter = decode_uint8(bytes, cursor);

  if (bytes.length == 11)
  {
    // truncated (DR0), fill in blanks
    device_status.battery_voltage = {low: null, high: null, settle: null};
    device_status.temperature = {min: null, max: null, avg: null};
    device_status.tx_counter = null;
    device_status.avg_rssi = null;
    device_status.avg_snr = null;
    return device_status; // don't continue
  }

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

  return device_status;
}
