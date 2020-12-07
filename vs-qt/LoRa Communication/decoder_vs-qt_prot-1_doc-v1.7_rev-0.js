// Decoder supports protocol version 1 only.

if (typeof module !== 'undefined') {
    // Only needed for nodejs
    module.exports = {
        Decode: Decode,
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
    decoded.header.message_type = bytes[0] & 0x0F;
    decoded.header.protocol_version = bytes[0] >> 4;

    switch (decoded.header.protocol_version) {
        case 1: {

            var cursor = {}; // keeping track of which byte to process.
            cursor.value = 1;// skip header that is already done

            switch (decoded.header.message_type) {

                case 0: { // Boot message
                    decoded.configuration_crc = decode_uint16(bytes, cursor);
                    decoded.calibration_crc = decode_uint16(bytes, cursor);
                    decoded.version_hash = decode_uint32(bytes, cursor);
                    decoded.reset_reason = decode_uint8(bytes, cursor);
                    decoded.reboot_counter = decode_uint8(bytes, cursor);
                    decoded.reboot_type = decode_uint8(bytes, cursor);
                    decoded.reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
                    decoded.reboot_payload[0] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[1] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[2] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[3] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[4] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[5] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[6] += decode_uint8(bytes, cursor);
                    decoded.reboot_payload[7] += decode_uint8(bytes, cursor);
                    decoded.last_state = decode_uint8(bytes, cursor);
                    var bist = decode_uint8(bytes, cursor);
                    decoded.bist = {
                        initialized: (bist & 0x01) > 0,
                        temp_sensor: (bist & 0x02) > 0,
                        battery_voltage: (bist & 0x04) > 0,
                        magnet_voltage: (bist & 0x08) > 0,
                        magnet_3d_sensor: (bist & 0x10) > 0,
                        lora_module: (bist & 0x20) > 0,
                        provisonned: (bist & 0x40) > 0,
                        calibrated: (bist & 0x80) > 0
                    };
                    decoded.sensor_type = decode_uint8(bytes, cursor);

                    break;
                }

                case 1: { // Calibrated message
                    decoded.calibration_vector = {};
                    decoded.calibration_vector.x = decode_int16(bytes, cursor);
                    decoded.calibration_vector.y = decode_int16(bytes, cursor);
                    decoded.calibration_vector.z = decode_int16(bytes, cursor);

                    decoded.open_verification_vector = {};
                    decoded.open_verification_vector.x = decode_int16(bytes, cursor);
                    decoded.open_verification_vector.y = decode_int16(bytes, cursor);
                    decoded.open_verification_vector.z = decode_int16(bytes, cursor);

                    decoded.closed_verification_vector = {};
                    decoded.closed_verification_vector.x = decode_int16(bytes, cursor);
                    decoded.closed_verification_vector.y = decode_int16(bytes, cursor);
                    decoded.closed_verification_vector.z = decode_int16(bytes, cursor);

                    decoded.temperature = decode_int16(bytes, cursor) / 100.0;

                    break;
                }

                case 2: { // Not calibrated message
                    decoded.error_code = decode_uint8(bytes, cursor);

                    decoded.calibration_vector = {};
                    decoded.calibration_vector.x = decode_int16(bytes, cursor);
                    decoded.calibration_vector.y = decode_int16(bytes, cursor);
                    decoded.calibration_vector.z = decode_int16(bytes, cursor);

                    decoded.open_verification_vector = {};
                    decoded.open_verification_vector.x = decode_int16(bytes, cursor);
                    decoded.open_verification_vector.y = decode_int16(bytes, cursor);
                    decoded.open_verification_vector.z = decode_int16(bytes, cursor);

                    decoded.closed_verification_vector = {};
                    decoded.closed_verification_vector.x = decode_int16(bytes, cursor);
                    decoded.closed_verification_vector.y = decode_int16(bytes, cursor);
                    decoded.closed_verification_vector.z = decode_int16(bytes, cursor);

                    decoded.temperature = decode_int16(bytes, cursor) / 100.0;

                    break;
                }

                case 3: { // State changed message
                    decoded.configuration_crc = decode_uint16(bytes, cursor);
                    decoded.calibration_crc = decode_uint16(bytes, cursor);
                    decoded.state = decode_uint8(bytes, cursor);

                    if (bytes.length > cursor.value) { // any debug values provided?
                        decoded.debug_temperature_reading = decode_int16(bytes, cursor) / 100.0;
                        decoded.debug_magnet_reading = {};
                        decoded.debug_magnet_reading.x = decode_int16(bytes, cursor);
                        decoded.debug_magnet_reading.y = decode_int16(bytes, cursor);
                        decoded.debug_magnet_reading.z = decode_int16(bytes, cursor);
                    }

                    break;
                }

                case 4: { // Update message
                    decoded.configuration_crc = decode_uint16(bytes, cursor);
                    decoded.calibration_crc = decode_uint16(bytes, cursor);
                    decoded.number_of_state_changes = decode_uint8(bytes, cursor);
                    decoded.battery_voltage_low_consumption = decode_uint16(bytes, cursor) / 1000.0;
                    decoded.battery_voltage_high_consumption = decode_uint16(bytes, cursor) / 1000.0;
                    decoded.battery_voltage_settle_after_high_consumption = decode_uint16(bytes, cursor) / 1000.0;
                    decoded.minimum_temperature = decode_int16(bytes, cursor) / 100.0;
                    decoded.maximum_temperature = decode_int16(bytes, cursor) / 100.0;
                    decoded.average_temperature = decode_int16(bytes, cursor) / 100.0;
                    decoded.unstable_counter = decode_uint8(bytes, cursor);
                    decoded.tx_counter = decode_uint8(bytes, cursor);
                    decoded.average_RSSI = -decode_uint8(bytes, cursor);
                    decoded.average_SNR = decode_uint8(bytes, cursor);
                    if (bytes.length > cursor.value) { // any debug values provided?
                        decoded.debug_min_magnet_feature_reading_closed_state = decode_int16(bytes, cursor) / 10.0;
                        decoded.debug_max_magnet_feature_reading_closed_state = decode_int16(bytes, cursor) / 10.0;
                        decoded.debug_avg_magnet_feature_reading_closed_state = decode_int16(bytes, cursor) / 10.0;
                        decoded.debug_min_magnet_feature_reading_open_state = decode_int16(bytes, cursor) / 10.0;
                        decoded.debug_max_magnet_feature_reading_open_state = decode_int16(bytes, cursor) / 10.0;
                        decoded.debug_avg_magnet_feature_reading_open_state = decode_int16(bytes, cursor) / 10.0;
                    }

                    break;
                }

            }

            break; // break case protocol_version = 1
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
    var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
    var e = bits>>>23 & 0xff;
    if (e == 0xFF) {
        if (bits & 0x7fffff) {
            return NaN;
        } else {
            return sign * Infinity;
        }
    }
    var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
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
