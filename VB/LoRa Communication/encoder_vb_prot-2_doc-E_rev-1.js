/**
 * Filename      : encoder_vb_prot-2_doc-E_rev-1.js
 * Latest commit : 7b68a20c
 *
 * Release History
 *
 * 2021-04-14 revision 0
 * - initial version
 *
 * 2021-03-05 revision 1
 * - Uses scientific notation for sensor data scale
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Encode: Encode,
    Encoder: Encoder,
    EncodeBaseConfig: EncodeBaseConfig, // used by generate_config_bin.py
    EncodeSensorConfig: EncodeSensorConfig, // used by generate_config_bin.py
    EncodeSensorDataConfig: EncodeSensorDataConfig, // used by generate_config_bin.py
    encode_header: encode_header,
    encode_events_mode: encode_events_mode,
    encode_base_config: encode_base_config,
    encode_vb_sensor_config: encode_vb_sensor_config,
    encode_vb_sensor_data_config: encode_vb_sensor_data_config,
    encode_calculation_trigger: encode_calculation_trigger,
    encode_fft_trigger_threshold: encode_fft_trigger_threshold,
    encode_fft_selection: encode_fft_selection,
    encode_frequency_range: encode_frequency_range,
    encode_base_config_switch: encode_base_config_switch,
    encode_device_type: encode_device_type,
    encode_uint32: encode_uint32,
    encode_int32: encode_int32,
    encode_uint16: encode_uint16,
    encode_int16: encode_int16,
    encode_uint8: encode_uint8,
    encode_int8: encode_int8,
    encode_sci_6: encode_sci_6,
    calc_crc: calc_crc,
  };
}

var mask_byte = 255;


function Encode(fPort, obj) { // Used for ChirpStack (aka LoRa Network Server)
  // Encode downlink messages sent as
  // object to an array or buffer of bytes.
  var bytes = [];

  var PROTOCOL_VERSION = 2;

  var MSG_BASE_CONFIG         = 5;
  var MSG_SENSOR_CONFIG       = 6;
  var MSG_SENSOR_DATA_CONFIG  = 7;

  switch (obj.header.protocol_version) {
    case PROTOCOL_VERSION: {
      switch (obj.header.message_type) {
        case "base_configuration": {
          encode_header(bytes, MSG_BASE_CONFIG, obj.header.protocol_version);
          encode_base_config(bytes, obj);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "sensor_configuration": {
          switch (obj.device_type) {
            case "vb":
              encode_header(bytes, MSG_SENSOR_CONFIG, obj.header.protocol_version);
              encode_vb_sensor_config(bytes, obj);
              encode_uint16(bytes, calc_crc(bytes.slice(1)));

              break;
            default:
              throw new Error("Invalid device type!");
          }
          break;
        }
        case "sensor_data_configuration": {
          switch (obj.device_type) {
            case "vb":
              encode_header(bytes, MSG_SENSOR_DATA_CONFIG, obj.header.protocol_version);
              encode_vb_sensor_data_config(bytes, obj);
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
    default:
      throw new Error("Protocol version is not suppported!");
  }

  return bytes;
}

function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
}

/**
 * Base configuration encoder
 */
function EncodeBaseConfig(obj) {
  var bytes = [];
  encode_base_config(bytes, obj);

  return bytes;
}

