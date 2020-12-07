// Protocol v2 only

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Decode: Decode,
    Decoder: Decoder,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
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
    case 2: { // protocol_version = 2
      decoded.header.message_type = message_types_lookup_v2(message_type);

      var cursor = {}; // keeping track of which byte to process.
      cursor.value = 1; // skip header that is already done

      switch (message_type) {
        case 0: { // Boot message
          decoded.boot = {};

          device_type = decode_uint8(bytes, cursor);
          decoded.boot.device_type = device_types_lookup_v2(device_type);

          var version_hash = decode_uint32(bytes, cursor);
          decoded.boot.version_hash = uint32_to_hex(version_hash);

          var device_config_crc = decode_uint16(bytes, cursor);
          decoded.boot.device_config_crc = uint16_to_hex(device_config_crc);

          var application_config_crc = decode_uint16(bytes, cursor);
          decoded.boot.application_config_crc = uint16_to_hex(application_config_crc);

          decoded.boot.reset_flags = decode_uint8(bytes, cursor);
          decoded.boot.reboot_counter = decode_uint8(bytes, cursor);

          reboot_type = decode_uint8(bytes, cursor);
          reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
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
              decoded.boot.reboot_info = 'none';
              break;

            case 1: // REBOOT_INFO_TYPE_POWER_CYCLE
              decoded.boot.reboot_info = 'power cycle';
              break;

            case 2: // REBOOT_INFO_TYPE_WDOG
              decoded.boot.reboot_info = 'swdog (' + String.fromCharCode(
                  reboot_payload[0],
                  reboot_payload[1],
                  reboot_payload[2],
                  reboot_payload[3]).replace(/[^\x20-\x7E]/g, '') + ')';

              break;

            case 3: // REBOOT_INFO_TYPE_ASSERT
              decoded.boot.reboot_info = 'assert (' +
                  String.fromCharCode(
                      reboot_payload[0], reboot_payload[1],
                      reboot_payload[2], reboot_payload[3],
                      reboot_payload[4], reboot_payload[5]).replace(/[^\x20-\x7E]/g, '') + ':' +
                  Number(reboot_payload[6] + (reboot_payload[7] << 8)) .toString() + ')';
              break;

            case 4: // REBOOT_INFO_TYPE_APPLICATION_REASON
              decoded.boot.reboot_info = 'application (0x' +
                  uint8_to_hex(reboot_payload[3]) +
                  uint8_to_hex(reboot_payload[2]) +
                  uint8_to_hex(reboot_payload[1]) +
                  uint8_to_hex(reboot_payload[0]) + ')';
              break;

              case 5: // REBOOT_INFO_TYPE_SYSTEM_ERROR
              decoded.boot.reboot_info = 'system (0x' +
                  uint8_to_hex(reboot_payload[3]) +
                  uint8_to_hex(reboot_payload[2]) +
                  uint8_to_hex(reboot_payload[1]) +
                  uint8_to_hex(reboot_payload[0]) + ')';
              break;

            default:
              decoded.boot.reboot_info = 'unknown (' +
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

          decoded.boot.last_device_state = decode_uint8(bytes, cursor);
          decoded.boot.bist = decode_uint8(bytes, cursor);
          break;
        }

        case 1: { // Activated message
          break;
        }

        case 2: { // Deactivated message
          break;
        }

        case 3: { // Application event message
          decoded.application_event = {};

          trigger = decode_uint8(bytes, cursor);
          decoded.application_event.trigger = trigger_lookup_v2(trigger);

          decoded.application_event.temperature = {};
          decoded.application_event.temperature.min = decode_int16(bytes, cursor) / 100;
          decoded.application_event.temperature.max = decode_int16(bytes, cursor) / 100;
          decoded.application_event.temperature.avg = decode_int16(bytes, cursor) / 100;

          conditions = decode_uint8(bytes, cursor);
          decoded.application_event.condition_0 = (conditions & 1);
          decoded.application_event.condition_1 = ((conditions >> 1) & 1);
          decoded.application_event.condition_2 = ((conditions >> 2) & 1);
          decoded.application_event.condition_3 = ((conditions >> 3) & 1);


          break;
        }

        case 4: { // Device status message
          decoded.device_status = {};

          var device_config_crc = decode_uint16(bytes, cursor);
          decoded.device_status.device_config_crc = uint16_to_hex(device_config_crc);

          var application_config_crc = decode_uint16(bytes, cursor);
          decoded.device_status.application_config_crc = uint16_to_hex(application_config_crc);

          decoded.device_status.event_counter = decode_uint8(bytes, cursor);

          decoded.device_status.battery_voltage = {}
          decoded.device_status.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
          decoded.device_status.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
          decoded.device_status.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

          decoded.device_status.temperature = {}
          decoded.device_status.temperature.min = decode_int8(bytes, cursor);
          decoded.device_status.temperature.max = decode_int8(bytes, cursor);
          decoded.device_status.temperature.avg = decode_int8(bytes, cursor);

          decoded.device_status.tx_counter = decode_uint8(bytes, cursor);
          decoded.device_status.avg_rssi = -decode_uint8(bytes, cursor);
          decoded.device_status.avg_snr = decode_uint8(bytes, cursor);
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
  return ('0' + (Number(d).toString(16))).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16))).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16))).slice(-8);
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

function device_types_lookup_v2(type_id) {
  type_names = ["", // reserved
                "ts",
                "vs-qt",
                "vs-mt"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function trigger_lookup_v2(trigger_id) {
  switch (trigger_id)
  {
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
    default:
      return "unknown";
    }
}

Object.prototype.in = function() {
    for(var i=0; i<arguments.length; i++)
       if(arguments[i] == this) return true;
    return false;
}
