if (typeof module !== 'undefined') {
    // Only needed for nodejs
    module.exports = {
        Encode: Encode,
        EncodeConfig: EncodeConfig, // used by generate_config_bin.py
        encode_header: encode_header,
        encode_config: encode_config,
        encode_config_switch_bitmask: encode_config_switch_bitmask,
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

// Encoder supports protocol version 1 only.
function Encode(fPort, obj) { // Used for ChirpStack (aka LoRa Network Server)
    // Encode downlink messages sent as
    // object to an array or buffer of bytes.
    var bytes = [];

    switch (obj.header.protocol_version) {
        case 1: {

            switch (obj.header.message_type) {

                case 5: { // Configuration message
                    encode_header(bytes, obj.header);
                    encode_config(bytes, obj)
                    encode_uint16(bytes, calc_crc(bytes.slice(1)));

                    break;
                }
            }
            break;
        }
    }

    return bytes;
}

function Encoder(obj, fPort) { // Used for The Things Network server
    return Encode(fPort, obj);
}

function EncodeConfig(obj) {
    var bytes = [];
    encode_config(bytes, obj);

    return bytes;
}

// helper function to encode the config data
function encode_config(bytes, obj) {
    encode_config_switch_bitmask(bytes, obj.config_switch_bitmask);
    encode_uint16(bytes, obj.threshold * 10.0);
    encode_uint16(bytes, obj.hysteresis * 10.0);
    encode_int16(bytes, obj.calibration_offset.x);
    encode_int16(bytes, obj.calibration_offset.y);
    encode_int16(bytes, obj.calibration_offset.z);
    encode_uint16(bytes, obj.periodic_message_interval_minutes);
    encode_int8(bytes, obj.periodic_message_interval_random_window_seconds);
    encode_uint16(bytes, obj.magnet_measurement_interval_seconds);
    encode_uint16(bytes, obj.temperature_measurement_interval_seconds);
    encode_uint8(bytes, obj.communication_max_retries);
    encode_uint8(bytes, obj.unconfirmed_repeat);
    encode_int8(bytes, obj.periodic_confirmed_interval);  // TBC not uint8?
    encode_uint8(bytes, obj.lora_failure_holdoff_count);
    encode_uint8(bytes, obj.lora_system_recover_count);
    encode_uint8(bytes, obj.stability_threshold * 10.0);
    encode_uint8(bytes, obj.stability_window);
}

// helper function to encode the header
function encode_header(bytes, header) {
    var b = 0;
    b += (header.message_type & 0x0F);
    b += (header.protocol_version & 0x0F) << 4;

    bytes.push(b);
}

// helper function to encode the config_switch_bitmask
function encode_config_switch_bitmask(bytes, bitmask){
    var config_switch_bitmask = 0;
    if (bitmask.use_confirmed_changed_message) {
        config_switch_bitmask |= 1<<0;
    }
    if (bitmask.turn_on_debug_data) {
        config_switch_bitmask |= 1<<1;
    }
    if (bitmask.activate_magnetometer_stability_test_on_X_axis) {
        config_switch_bitmask |= 1<<2;
    }
    if (bitmask.activate_magnetometer_stability_test_on_Y_axis) {
        config_switch_bitmask |= 1<<3;
    }
    if (bitmask.activate_magnetometer_stability_test_on_Z_axis) {
        config_switch_bitmask |= 1<<4;
    }
    bytes.push(config_switch_bitmask & mask_byte);
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
    
        for(var n =0; n != 256; ++n){
            c = n;
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            table[n] = c;
        }
    
        return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
    }
    var T = signed_crc_table();

	var C = -1, L = buf.length - 3;
    var i = 0;
	while(i < buf.length) C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
	return C & 0xFFFF;
}