function encode_base_config(bytes, obj) {
  encode_base_config_switch(bytes, obj.switch_mask);
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
 * VB sensor encoder
 */
function EncodeSensorConfig(obj) {
  var bytes = [];
  encode_vb_sensor_config(bytes, obj);

  return bytes;
}

/**
 * VB sensor data encoder
 */
function EncodeSensorDataConfig(obj) {
  var bytes = [];
  encode_vb_sensor_data_config(bytes, obj);

  return bytes;
}

function encode_vb_sensor_config(bytes, obj) {
  encode_device_type(bytes, obj.device_type);

  // Timing configs
  encode_uint16(bytes, obj.measurement_interval_seconds);     // Unit: s
  encode_uint16(bytes, obj.periodic_event_message_interval);  // Unit: -
  encode_frequency_range(bytes,
    obj.frequency_range.rms_velocity,
    obj.frequency_range.peak_acceleration);

  // Events configs
  var idx = 0;
  for (idx = 0; idx < 6; idx++) {                             // Unit: -
    encode_events_mode(bytes, obj.events[idx].mode);

    // mode values
    if (obj.events[idx].mode != "off") {
      encode_int16(bytes, obj.events[idx].mode_value / 0.01);
    } else {
      encode_int16(bytes, 0);
    }
  }

}

function encode_vb_sensor_data_config(bytes, obj) {
  // byte[1]
  encode_device_type(bytes, obj.device_type);

  // byte[2]
  encode_calculation_trigger(bytes, obj.calculation_trigger);

  // byte[3..4]
  encode_uint16(bytes, obj.calculation_interval);

  // byte[5..6]
  encode_uint16(bytes, obj.fragment_message_interval);
  if (obj.threshold_window % 2) throw new Error("threshold_window must be multiple of 2")

  // byte[7]
  encode_uint8(bytes, obj.threshold_window / 2);

  // byte[8..27]
  for (idx = 0; idx < 5; idx++) {
    encode_fft_trigger_threshold(
      bytes,
      obj.trigger_thresholds[idx].unit,
      obj.trigger_thresholds[idx].frequency,
      obj.trigger_thresholds[idx].magnitude);
  }

  // byte[28]
  encode_fft_selection(bytes, obj.selection);

  // byte[29..30]
  encode_uint16(bytes, obj.frequency.span.velocity.start);
  // byte[31..32]
  encode_uint16(bytes, obj.frequency.span.velocity.stop);

  // byte[33..34]
  encode_uint16(bytes, obj.frequency.span.acceleration.start);
  // byte[35..36]
  encode_uint16(bytes, obj.frequency.span.acceleration.stop);

  // byte[37]
  encode_uint8(bytes, obj.frequency.resolution.velocity);
  // byte[38]
  encode_uint8(bytes, obj.frequency.resolution.acceleration);

  // byte[39]
  encode_sci_6(bytes, obj.scale.velocity);

  // byte[40]
  encode_sci_6(bytes, obj.scale.acceleration);
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
    case 'tt':
      encode_uint8(bytes, 4);
      break;
    case 'ld':
      encode_uint8(bytes, 5);
      break;
    case 'vb':
      encode_uint8(bytes, 6);
      break;
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode event.mode
function encode_events_mode(bytes, mode) {
  // Check mode
  switch (mode){
    case 'rms_velocity_x':
      encode_uint8(bytes, 1);
      break;
    case 'peak_acceleration_x':
      encode_uint8(bytes, 2);
      break;
    case 'rms_velocity_y':
      encode_uint8(bytes, 3);
      break;
    case 'peak_acceleration_y':
      encode_uint8(bytes, 4);
      break;
    case 'rms_velocity_z':
      encode_uint8(bytes, 5);
      break;
    case 'peak_acceleration_z':
      encode_uint8(bytes, 6);
      break;
    case 'off':
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode fft measurement mode
function encode_calculation_trigger(bytes, calculation_trigger) {
  var calculation_trigger_bitmask = 0;

  if (!(
    typeof calculation_trigger.on_event == "boolean"
    && typeof calculation_trigger.on_threshold == "boolean"
    && typeof calculation_trigger.on_button_press == "boolean"
  ))
  {
    throw new Error('calculation_trigger must contain: on_event, on_threshold and on_button_press boolean fields');
  }
  
  calculation_trigger_bitmask |= calculation_trigger.on_event ? 0x01 : 0x00;
  calculation_trigger_bitmask |= calculation_trigger.on_threshold ? 0x02 : 0x00;
  calculation_trigger_bitmask |= calculation_trigger.on_button_press ? 0x04 : 0x00;

  encode_uint8(bytes, calculation_trigger_bitmask);
}

// helper function to encode fft trigger threshold
function encode_fft_trigger_threshold(bytes, unit, frequency, magnitude) {
  var trigger;
  switch (unit)
  {
    case "velocity":
      trigger = 0;
      break;

    case "acceleration":
      trigger = 1;
      break;

    default:
      throw new Error("Invalid unit");
  }
  trigger |= ((frequency & 0x7FFF) << 1);
  trigger |= (((magnitude * 100) & 0xFFFF) << 16);

  encode_uint32(bytes, trigger);
}


// helper function to encode fft trigger threshold
function encode_fft_selection(bytes, obj) {
  var selection = 0;
  var axis;
  switch (obj.axis) {
    case "x":
      axis = 0;
      break;
    case "y":
      axis = 1;
      break;
    case "z":
      axis = 2;
      break;
    default:
      throw new Error("selection.axis must one of 'x', 'y' or 'z'")
  }

  var resolution;
  switch (obj.resolution) {
    case "low_res":
      resolution = 0;
      break;
    case "high_res":
      resolution = 1;
      break;
    default:
      throw new Error("selection.resolution must one of 'low_res' or 'high_res'")
  }

  if (typeof obj.enable_hanning_window != "boolean")
  {
    throw new Error('selection.enable_hanning_window must be a boolean');
  }
  var enable_hanning_window = obj.enable_hanning_window ? 1 : 0;

  var selection = axis;
  selection |= (resolution << 2);
  selection |= (enable_hanning_window << 3);
  encode_uint8(bytes, selection);
}

// helper function to encode frequency range
function encode_frequency_range(bytes, velocity, acceleration) {
  var range = 0;

  switch (velocity) {
    case "range_1":
      range += 0;
      break;
    case "range_2":
      range += 1;
      break;
    default:
      throw new Error("Invalid velocity range!" + velocity)
  }

  switch (acceleration) {
    case "range_1":
      range += 0;
      break;
    case "range_2":
      range += 2;
      break;
    default:
      throw new Error("Invalid acceleration range!" + acceleration)
  }

  encode_uint8(bytes, range);
}

// helper function to encode the base configuration switch_mask
function encode_base_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_confirmed_data_message) {
    config_switch_mask |= 1 << 2;
  }
  if (bitmask.allow_deactivation) {
    config_switch_mask |= 1 << 3;
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

// helper function to encode 6 bit scientific notation
function encode_sci_6(bytes, scale) {
    scale_power = Math.floor(Math.log10(scale));
    scale_coefficient = scale / Math.pow(10, scale_power);
    if (scale_coefficient != Math.floor(scale_coefficient) || scale_coefficient < 1 || scale_coefficient > 15)
    {
      // try one power less
      scale_power = scale_power - 1
      scale_coefficient = scale / Math.pow(10, scale_power);
      if (scale_coefficient != Math.floor(scale_coefficient) || scale_coefficient < 1 || scale_coefficient > 15)
      {
        throw new Error("Coeffiecient must be between 1 .. 15")
      }
    }

    if (scale_power < -2 || scale_power > 1) throw new Error("Power must be between -2 .. 1")

    power = ((scale_power + 2) & 0x03) << 4;
    coefficient = scale_coefficient & 0x0F;
    bytes.push(coefficient | power);
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
