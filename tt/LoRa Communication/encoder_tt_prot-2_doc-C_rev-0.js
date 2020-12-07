// Protocol v2 only

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
    case 2: {
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
              break;
          }
          break;
        }
        break;
        default:
          throw "Invalid message type!"
          break;
      }
      break;
    }
    default:
      throw "Protocol version is not suppported!"
      break;
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
  encode_device_config_switch(bytes, obj.switch_mask);
  encode_uint8(bytes, obj.communication_max_retries);             // Unit: -
  encode_uint8(bytes, obj.unconfirmed_repeat);                    // Unit: -
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
  encode_device_type(bytes, obj.device_type, obj.enable_rtd);
  encode_uint16(bytes, obj.temperature_measurement_interval_seconds);    // Unit: s
  encode_uint16(bytes, obj.periodic_event_message_interval);            // Unit: -
  encode_events_mode(bytes, obj.events[0].mode);                        // Unit: -
  encode_int16(bytes, obj.events[0].threshold_temperature * 100);      // Unit: 0.1'
  encode_uint8(bytes, obj.events[0].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[1].mode);                        // Unit: -
  encode_int16(bytes, obj.events[1].threshold_temperature * 100);      // Unit: 0.1'
  encode_uint8(bytes, obj.events[1].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[2].mode);                        // Unit: -
  encode_int16(bytes, obj.events[2].threshold_temperature * 100);      // Unit: 0.1'
  encode_uint8(bytes, obj.events[2].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[3].mode);                        // Unit: -
  encode_int16(bytes, obj.events[3].threshold_temperature * 100);      // Unit: 0.1'
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

// helper function to encode device type
function encode_device_type(bytes, type, enable_rtd) {
  var value = 0;
  switch (type){
    case 'ts':
      value = 1;
      break;
    case 'vs-qt':
      value = 2;
      break;
    case 'vs-mt':
      value = 3;
      break;
    case 'tt':
      value = 4;
      break;
    default:
      value = 0;
      break;
  }

  if (enable_rtd) {
    value |= 1 << 7;
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

  var C = -1, L = buf.length - 3;
  var i = 0;
  while (i < buf.length) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
  return C & 0xFFFF;
}
