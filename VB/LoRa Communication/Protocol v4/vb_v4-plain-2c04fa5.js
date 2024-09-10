var driver;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var genericDecoder_1 = __webpack_require__(1);
var genericEncoder_1 = __webpack_require__(4);
var common_1 = __webpack_require__(5);
var codec = __importStar(__webpack_require__(6));
var decodeUplink = function (input) {
    return (0, genericDecoder_1.genericDecodeUplink)(input, codec.decodeUplink);
};
var encodeDownlink = function (input) {
    return (0, genericEncoder_1.genericEncodeDownlink)(input, codec.encodeDownlink);
};
var decodeDownlink = function (
// eslint-disable-next-line @typescript-eslint/no-unused-vars
input) {
    var result = {};
    return result;
};
// ChirpStack v3 interface
function Decode(fPort, bytes) {
    var input = {
        bytes: bytes,
        fPort: fPort,
        recvTime: new Date()
    };
    var result = decodeUplink(input);
    if (result.errors !== undefined && result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
    }
    return result.data;
}
// The Things Network v2 interface
var Decoder = function (bytes, fPort) {
    return Decode(fPort, bytes);
};
/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
    return Decode(fPort, (0, common_1.byteArrayFromHexString)(hex_string));
}
/**
 * Entry point for ChirpStack v3 interface
 */
function Encode(fPort, obj) {
    var input = {
        data: obj
    };
    var result = encodeDownlink(input);
    if (result.errors !== undefined && result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
    }
    if (result.fPort !== fPort) {
        throw new Error('Input fPort does not match the encoded message');
    }
    return result.bytes;
}
exports["default"] = {
    decodeUplink: decodeUplink,
    encodeDownlink: encodeDownlink,
    decodeDownlink: decodeDownlink,
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    Encode: Encode
};


/***/ }),
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.genericDecodeUplink = exports.decodeFwManagement = void 0;
var ReadCursor_1 = __webpack_require__(2);
var TypeCodec_1 = __webpack_require__(3);
function unflattenObject(flatObject) {
    var result = {};
    // NOTE: don't use `Object.entries()` as it is not supported by `js2py`
    for (var key in flatObject) {
        var value = flatObject[key];
        var keys = key.split('.');
        var currentLevel = result;
        for (var i = 0; i < keys.length; i++) {
            var currentKey = keys[i];
            if (i === keys.length - 1) {
                currentLevel[currentKey] = value;
            }
            else {
                currentLevel[currentKey] = currentLevel[currentKey] || {};
                currentLevel = currentLevel[currentKey];
            }
        }
    }
    return result;
}
function decodeFwManagement(input, result) {
    var cursor = new ReadCursor_1.ReadCursor(input.bytes);
    var cid = cursor.readBits(8);
    switch (cid) {
        case 1: {
            var fwVersion = cursor.readBytesLittleEndian(4);
            var hwVersion = cursor.readBytesLittleEndian(4);
            result.data = {
                DevVersionAns: {
                    FW_version: (0, TypeCodec_1.numberToHex)(fwVersion, 4),
                    HW_version: (0, TypeCodec_1.numberToHex)(hwVersion, 4)
                }
            };
            break;
        }
        default:
            throw new Error("Cannot decode FW Management CID: ".concat(cid));
    }
}
exports.decodeFwManagement = decodeFwManagement;
function genericDecodeUplink(input, decodeApplicationUplink) {
    var result = {};
    try {
        if (input.fPort == 203) {
            decodeFwManagement(input, result);
        }
        else {
            result.data = unflattenObject(decodeApplicationUplink(input));
        }
    }
    catch (e) {
        if (e instanceof Error) {
            result.errors = [e.message];
        }
        else {
            throw e;
        }
    }
    return result;
}
exports.genericDecodeUplink = genericDecodeUplink;


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReadCursor = void 0;
var ReadCursor = /** @class */ (function () {
    /**
     * ReadCursor class constructor
     *
     * @param bytes The byte array to read from.
     */
    function ReadCursor(bytes) {
        this.bytes = bytes;
        // Initial conditions which ensure that a read from an empty bytes array
        // results in an error
        this.byteIndex = -1;
        this.unreadBitsInByte = 0;
    }
    /**
     * Extracts a specified number of bits
     *
     * @param count - The number of bits to extract.
     * @returns The extracted bits as an integer.
     */
    ReadCursor.prototype.readBits = function (count) {
        var result = 0;
        if (this.remainingBits() < count) {
            throw new Error("Payload is too short");
        }
        while (count > 0) {
            if (this.unreadBitsInByte <= 0) {
                this.byteIndex += 1;
                this.unreadBitsInByte = 8;
            }
            var bitsToRead = Math.min(this.unreadBitsInByte, count);
            var bitShift = this.unreadBitsInByte - bitsToRead;
            var bitMask = ((1 << bitsToRead) - 1) << bitShift;
            var bits = (this.bytes[this.byteIndex] & bitMask) >> bitShift;
            // NOTE: Math.pow is used because JS shift operations work only on 32bit integers
            result = result * Math.pow(2, bitsToRead) + bits;
            this.unreadBitsInByte -= bitsToRead;
            count -= bitsToRead;
        }
        return result;
    };
    ReadCursor.prototype.readBytesLittleEndian = function (n) {
        var result = 0;
        for (var i = 0; i < n; i++) {
            result += this.readBits(8) * Math.pow(2, i * 8);
        }
        return result;
    };
    /**
     * Returns number of unread bits
     */
    ReadCursor.prototype.remainingBits = function () {
        return (this.bytes.length * 8 - ((this.byteIndex + 1) * 8 - this.unreadBitsInByte));
    };
    /**
     * Returns true if all bits have been retrieved
     */
    ReadCursor.prototype.isFinished = function () {
        return (this.byteIndex === this.bytes.length - 1 && this.unreadBitsInByte === 0);
    };
    return ReadCursor;
}());
exports.ReadCursor = ReadCursor;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports) {


var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeCodec = exports.float16ToNumber = exports.numberToHex = void 0;
function numberToHex(value, minBytes) {
    var targetLength = minBytes * 2;
    var valueHex = value.toString(16);
    if (targetLength > valueHex.length) {
        valueHex =
            new Array(targetLength - valueHex.length + 1).join('0') + valueHex;
    }
    return '0x' + valueHex;
}
exports.numberToHex = numberToHex;
/**
 * Converts an unsigned integer value to its signed representation based on the specified bit size.
 *
 * @param unsignedValue - The unsigned integer value.
 * @param bitSize - The number of bits in the integer representation.
 * @returns The signed integer representation.
 */
function unsignedToSigned(unsignedValue, bitSize) {
    // Check if the most significant bit is set
    var msb = Math.floor(unsignedValue / Math.pow(2, bitSize - 1));
    if (msb === 1) {
        // If it's set, compute the two's complement
        return unsignedValue - Math.pow(2, bitSize);
    }
    else {
        // If it's not set, the number is positive
        return unsignedValue;
    }
}
/**
 * Decodes a boolean value
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeBool(context, cursor, recvTime) {
    return cursor.readBits(1) > 0 ? true : false;
}
/**
 * Encodes a boolean value
 * @param value which can take true or false
 * @returns 0 or 1 corresponding to false and true
 */
function encodeBool(cursor, value) {
    if (typeof value !== 'boolean') {
        throw new Error("Invalid bool value: ".concat(value, ", must be a boolean"));
    }
    cursor.writeBits(value ? 1 : 0, 1);
}
/**
 * Decodes a 16-bit floating point number from number
 *
 * @param {Number} encoded a number with the binary representation of a 16-bit floating point number
 */
function float16ToNumber(encoded) {
    var sign = encoded & 0x8000 ? -1 : 1;
    var exp = (encoded & 0x7c00) >> 10;
    var fraction = encoded & 0x03ff;
    if (exp === 0) {
        return sign * 5.960464477539063e-8 * fraction; // 2^-24
    }
    if (exp === 31) {
        return fraction ? NaN : sign * Infinity;
    }
    return sign * Math.pow(2, exp - 15) * (1 + fraction * 0.0009765625); // 2^-10
}
exports.float16ToNumber = float16ToNumber;
/**
 * Reads a 16-bit floating point number from the message
 *
 * @param {ReadCursor} cursor Instance of ReadCursor containing the received message
 * @returns a Number
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeFloat16(context, cursor, recvTime) {
    var encoded = cursor.readBits(16);
    return float16ToNumber(encoded);
}
/**
 * Reads a 15-bit floating point number (without the sign bit) from the message
 * 15 bit float can only represent positive numbers
 *
 * @param {ReadCursor} cursor Instance of ReadCursor containing the received message
 * @returns a Number
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodePFloat15(context, cursor, recvTime) {
    var encoded = cursor.readBits(15); // the 16th bit is the sign bit, which is kept zero
    return float16ToNumber(encoded);
}
/**
 * Equivalent of Math.log2()
 */
function log2(x) {
    return Math.log(x) / Math.log(2);
}
/**
 * Converts a float value into a IEEE 754 16 bit number
 *
 * @param value the float to encode
 * @returns the 16 bit representing the IEEE 754 float
 */
function numberToFloat16(value) {
    var encoded = 0;
    if (isNaN(value)) {
        encoded = 0x7e00;
    }
    else if (value === Number.POSITIVE_INFINITY) {
        encoded = 0x7c00;
    }
    else if (value === Number.NEGATIVE_INFINITY) {
        encoded = 0xfc00;
    }
    else if (value === 0 && 1 / value === -Infinity) {
        // Above is equivalent of Object.is(value, -0) which is not supported in ES5
        encoded = 0x8000;
    }
    else if (value === 0) {
        encoded = 0x0000;
    }
    else {
        var sign = value < 0 ? 0x8000 : 0x0000;
        value = Math.abs(value);
        if (value > 65504) {
            encoded = sign | 0x7cff; // Overflow
        }
        else if (value < 5.960464477539063e-8) {
            encoded = sign | 0x0001; // Underflow
        }
        else if (value <= 0.00006097555160522461) {
            // subnormal
            var mantissa = Math.round(value * Math.pow(2, 24));
            encoded = sign | (mantissa & 0x3ff);
        }
        else {
            // normal
            var valueLog = log2(value);
            var exponent = Math.min(Math.floor(valueLog), 15);
            var mantissa = Math.min(Math.round((Math.pow(2, valueLog - exponent) - 1) * 0x400), 0x3ff);
            encoded = sign | ((exponent + 15) << 10) | mantissa;
        }
    }
    return encoded;
}
/**
 * Writes a 16 bit floating point number to the message
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {Number} value The float to write
 */
function encodeFloat16(cursor, value) {
    if (typeof value !== 'number') {
        throw new Error("Invalid float16 value: ".concat(value, ", must be a number"));
    }
    var encoded = numberToFloat16(value);
    cursor.writeBits(encoded, 16);
}
/**
 * Writes a 15 bit floating point number to the message
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {Number} value The float to write (positive only)
 */
function encodePFloat15(cursor, value) {
    if (typeof value !== 'number') {
        throw new Error("Invalid pfloat15 value: ".concat(value, ", must be a number"));
    }
    var encoded = numberToFloat16(value);
    cursor.writeBits(encoded, 15);
}
/**
 * Decodes a 32-bit floating point number from number
 *
 * @param {ReadCursor} cursor Instance of ReadCursor containing the received message
 * @returns a Number
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeFloat32(context, cursor, recvTime) {
    var encoded = cursor.readBits(32);
    var sign = encoded & 0x80000000 ? -1 : 1;
    var exp = (encoded & 0x7f800000) >> 23;
    var fraction = encoded & 0x7fffff;
    if (exp === 0) {
        return sign * 1.401298464324817e-45 * fraction; // 2^-149
    }
    if (exp === 255) {
        return fraction ? NaN : sign * Infinity;
    }
    return sign * Math.pow(2, exp - 127) * (1 + fraction * 1.1920928955078125e-7); // 2^-23
}
/**
 * Converts a float value into a IEEE 754 32 bit number
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {Number} value the float to encode
 * @returns the 32 bit representing the IEEE 754 float
 */
function encodeFloat32(cursor, value) {
    if (typeof value !== 'number') {
        throw new Error("Invalid float32 value: ".concat(value, ", must be a number"));
    }
    var encoded = 0;
    if (isNaN(value)) {
        encoded = 0x7fc00000;
    }
    else if (value === Number.POSITIVE_INFINITY) {
        encoded = 0x7f800000;
    }
    else if (value === Number.NEGATIVE_INFINITY) {
        encoded = 0xff800000;
    }
    else if (value === 0 && 1 / value === -Infinity) {
        // Above is equivalent of Object.is(value, -0) which is not supported in ES5
        encoded = 0x80000000;
    }
    else if (value === 0) {
        encoded = 0x00000000;
    }
    else {
        var sign = value < 0 ? 0x80000000 : 0;
        value = Math.abs(value);
        if (value > 3.4028234663852886e38) {
            encoded = sign + 0x7f80000; // Overflow -> Infinity
        }
        else if (value < 1.401298464324817e-45) {
            encoded = sign + 0x00000001; // Underflow -> smallest subnormal
        }
        else if (value <= 1.1754942106924411e-38) {
            // subnormal
            var mantissa = Math.round(value * Math.pow(2, 149));
            encoded = sign + (mantissa & 0x7fffff);
        }
        else {
            // normal
            var valueLog = log2(value);
            var exponent = Math.min(Math.floor(valueLog), 127);
            var mantissa = Math.min(Math.round((Math.pow(2, valueLog - exponent) - 1) * 0x800000), 0x7fffff);
            encoded = sign + ((exponent + 127) << 23) + mantissa;
        }
    }
    cursor.writeBits(encoded, 32);
}
/**
 * Reads a short timestamp from the message and converts it to a full timestamp
 *
 * @param {ReadCursor} readCursor Instance of ReadCursor containing the received message
 * @param {Date} recvTime Date object when the message was received
 * @returns an ISO formatted timestamp
 */
function decodeShortTimestamp(context, cursor, recvTime) {
    var shortTimestamp = cursor.readBits(16);
    var minutesWrap = 0xffff; // 16 bit minus 1, the last value is used to indicate no valid time
    var recvMin = Math.floor(recvTime.getTime() / (1000 * 60));
    if (shortTimestamp === minutesWrap) {
        // no valid time, use the receive time instead
        return recvTime.toISOString();
    }
    var wrapBase = Math.floor(recvMin / minutesWrap) * minutesWrap;
    var wrapOffset = recvMin - wrapBase;
    var gap = wrapOffset - shortTimestamp;
    if (gap < 0) {
        // in the future, go wrap lower
        wrapBase -= minutesWrap;
        gap += minutesWrap;
    }
    if (gap > 30240) {
        // > 21 days in minutes
        throw new Error("Timestamp gap too big: ".concat(gap, " minutes"));
    }
    var msgMinutes = wrapBase + shortTimestamp;
    return new Date(msgMinutes * 60 * 1000).toISOString();
}
function decodeTimestamp(context, cursor, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
recvTime) {
    return new Date(cursor.readBits(32) * 1000).toISOString();
}
function encodeTimestamp(cursor, value) {
    if (typeof value !== 'string') {
        throw new Error("Invalid timestamp value: ".concat(value, ", must be a string"));
    }
    var parsed = Date.parse(value);
    if (isNaN(parsed)) {
        throw new Error("Cannot convert to Date: ".concat(value));
    }
    cursor.writeBits(Math.floor(parsed / 1000), 32);
}
function encodeShortTimestamp(cursor, value) {
    if (typeof value !== 'string') {
        throw new Error("Invalid short_timestamp value: ".concat(value, ", must be a string"));
    }
    var parsed = Date.parse(value);
    if (isNaN(parsed)) {
        throw new Error("Cannot convert to Date: ".concat(value));
    }
    var minutes = parsed / (1000 * 60);
    cursor.writeBits(minutes % 0xffff, 16); // 16 bit minus 1, the last value is used to indicate no valid time
}
function parseCronExpression(cron) {
    var isNumber = /^(\d+)$/;
    var isNumberOrStar = /^(\d+|\*)$/;
    var start = '';
    var end = '';
    var step = '';
    var rangestr = '';
    var parts = cron.split('/');
    if (parts.length === 1) {
        rangestr = parts[0];
    }
    else if (parts.length === 2 && isNumber.test(parts[1])) {
        rangestr = parts[0];
        step = parts[1];
    }
    var range_parts = rangestr.split('-');
    if (range_parts.length === 1 && isNumberOrStar.test(range_parts[0])) {
        start = range_parts[0];
    }
    else if (range_parts.length === 2 &&
        isNumber.test(range_parts[0]) &&
        isNumber.test(range_parts[1])) {
        start = range_parts[0];
        end = range_parts[1];
    }
    return { start: start, end: end, step: step };
}
function fillArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = value;
    }
}
/**
 * Converts a cron string value for the week days into a number where bit x corresponds to day x of the week
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {string} value cron string eg `3`, `3-5`, `*`, `1-4/2`
 */
function encodeCronWeekDays(cursor, value) {
    var matches = value.split(/,/);
    var encodedValue = Array(7);
    fillArray(encodedValue, 0);
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        var _a = parseCronExpression(match), start = _a.start, end = _a.end, step = _a.step;
        if (!start) {
            throw new Error('Invalid cron week days format: ' + match);
        }
        else if (start === '*') {
            if (step) {
                var stepValue = parseInt(step, 10);
                if (stepValue < 1 || stepValue > 6) {
                    throw new Error('Invalid cron week days format: ' + match);
                }
                for (var i = 0; i < 7; i += stepValue) {
                    encodedValue[i] = 1;
                }
            }
            else {
                fillArray(encodedValue, 1);
            }
        }
        else {
            var startDay = parseInt(start || '0', 10);
            var endDay = end === '*' ? 6 : parseInt(end || start || '0', 10);
            var stepValue = parseInt(step || '1', 10);
            for (var i = startDay; i <= endDay; i += stepValue) {
                if (i >= 0 && i < 7) {
                    encodedValue[i] = 1;
                }
                else {
                    throw new Error('Invalid cron week days format: ' + match);
                }
            }
        }
    }
    // Convert the array of bits to an 7-bit number.
    var encodedNumber = parseInt(encodedValue.reverse().join(''), 2);
    cursor.writeBits(encodedNumber, 7);
}
/**
 * Converts a cron string value for the week days into a number where bit x corresponds to day x of the week
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {string} value cron string eg `3`, `3-5`, `*`, `1-4/2`
 */
function encodeCronHours(cursor, value) {
    var matches = value.split(/,/);
    var encodedValue = Array(24);
    fillArray(encodedValue, 0);
    for (var _i = 0, matches_2 = matches; _i < matches_2.length; _i++) {
        var match = matches_2[_i];
        var _a = parseCronExpression(match), start = _a.start, end = _a.end, step = _a.step;
        if (!start) {
            throw new Error('Invalid cron hours format: ' + match);
        }
        else if (start === '*') {
            if (step) {
                var stepValue = parseInt(step, 10);
                if (stepValue < 1 || stepValue > 23) {
                    throw new Error('Invalid cron hours format: ' + match);
                }
                for (var i = 0; i < 24; i += stepValue) {
                    encodedValue[i] = 1;
                }
            }
            else {
                fillArray(encodedValue, 1);
            }
        }
        else {
            var startHour = parseInt(start || '0', 10);
            var endHour = end === '*' ? 23 : parseInt(end || start || '0', 10);
            var stepValue = parseInt(step || '1', 10);
            for (var i = startHour; i <= endHour; i += stepValue) {
                if (i >= 0 && i < 24) {
                    encodedValue[i] = 1;
                }
                else {
                    throw new Error('Invalid cron hours format: ' + match);
                }
            }
        }
    }
    // Convert the array of bits to a single 24-bit number.
    var encodedNumber = parseInt(encodedValue.reverse().join(''), 2);
    cursor.writeBits(encodedNumber, 24);
}
/**
 * Encodes a cron string representing minutes into an array of numbers where each bit represents one minute
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {string} value cron string such as '3', '4-23', '2-33/3', '*'
 */
function encodeCronMinutes(cursor, value) {
    var matches = value.split(/,/);
    var encodedValue = Array(60);
    for (var _i = 0, matches_3 = matches; _i < matches_3.length; _i++) {
        var match = matches_3[_i];
        var _a = parseCronExpression(match), start = _a.start, end = _a.end, step = _a.step;
        if (!start) {
            throw new Error('Invalid cron minutes format: ' + match);
        }
        else if (start === '*') {
            if (step) {
                var stepValue = parseInt(step, 10);
                if (stepValue < 1 || stepValue > 59) {
                    throw new Error('Invalid cron minutes format: ' + match);
                }
                for (var i = 0; i < 60; i += stepValue) {
                    encodedValue[i] = 1;
                }
            }
            else {
                fillArray(encodedValue, 1);
            }
        }
        else {
            var startMinute = parseInt(start || '0', 10);
            var endMinute = end === '*' ? 59 : parseInt(end || start || '0', 10);
            var stepValue = parseInt(step || '1', 10);
            for (var i = startMinute; i <= endMinute; i += stepValue) {
                if (i >= 0 && i < 60) {
                    encodedValue[i] = 1;
                }
                else {
                    throw new Error('Invalid cron minutes format: ' + match);
                }
            }
        }
    }
    for (var i = 59; i >= 0; i--) {
        cursor.writeBits(encodedValue[i], 1);
    }
}
/**
 * Encodes a cron string representing minutes, hours, and week days.
 *
 * @param {string} value a cron string such as: '0 1 * * 2'
 */
function encodeCron(cursor, value) {
    if (typeof value !== 'string') {
        throw new Error("Cron expression must be a string");
    }
    var matches = value.split(/ /);
    if (matches.length !== 5) {
        throw new Error('Cron expression must consist of 5 fields');
    }
    if (matches[2] !== '*') {
        throw new Error('Cron day of the month field must be "*"');
    }
    if (matches[3] !== '*') {
        throw new Error('Cron month field must be "*"');
    }
    encodeCronMinutes(cursor, matches[0]);
    encodeCronHours(cursor, matches[1]);
    encodeCronWeekDays(cursor, matches[4]);
}
/**
 * Writes a 92 bit timing value to the message
 *
 * @param {WriteCursor} cursor Instance of WriteCursor to write the message
 * @param {Number} value The timing to write, either a cron expression or a number
 */
function encodeTiming(cursor, value) {
    if (typeof value === 'number' ||
        (typeof value === 'string' && !isNaN(value))) {
        value = Number(value);
        if (!isFinite(value) || Math.floor(value) !== value) {
            throw new Error("Invalid period value: ".concat(value, ", must be an integer"));
        }
        cursor.writeBits(0, 1);
        cursor.writeBits(value, 15);
        cursor.writeBits(0, 32);
        cursor.writeBits(0, 32);
        cursor.writeBits(0, 12);
    }
    else if (typeof value === 'string') {
        cursor.writeBits(1, 1);
        encodeCron(cursor, value);
    }
    else {
        throw new Error("Invalid timing value: ".concat(value, ", must be a string or number"));
    }
}
function decodeVbSpectrumFrequenciesV0(context, cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
recvTime // eslint-disable-line @typescript-eslint/no-unused-vars
) {
    var frequencies = [];
    for (var i = 0; i < context.magnitude_values.length; i++) {
        frequencies.push(context.f_min + context.df * i);
    }
    return frequencies;
}
function decodeVbSpectrumMagnitudesV0(context, cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
recvTime // eslint-disable-line @typescript-eslint/no-unused-vars
) {
    var scaling = context.magnitudes_scaling;
    return context.magnitude_values.map(function (value) {
        return scaling * value;
    });
}
function decodeVbHarmonicFrequenciesV0(context, cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
recvTime // eslint-disable-line @typescript-eslint/no-unused-vars
) {
    var frequencies = [];
    for (var i = 1; i < context.relative_nth_harmonic_amplitudes.length + 2; i++) {
        frequencies.push(context.frequency_first_harmonic * i);
    }
    return frequencies;
}
function decodeVbHarmonicAmplitudesV0(context, cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
recvTime // eslint-disable-line @typescript-eslint/no-unused-vars
) {
    var amp1 = context.amplitude_first_harmonic;
    var amplitudes = __spreadArray([
        amp1
    ], context.relative_nth_harmonic_amplitudes.map(function (value) { return (2.5 * amp1 * value) / 255; }), true);
    return amplitudes;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
function encodeStub(cursor, value) { }
var TypeCodec = /** @class */ (function () {
    function TypeCodec() {
        this._decoders = {
            bool: decodeBool,
            pfloat15: decodePFloat15,
            float16: decodeFloat16,
            float32: decodeFloat32,
            short_timestamp: decodeShortTimestamp,
            timestamp: decodeTimestamp,
            vb_spectrum_magnitudes_v0: decodeVbSpectrumMagnitudesV0,
            vb_spectrum_frequencies_v0: decodeVbSpectrumFrequenciesV0,
            vb_harmonic_frequencies_v0: decodeVbHarmonicFrequenciesV0,
            vb_harmonic_amplitudes_v0: decodeVbHarmonicAmplitudesV0
        };
        this._encoders = {
            bool: encodeBool,
            pfloat15: encodePFloat15,
            float16: encodeFloat16,
            float32: encodeFloat32,
            timestamp: encodeTimestamp,
            short_timestamp: encodeShortTimestamp,
            cron: encodeCron,
            timing: encodeTiming,
            vb_spectrum_magnitudes_v0: encodeStub,
            vb_spectrum_frequencies_v0: encodeStub,
            vb_harmonic_frequencies_v0: encodeStub,
            vb_harmonic_amplitudes_v0: encodeStub
        };
    }
    TypeCodec.getInstance = function () {
        if (!TypeCodec.instance) {
            TypeCodec.instance = new TypeCodec();
        }
        return TypeCodec.instance;
    };
    TypeCodec.prototype.decodeSingle = function (cursor, recvTime, context, type, decodeAsHex) {
        // Check if it's an integer
        var intPattern = /^(u)?int(\d+)$/;
        var intMatch = type.match(intPattern);
        if (intMatch) {
            var isUnsigned = intMatch[1] === 'u';
            var numberOfBits = parseInt(intMatch[2]);
            var value = cursor.readBits(numberOfBits);
            if (!isUnsigned) {
                value = unsignedToSigned(value, numberOfBits);
            }
            if (decodeAsHex) {
                return numberToHex(value, Math.ceil(numberOfBits / 8));
            }
            else {
                return value;
            }
        }
        else if (this._decoders[type] !== undefined) {
            return this._decoders[type](context, cursor, recvTime);
        }
        else {
            throw new Error("Unknown type: ".concat(type));
        }
    };
    TypeCodec.prototype.decode = function (cursor, recvTime, context, type, decodeAsHex) {
        var arrayPattern = /^(.+)\[(\d+)?\]$/;
        var arrayMatch = type.match(arrayPattern);
        var isArray = !!arrayMatch;
        var value;
        if (isArray) {
            value = [];
            var arrayType = arrayMatch[1];
            var arrayLen = parseInt(arrayMatch[2]);
            if (isNaN(arrayLen)) {
                while (!cursor.isFinished()) {
                    var element = void 0;
                    try {
                        element = this.decodeSingle(cursor, recvTime, context, arrayType, decodeAsHex);
                    }
                    catch (e) {
                        if (e instanceof Error) {
                            break; // Not enough bits to decode more elements
                        }
                        else {
                            throw e;
                        }
                    }
                    value.push(element);
                }
                // Prevent "Payload has not been decoded completely" warning
                cursor.readBits(cursor.remainingBits());
            }
            else {
                for (var i = 0; i < arrayLen; i++) {
                    value.push(this.decodeSingle(cursor, recvTime, context, arrayType, decodeAsHex));
                }
            }
        }
        else {
            value = this.decodeSingle(cursor, recvTime, context, type, decodeAsHex);
        }
        return value;
    };
    TypeCodec.prototype.encode = function (cursor, type, value) {
        // Check if it's an integer
        var intPattern = /^(u)?int(\d+)$/;
        var intMatch = type.match(intPattern);
        if (intMatch) {
            if (typeof value === 'string') {
                value = parseInt(value);
            }
            if (typeof value !== 'number') {
                throw new Error("Integer value must a number");
            }
            var isUnsigned = intMatch[1] === 'u';
            var numberOfBits = parseInt(intMatch[2]);
            // Determine limits
            var valueMin = 0;
            var valueMax = 0;
            if (isUnsigned) {
                valueMin = 0;
                valueMax = Math.pow(2, numberOfBits) - 1;
            }
            else {
                valueMax = Math.pow(2, numberOfBits - 1) - 1;
                valueMin = -Math.pow(2, numberOfBits - 1);
            }
            if (value < valueMin || value > valueMax) {
                throw new Error("".concat(value, " is not within ").concat(valueMin, " and ").concat(valueMax));
            }
            if (!isUnsigned && value < 0) {
                // convert the negative value to its unsiged two's complement representation
                value = Math.pow(2, numberOfBits) - value * -1;
            }
            cursor.writeBits(value, numberOfBits);
        }
        else if (this._encoders[type] !== undefined) {
            this._encoders[type](cursor, value);
        }
        else {
            throw new Error("Unknown type: ".concat(type));
        }
    };
    TypeCodec.instance = null;
    return TypeCodec;
}());
exports.TypeCodec = TypeCodec;


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.genericEncodeDownlink = exports.encodeFields = void 0;
var TypeCodec_1 = __webpack_require__(3);
function getObjectPropertyValue(obj, path) {
    var value = undefined;
    for (var _i = 0, _a = path.split('.'); _i < _a.length; _i++) {
        var key = _a[_i];
        value = obj[key];
        if (value === undefined) {
            break;
        }
        obj = value;
    }
    return value;
}
function encodeFields(cursor, fields, data) {
    var typeCodec = TypeCodec_1.TypeCodec.getInstance();
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var field = fields_1[_i];
        var value = getObjectPropertyValue(data, field.id);
        if (value == undefined && field.context) {
            value = 0;
        }
        if (value === undefined) {
            throw new Error("Cannot encode, field is missing: ".concat(field.id));
        }
        // Check if it's an array
        var arrayPattern = /^(.+)\[(\d+)?\]$/;
        var arrayMatch = field.type.match(arrayPattern);
        var isArray = !!arrayMatch;
        if (isArray) {
            var arrayType = arrayMatch[1];
            var arrayLen = parseInt(arrayMatch[2]);
            if (!Array.isArray(value)) {
                throw new Error("Cannot encode field \"".concat(field.id, "\": needs to be an array"));
            }
            if (!isNaN(arrayLen) && value.length != arrayLen) {
                throw new Error("Cannot encode field \"".concat(field.id, "\": Length is not as expected expected: ").concat(arrayLen, " got: ").concat(value.length));
            }
            try {
                for (var _a = 0, value_1 = value; _a < value_1.length; _a++) {
                    var arrayValue = value_1[_a];
                    typeCodec.encode(cursor, arrayType, arrayValue);
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    throw new Error("Cannot encode field \"".concat(field.id, "\": ").concat(e.message));
                }
                else {
                    throw e;
                }
            }
        }
        else {
            try {
                typeCodec.encode(cursor, field.type, value);
            }
            catch (e) {
                if (e instanceof Error) {
                    throw new Error("Cannot encode field \"".concat(field.id, "\": ").concat(e.message));
                }
                else {
                    throw e;
                }
            }
        }
    }
}
exports.encodeFields = encodeFields;
function genericEncodeDownlink(input, encodeApplicationDownlink) {
    var result = {};
    try {
        result = encodeApplicationDownlink(input);
    }
    catch (e) {
        if (e instanceof Error) {
            result.errors = [e.message];
            return result;
        }
        else {
            throw e;
        }
    }
    return result;
}
exports.genericEncodeDownlink = genericEncodeDownlink;


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lookupMessageInterval = exports.byteArrayFromHexString = exports.hexFromUint32 = exports.hexFromUint16 = exports.hexFromUint8 = exports.decodeSensorValue = exports.decodeSensorSingleValue = exports.convertBatteryVoltage = exports.lookupSensorEventTrigger = exports.lookupSensorEventSelection = exports.lookupMeasurementValueError = exports.lookupRebootReasonMinor = exports.lookupRebootReasonMajor = exports.lookupDeviceType = exports.lookupRssi = exports.peekVersion = void 0;
/**
 * The device types. Note the index corresponds with their numerical counterpart -1
 */
var DEVICE_TYPE_NAMES = [
    'ts',
    'vs-qt',
    'vs-mt',
    'tt',
    'ld',
    'vb',
    'cs',
    'rt'
];
/**
 * The possible error codes for measurements. Note that the index corresponds with their numerical counterpart - 1
 */
var MEASUREMENT_VALUE_ERROR_STRINGS = [
    'Hardware Error',
    'Upper Bound Error',
    'Lower Bound Error',
    'Factory Calibration Error',
    'Conversion Factor Error'
];
var MESSAGE_INTERVAL_LOOKUP = [
    '2 minutes',
    '15 minutes',
    '1 hour',
    '4 hours',
    '12 hours',
    '1 day',
    '2 days',
    '5 days'
];
/**
 * Get protocol version from the first byte
 *
 * Note that Deserializer will be reset afterwards (as the first byte might contain more data)
 *
 * @param des The Deserializer
 * @returns the protocol version
 */
function peekVersion(des) {
    des.reset();
    var data = des.pullUint8();
    des.reset();
    var protocol_version = data >> 4;
    return protocol_version;
}
exports.peekVersion = peekVersion;
/**
 * Converts an RSSI index to the corresponding string
 *
 * TODO: Could this be replace by an enum with lookup?
 *
 * @param rssiEnumID index of the RSSI
 * @returns the string representing the RSSI value range, or 'unknown' if not found
 */
function lookupRssi(rssiEnumID) {
    switch (rssiEnumID) {
        case 0:
            return '0..-79';
        case 1:
            return '-80..-99';
        case 2:
            return '-100..-129';
        case 3:
            return '<-129';
        default:
            return 'unknown';
    }
}
exports.lookupRssi = lookupRssi;
/**
 * Converts a numerical device type to the corresponding string
 *
 * TODO: Could this be replace by an enum with lookup?
 *
 * @param deviceTypeID index of the device type
 * @returns the corresponding string, or 'unknown' if not found
 */
function lookupDeviceType(deviceTypeID) {
    if (deviceTypeID >= 0 && deviceTypeID <= DEVICE_TYPE_NAMES.length) {
        return DEVICE_TYPE_NAMES[deviceTypeID - 1];
    }
    else {
        return 'unknown';
    }
}
exports.lookupDeviceType = lookupDeviceType;
/**
 * Converts a numerical major reboot reason ID to the corresponding string
 *
 * TODO: Could it be replace by an enum with lookup?
 *
 * @param rebootReasonID the numeric value of the reboot reason
 * @returns the corresponding string, or 'unknown' if not found
 */
function lookupRebootReasonMajor(rebootReasonID) {
    var majorRebootReason = rebootReasonID & 0x0f;
    switch (majorRebootReason) {
        case 0:
            return 'none';
        case 1:
            return 'config update';
        case 2:
            return 'firmware update';
        case 3:
            return 'button reset';
        case 4:
            return 'power';
        case 5:
            return 'communication failure';
        case 6:
            return 'system failure';
        default:
            return 'unknown';
    }
}
exports.lookupRebootReasonMajor = lookupRebootReasonMajor;
/**
 * Converts a numerical minor reboot reason ID to the corresponding string
 *
 * TODO: Combine it with {@link lookupRebootReasonMajor}
 * TODO: Could it be replace by an enum with lookup?
 *
 * @param rebootReasonID the numeric value of the reboot reason
 * @returns the corresponding string, or '' if not found
 */
function lookupRebootReasonMinor(rebootReason) {
    var majorRebootReason = rebootReason & 0x0f;
    var minorRebootReason = (rebootReason >> 4) & 0x0f;
    switch (majorRebootReason) {
        case 0:
            return ''; // No minor reboot reason
        case 1:
            return ''; // No minor reboot reason
        case 2:
            switch (minorRebootReason) {
                case 0:
                    return 'success';
                case 1:
                    return 'rejected';
                case 2:
                    return 'error';
                case 3:
                    return 'in progress';
                default:
                    return 'unknown';
            }
        case 3:
            return ''; // No minor reboot reason
        case 4:
            switch (minorRebootReason) {
                case 0:
                    return 'black out';
                case 1:
                    return 'brown out';
                case 2:
                    return 'power safe state';
                default:
                    return 'unknown';
            }
        case 5:
            return ''; // No minor reboot reason
        case 6:
            return ''; // No minor reboot reason
        default:
            return 'unknown';
    }
}
exports.lookupRebootReasonMinor = lookupRebootReasonMinor;
/**
 * Converts the error index to the corresponding string
 * @param errorIndex the binary error
 * @returns the corresponding string
 */
function lookupMeasurementValueError(errorIndex) {
    if (errorIndex > 0 && errorIndex <= MEASUREMENT_VALUE_ERROR_STRINGS.length) {
        return MEASUREMENT_VALUE_ERROR_STRINGS[errorIndex - 1];
    }
    else {
        return 'Unknown';
    }
}
exports.lookupMeasurementValueError = lookupMeasurementValueError;
/**
 * Converts the selection index to the corresponding string
 * @param selection the binary selection
 * @returns the corresponding string
 */
function lookupSensorEventSelection(selection) {
    switch (selection) {
        case 0:
            return 'extended';
        case 1:
            return 'min_only';
        case 2:
            return 'max_only';
        case 3:
            return 'avg_only';
        default:
            return 'unknown';
    }
}
exports.lookupSensorEventSelection = lookupSensorEventSelection;
/**
 * Converts the event trigger index to the corresponding string
 * @param trigger The binary event trigger
 * @returns the corresponding string
 */
function lookupSensorEventTrigger(trigger) {
    switch (trigger) {
        case 0:
            return 'condition change';
        case 1:
            return 'periodic';
        case 2:
            return 'button press';
        case 3:
            return 'frequent';
        default:
            return 'unknown';
    }
}
exports.lookupSensorEventTrigger = lookupSensorEventTrigger;
/**
 * Convert raw voltage level to Volts
 *
 * @param raw Raw value is between 0 - 255. 0 represent 2 V, while 255 represent 4 V
 * @returns The represented voltage level in Volts
 */
function convertBatteryVoltage(raw) {
    var OFFSET = 2; // Lowest voltage is 2 V
    var SCALE = 2 / 255;
    var voltage = raw * SCALE + OFFSET;
    return voltage;
}
exports.convertBatteryVoltage = convertBatteryVoltage;
/**
 * Reads the single measurement value and interprets depending on the selection
 * @param des The Deserializer
 * @param selection The selection, which is one of {@link lookupSensorEventSelection}
 * @returns An object with 'status' and if it is 'ok', one of the 'min', 'max' or 'avg' fields.
 */
function decodeSensorSingleValue(des, selection) {
    // TODO: use an interface for the return
    var status = 'OK';
    var _a = des.pullFloat32(), value = _a[0], error = _a[1];
    if (typeof error == 'number') {
        status = lookupMeasurementValueError(error);
    }
    // For reference this code does not work for `js2py`: TypeError: 'undefined' is not a function (tried calling property 'assign' of 'Function')
    // `Object.assign(measurementValue, { min: value });`
    // It is not clear what is the cause of it, but the workaround is not to use `Object.assign` in this function.
    if (selection == 'min_only') {
        return { status: status, min: value };
    }
    else if (selection == 'max_only') {
        return { status: status, max: value };
    }
    else if (selection == 'avg_only') {
        return { status: status, avg: value };
    }
    else {
        throw new Error('Only min_only, max_only, or, avg_only is accepted!');
    }
}
exports.decodeSensorSingleValue = decodeSensorSingleValue;
/**
 * Reads the triple measurement value (min/max/avg), this is only valid when {@link lookupSensorSelection} is 'extended'
 * @param des The Deserializer
 * @returns An object with 'status' and if it is 'ok', the 'min', 'max' and 'avg' fields.
 */
function decodeSensorValue(des) {
    var _a = des.pullFloat32(), value0 = _a[0], error0 = _a[1];
    var _b = des.pullFloat32(), value1 = _b[0], error1 = _b[1];
    var _c = des.pullFloat32(), value2 = _c[0], error2 = _c[1];
    var status = 'OK';
    if (typeof error0 === 'number') {
        if (error0 != error1 || error0 != error2) {
            throw new Error('Inconsistent error code!');
        }
        status = lookupMeasurementValueError(error0);
    }
    return { status: status, min: value0, max: value1, avg: value2 };
}
exports.decodeSensorValue = decodeSensorValue;
/**
 * Convert number to 2 digit HEX string, prefixed with zeros if needed
 * @param d The 8 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint8(d) {
    return ('0' + Number(d).toString(16).toUpperCase()).slice(-2);
}
exports.hexFromUint8 = hexFromUint8;
/**
 * Convert number to 4 digit HEX string, prefixed with zeros if needed
 * @param d The 16 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint16(d) {
    return ('000' + Number(d).toString(16).toUpperCase()).slice(-4);
}
exports.hexFromUint16 = hexFromUint16;
/**
 * Convert number to 8 digit HEX string, prefixed with zeros if needed
 * @param d The 32 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint32(d) {
    return ('0000000' + Number(d).toString(16).toUpperCase()).slice(-8);
}
exports.hexFromUint32 = hexFromUint32;
/**
 * Decode a hex string into a byte array
 *
 * This is a copy from old code as is. TODO: Use typescript to do the conversion
 * @param hexString The hex string to decode
 * @returns byte array
 */
function byteArrayFromHexString(hexString) {
    if (typeof hexString != 'string')
        throw new Error('hex_string must be a string');
    if (!hexString.match(/^[0-9A-F]*$/gi))
        throw new Error('hex_string contain only 0-9, A-F characters');
    if ((hexString.length & 0x01) > 0)
        throw new Error('hex_string length must be a multiple of two');
    var byteString = [];
    for (var i = 0; i < hexString.length; i += 2) {
        var hex = hexString.slice(i, i + 2);
        byteString.push(parseInt(hex, 16));
    }
    return byteString;
}
exports.byteArrayFromHexString = byteArrayFromHexString;
/**
 * Converts a message interval index to the corresponding string
 * @param intervalIdx message interval index
 * @returns the corresponding string
 */
function lookupMessageInterval(intervalIdx) {
    if (intervalIdx >= 0 && intervalIdx < MESSAGE_INTERVAL_LOOKUP.length) {
        return MESSAGE_INTERVAL_LOOKUP[intervalIdx];
    }
    else {
        return 'Unknown';
    }
}
exports.lookupMessageInterval = lookupMessageInterval;


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeDownlink = exports.decodeDownlink = exports.encodeConfig = exports.decodeConfig = exports.decodeUplink = void 0;
var Decoder_1 = __webpack_require__(7);
var Encoder_1 = __webpack_require__(8);
var TypeCodec_1 = __webpack_require__(3);
var enums = {
    device_configuration_type_v0: {
        id: 'device_configuration_type_v0',
        size: 12,
        default: 'unknown',
        values: {
            '0': 'twtg_region',
            '1': 'transmitter',
            '2': 'schedule',
            '3': 'vb_alert',
            '4': 'vb_spectrum_alert',
            '5': 'vb_asset',
            '6': 'twtg_transmitter'
        }
    },
    configuration_update_status_v0: {
        id: 'configuration_update_status_v0',
        size: 4,
        default: 'unknown',
        values: {
            '0': 'success',
            '1': 'rejected_unsupported_configuration_type',
            '2': 'rejected_unsupported_configuration_version',
            '3': 'rejected_invalid_configuration_values',
            '4': 'rejected_decoding_failed',
            '5': 'rejected_schedule_type_limit',
            '6': 'sensor_communication_failure'
        }
    },
    reboot_reason_v0: {
        id: 'reboot_reason_v0',
        size: 16,
        default: 'unknown',
        values: {
            '0': 'none',
            '1': 'configuration_update',
            '2': 'firmware_update_success',
            '3': 'firmware_update_rejected',
            '4': 'firmware_update_error',
            '5': 'firmware_update_in_progress',
            '6': 'button_reset',
            '7': 'power_black_out',
            '8': 'power_brown_out',
            '9': 'power_safe_state',
            '10': 'system_failure',
            '11': 'factory_reset',
            '12': 'reboot_request'
        }
    },
    deactivation_reason_v0: {
        id: 'deactivation_reason_v0',
        size: 8,
        default: 'unknown',
        values: {
            '0': 'user_triggered',
            '1': 'activation_sensor_comm_fail'
        }
    },
    vb_axis_v0: {
        id: 'vb_axis_v0',
        size: 2,
        default: 'unknown',
        values: {
            '0': 'x',
            '1': 'y',
            '2': 'z'
        }
    },
    vb_fault_type_v0: {
        id: 'vb_fault_type_v0',
        size: 2,
        default: 'unknown',
        values: {
            '0': 'common_fault',
            '1': 'bearing_fault'
        }
    },
    vb_fault_category_v0: {
        id: 'vb_fault_category_v0',
        size: 6,
        default: 'unknown',
        values: {
            '0': 'none',
            '1': 'one_x',
            '2': 'two_x',
            '3': 'n_x',
            '4': 'bearing'
        }
    },
    vb_statistics_selection_v0: {
        id: 'vb_statistics_selection_v0',
        size: 4,
        default: 'unknown',
        values: {
            '0': 'x_rms_velocity',
            '1': 'x_rms_acceleration',
            '2': 'x_peak_acceleration',
            '3': 'y_rms_velocity',
            '4': 'y_rms_acceleration',
            '5': 'y_peak_acceleration',
            '6': 'z_rms_velocity',
            '7': 'z_rms_acceleration',
            '8': 'z_peak_acceleration',
            '9': 'temperature'
        }
    },
    vb_spectrum_type_v0: {
        id: 'vb_spectrum_type_v0',
        size: 2,
        default: 'unknown',
        values: {
            '0': 'acceleration',
            '1': 'velocity',
            '2': 'envelope'
        }
    },
    vb_config_axis_v0: {
        id: 'vb_config_axis_v0',
        size: 2,
        default: 'unknown',
        values: {
            '0': 'x',
            '1': 'y',
            '2': 'z',
            '3': 'all'
        }
    },
    vb_range_v0: {
        id: 'vb_range_v0',
        size: 2,
        default: 'unknown',
        values: {
            '0': 'gscale_2',
            '1': 'gscale_4',
            '2': 'gscale_8',
            '3': 'gscale_16'
        }
    },
    vb_send_condition_v0: {
        id: 'vb_send_condition_v0',
        size: 4,
        default: 'unknown',
        values: {
            '0': 'always',
            '1': 'peak_acceleration_above',
            '2': 'rms_acceleration_above',
            '3': 'rms_velocity_above',
            '4': 'temperature_above',
            '5': 'temperature_below'
        }
    },
    schedule_set_command_v0: {
        id: 'schedule_set_command_v0',
        size: 4,
        default: 'unknown',
        values: {
            '0': 'set',
            '1': 'replace',
            '2': 'execute',
            '3': 'reset',
            '4': 'remove'
        }
    },
    vb_alert_selection_v0: {
        id: 'vb_alert_selection_v0',
        size: 4,
        default: 'unknown',
        values: {
            '0': 'off',
            '1': 'x_rms_velocity_above',
            '2': 'x_rms_acceleration_above',
            '3': 'x_peak_acceleration_above',
            '4': 'y_rms_velocity_above',
            '5': 'y_rms_acceleration_above',
            '6': 'y_peak_acceleration_above',
            '7': 'z_rms_velocity_above',
            '8': 'z_rms_acceleration_above',
            '9': 'z_peak_acceleration_above',
            '10': 'temperature_above',
            '11': 'temperature_below'
        }
    },
    vb_spectrum_alert_selection_v0: {
        id: 'vb_spectrum_alert_selection_v0',
        size: 5,
        default: 'unknown',
        values: {
            '0': 'off',
            '1': 'peak_velocity_x',
            '2': 'peak_velocity_y',
            '3': 'peak_velocity_z',
            '4': 'peak_acceleration_x',
            '5': 'peak_acceleration_y',
            '6': 'peak_acceleration_z',
            '7': 'peak_envelope_x',
            '8': 'peak_envelope_y',
            '9': 'peak_envelope_z',
            '10': 'rms_velocity_x',
            '11': 'rms_velocity_y',
            '12': 'rms_velocity_z',
            '13': 'rms_acceleration_x',
            '14': 'rms_acceleration_y',
            '15': 'rms_acceleration_z',
            '16': 'rms_envelope_x',
            '17': 'rms_envelope_y',
            '18': 'rms_envelope_z',
            '19': 'machine_fault_1x',
            '20': 'machine_fault_2x',
            '21': 'machine_fault_nx',
            '22': 'machine_fault_bearing',
            '23': 'machine_fault_any'
        }
    },
    schedule_type_v0: {
        id: 'schedule_type_v0',
        size: 12,
        default: 'unknown',
        values: {
            '0': 'transmitter_status',
            '1': 'vb_measurement',
            '2': 'vb_machine_fault_indicator',
            '3': 'vb_spectrum',
            '4': 'twtg_vb_raw',
            '5': 'vb_statistics_x_rms_velocity',
            '6': 'vb_statistics_x_rms_acceleration',
            '7': 'vb_statistics_x_peak_acceleration',
            '8': 'vb_statistics_y_rms_velocity',
            '9': 'vb_statistics_y_rms_acceleration',
            '10': 'vb_statistics_y_peak_acceleration',
            '11': 'vb_statistics_z_rms_velocity',
            '12': 'vb_statistics_z_rms_acceleration',
            '13': 'vb_statistics_z_peak_acceleration',
            '14': 'vb_statistics_temperature',
            '15': 'transmitter_battery'
        }
    }
};
function decodeUplink(input) {
    var decoder = new Decoder_1.Decoder(TypeCodec_1.TypeCodec.getInstance(), input);
    var message_id = decoder.readBits(4);
    var message_version = decoder.readBits(4);
    switch ((input.fPort << 8) | (message_id << 4) | message_version) {
        case 0xe10: // transmitter_battery
            decoder.setNameAndVersion('transmitter_battery', 0);
            decoder.pull('transmitter_charge_used', 'pfloat15');
            decoder.pull('sensor_charge_used', 'pfloat15');
            decoder.pull('average_temperature', 'float16');
            decoder.pull('battery_level', 'uint8');
            decoder.pullContext('rfu', 'uint2');
            break;
        case 0xe30: // transmitter_battery_reset_answer
            decoder.setNameAndVersion('transmitter_battery_reset_answer', 0);
            break;
        case 0xb00: // configuration_update_answer
            decoder.setNameAndVersion('configuration_update_answer', 0);
            decoder.pullHex('tag', 'uint32');
            decoder.pullEnum('type', enums.device_configuration_type_v0);
            decoder.pullEnum('status', enums.configuration_update_status_v0);
            break;
        case 0xc00: // fragmented_uplink_start
            decoder.setNameAndVersion('fragmented_uplink_start', 0);
            decoder.pull('fport', 'uint8');
            decoder.pull('uplink_size', 'uint16');
            decoder.pull('fragment_size', 'uint8');
            decoder.pull('crc', 'uint32');
            break;
        case 0xc10: // fragmented_uplink_data
            decoder.setNameAndVersion('fragmented_uplink_data', 0);
            decoder.pull('index', 'uint16');
            decoder.pull('data', 'uint8[]');
            break;
        case 0xe20: // factory_reset_answer
            decoder.setNameAndVersion('factory_reset_answer', 0);
            break;
        case 0x1000: // transmitter_boot
            decoder.setNameAndVersion('transmitter_boot', 0);
            decoder.pullEnum('reboot_reason', enums.reboot_reason_v0);
            break;
        case 0x1010: // transmitter_status
            decoder.setNameAndVersion('transmitter_status', 0);
            decoder.pull('temperature', 'int8');
            decoder.pull('rssi', 'int8');
            decoder.pull('lora_tx_counter', 'uint16');
            decoder.pull('bist.power_supply', 'bool');
            decoder.pull('bist.configuration', 'bool');
            decoder.pull('bist.sensor_connection', 'bool');
            decoder.pull('bist.sensor_paired', 'bool');
            decoder.pull('bist.flash_memory', 'bool');
            decoder.pull('bist.internal_temperature_sensor', 'bool');
            decoder.pull('bist.time_synchronized', 'bool');
            decoder.pullContext('rfu', 'uint1');
            break;
        case 0x1030: // transmitter_deactivated
            decoder.setNameAndVersion('transmitter_deactivated', 0);
            decoder.pullEnum('reason', enums.deactivation_reason_v0);
            break;
        case 0x1100: // sensor_boot
            decoder.setNameAndVersion('sensor_boot', 0);
            decoder.pullEnum('reboot_reason', enums.reboot_reason_v0);
            break;
        case 0x1110: // measurement
            decoder.setNameAndVersion('measurement', 0);
            decoder.pull('timestamp', 'short_timestamp');
            decoder.pullEnum('axis', enums.vb_axis_v0);
            decoder.pull('temperature', 'int8');
            decoder.pull('peak_acceleration', 'float16');
            decoder.pull('rms_acceleration', 'float16');
            decoder.pull('rms_velocity', 'float16');
            decoder.pullContext('rfu', 'uint6');
            break;
        case 0x1120: // alert
            decoder.setNameAndVersion('alert', 0);
            decoder.pull('timestamp', 'short_timestamp');
            decoder.pull('sensor_alert_0', 'bool');
            decoder.pull('sensor_alert_1', 'bool');
            decoder.pull('sensor_alert_2', 'bool');
            decoder.pull('sensor_alert_3', 'bool');
            decoder.pull('sensor_alert_4', 'bool');
            decoder.pull('sensor_alert_5', 'bool');
            decoder.pull('sensor_alert_6', 'bool');
            decoder.pull('sensor_alert_7', 'bool');
            decoder.pull('spectrum_alert_0', 'bool');
            decoder.pull('spectrum_alert_1', 'bool');
            decoder.pull('spectrum_alert_2', 'bool');
            decoder.pull('spectrum_alert_3', 'bool');
            decoder.pull('spectrum_alert_4', 'bool');
            decoder.pullContext('rfu', 'uint3');
            break;
        case 0x1130: // machine_fault_indicator
            decoder.setNameAndVersion('machine_fault_indicator', 0);
            decoder.pull('timestamp', 'short_timestamp');
            decoder.pullEnum('axis', enums.vb_axis_v0);
            decoder.pullEnum('fault_type', enums.vb_fault_type_v0);
            decoder.pullEnum('fault_category', enums.vb_fault_category_v0);
            decoder.pullContext('frequency_first_harmonic', 'pfloat15');
            decoder.pullContext('amplitude_first_harmonic', 'pfloat15');
            decoder.pullContext('relative_nth_harmonic_amplitudes', 'uint8[]');
            decoder.pull('harmonic_frequencies', 'vb_harmonic_frequencies_v0');
            decoder.pull('harmonic_amplitudes', 'vb_harmonic_amplitudes_v0');
            break;
        case 0x1140: // statistics
            decoder.setNameAndVersion('statistics', 0);
            decoder.pullEnum('selection', enums.vb_statistics_selection_v0);
            decoder.pull('min', 'float16');
            decoder.pull('max', 'float16');
            decoder.pull('avg', 'float16');
            decoder.pull('max_timestamp', 'short_timestamp');
            decoder.pullContext('rfu', 'uint4');
            break;
        case 0x1150: // spectrum
            decoder.setNameAndVersion('spectrum', 0);
            decoder.pull('timestamp', 'timestamp');
            decoder.pullEnum('axis', enums.vb_axis_v0);
            decoder.pullEnum('spectrum_type', enums.vb_spectrum_type_v0);
            decoder.pull('temperature', 'int8');
            decoder.pullContext('df', 'float16');
            decoder.pullContext('f_min', 'float16');
            decoder.pull('peak_acceleration', 'float16');
            decoder.pull('rms_acceleration', 'float16');
            decoder.pull('rms_velocity', 'float16');
            decoder.pull('rpm', 'float32');
            decoder.pullContext('magnitudes_scaling', 'pfloat15');
            decoder.pullContext('rfu', 'uint5');
            decoder.pullContext('magnitude_values', 'uint10[]');
            decoder.pull('frequencies', 'vb_spectrum_frequencies_v0');
            decoder.pull('magnitudes', 'vb_spectrum_magnitudes_v0');
            break;
        default:
            throw new Error("Unknown message fPort: ".concat(input.fPort, ", id: ").concat(message_id, ", version: ").concat(message_version));
    }
    if (!decoder.isFinished()) {
        throw new Error('Payload has not been decoded completely');
    }
    return decoder.getResult();
}
exports.decodeUplink = decodeUplink;
function decodeConfig(fieldId, groupName, decoder) {
    switch (groupName) {
        case 'schedule_settings': {
            var configType = decoder.pullEnum(fieldId + '.type', enums.schedule_type_v0);
            var configVersion = decoder.pull(fieldId + '.version', 'uint4');
            switch (configType) {
                case 'transmitter_status':
                    break;
                case 'vb_measurement':
                    decoder.pullEnum(fieldId + '.axis', enums.vb_config_axis_v0);
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    decoder.pull(fieldId + '.enable_confirmed_message', 'bool');
                    decoder.pullEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
                    decoder.pull(fieldId + '.send_condition.threshold', 'float16');
                    decoder.pullContext(fieldId + '.rfu', 'uint1');
                    break;
                case 'vb_machine_fault_indicator':
                    decoder.pullEnum(fieldId + '.axis', enums.vb_config_axis_v0);
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.fault_type', enums.vb_fault_type_v0);
                    decoder.pullEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
                    decoder.pull(fieldId + '.send_condition.threshold', 'float16');
                    break;
                case 'vb_spectrum':
                    decoder.pullEnum(fieldId + '.axis', enums.vb_axis_v0);
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.spectrum_type', enums.vb_spectrum_type_v0);
                    decoder.pull(fieldId + '.averaging', 'uint3');
                    decoder.pull(fieldId + '.time_to_transmit_min', 'pfloat15');
                    decoder.pullEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
                    decoder.pull(fieldId + '.send_condition.threshold', 'float16');
                    decoder.pullContext(fieldId + '.rfu', 'uint4');
                    break;
                case 'twtg_vb_raw':
                case 'vb_statistics_x_rms_velocity':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_x_rms_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_x_peak_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_y_rms_velocity':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_y_rms_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_y_peak_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_z_rms_velocity':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_z_rms_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_z_peak_acceleration':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'vb_statistics_temperature':
                    decoder.pullEnum(fieldId + '.range', enums.vb_range_v0);
                    decoder.pull(fieldId + '.sample_speed_divider', 'uint8');
                    decoder.pull(fieldId + '.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.f_max', 'pfloat15');
                    break;
                case 'transmitter_battery':
                    break;
            }
            break;
        }
        case 'device_configuration': {
            var configType = decoder.pullEnum(fieldId + '.type', enums.device_configuration_type_v0);
            var configVersion = decoder.pull(fieldId + '.version', 'uint4');
            switch (configType) {
                case 'twtg_region':
                case 'transmitter':
                    decoder.pull(fieldId + '.allow_deactivation', 'bool');
                    decoder.pull(fieldId + '.require_sensor_pairing', 'bool');
                    decoder.pull(fieldId + '.enable_class_b', 'bool');
                    decoder.pull(fieldId + '.time_synchronization_interval_days', 'uint3');
                    decoder.pull(fieldId + '.fragmented_uplink_redundancy_percent', 'uint8');
                    decoder.pullContext(fieldId + '.rfu', 'uint2');
                    break;
                case 'schedule':
                    decoder.pullEnum(fieldId + '.command', enums.schedule_set_command_v0);
                    decoder.pull(fieldId + '.timing', 'timing');
                    decoder.pull(fieldId + '.triggered_on_button_press', 'bool');
                    decoder.pull(fieldId + '.send', 'bool');
                    decoder.pullContext(fieldId + '.rfu', 'uint6');
                    decoder.pull(fieldId + '.settings', 'schedule_settings');
                    break;
                case 'vb_alert':
                    decoder.pull(fieldId + '.enable_confirmed_alert', 'bool');
                    decoder.pull(fieldId + '.enable_spectrum_on_alert', 'bool');
                    decoder.pullEnum(fieldId + '.spectrum_type', enums.vb_spectrum_type_v0);
                    decoder.pull(fieldId + '.time_to_transmit_min', 'pfloat15');
                    decoder.pull(fieldId + '.hold_off_hours', 'uint10');
                    decoder.pullEnum(fieldId + '.alert_0.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_0.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_0.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_1.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_1.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_1.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_2.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_2.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_2.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_3.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_3.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_3.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_4.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_4.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_4.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_5.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_5.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_5.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_6.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_6.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_6.hysteresis', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_7.selection', enums.vb_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_7.threshold', 'float16');
                    decoder.pull(fieldId + '.alert_7.hysteresis', 'pfloat15');
                    decoder.pullContext(fieldId + '.rfu', 'uint6');
                    break;
                case 'vb_spectrum_alert':
                    decoder.pull(fieldId + '.enable_confirmed_alert', 'bool');
                    decoder.pull(fieldId + '.enable_spectrum_on_alert', 'bool');
                    decoder.pull(fieldId + '.time_to_transmit_min', 'pfloat15');
                    decoder.pull(fieldId + '.hold_off_hours', 'uint10');
                    decoder.pullEnum(fieldId + '.alert_0.selection', enums.vb_spectrum_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_0.threshold', 'pfloat15');
                    decoder.pull(fieldId + '.alert_0.hysteresis', 'pfloat15');
                    decoder.pull(fieldId + '.alert_0.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.alert_0.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_1.selection', enums.vb_spectrum_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_1.threshold', 'pfloat15');
                    decoder.pull(fieldId + '.alert_1.hysteresis', 'pfloat15');
                    decoder.pull(fieldId + '.alert_1.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.alert_1.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_2.selection', enums.vb_spectrum_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_2.threshold', 'pfloat15');
                    decoder.pull(fieldId + '.alert_2.hysteresis', 'pfloat15');
                    decoder.pull(fieldId + '.alert_2.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.alert_2.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_3.selection', enums.vb_spectrum_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_3.threshold', 'pfloat15');
                    decoder.pull(fieldId + '.alert_3.hysteresis', 'pfloat15');
                    decoder.pull(fieldId + '.alert_3.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.alert_3.f_max', 'pfloat15');
                    decoder.pullEnum(fieldId + '.alert_4.selection', enums.vb_spectrum_alert_selection_v0);
                    decoder.pull(fieldId + '.alert_4.threshold', 'pfloat15');
                    decoder.pull(fieldId + '.alert_4.hysteresis', 'pfloat15');
                    decoder.pull(fieldId + '.alert_4.f_min', 'pfloat15');
                    decoder.pull(fieldId + '.alert_4.f_max', 'pfloat15');
                    break;
                case 'vb_asset':
                    decoder.pull(fieldId + '.rpm_min', 'uint16');
                    decoder.pull(fieldId + '.rpm_max', 'uint16');
                    break;
                case 'twtg_transmitter':
            }
            break;
        }
        default:
    }
    return decoder.getResult();
}
exports.decodeConfig = decodeConfig;
function encodeConfig(encoder, fieldId, configGroup) {
    var configVersion = encoder.getValue(fieldId + '.version');
    var configType = encoder.getValue(fieldId + '.type');
    switch (configGroup) {
        case 'schedule_settings': {
            encoder.pushEnum(fieldId + '.type', enums.schedule_type_v0);
            encoder.writeBits(configVersion, 4);
            break;
        }
        case 'device_configuration': {
            encoder.pushEnum(fieldId + '.type', enums.device_configuration_type_v0);
            encoder.writeBits(configVersion, 4);
            break;
        }
        default:
            throw new Error("Unknown configuration group: ".concat(configGroup));
    }
    switch (configType + '-' + configVersion) {
        case 'transmitter_status-0': {
            break;
        }
        case 'transmitter_battery-0': {
            break;
        }
        case 'vb_measurement-0': {
            encoder.pushEnum(fieldId + '.axis', enums.vb_config_axis_v0);
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            encoder.push(fieldId + '.enable_confirmed_message', 'bool');
            encoder.pushEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
            encoder.push(fieldId + '.send_condition.threshold', 'float16');
            encoder.pushContext(fieldId + 'rfu', 'uint1');
            break;
        }
        case 'vb_statistics_x_rms_velocity-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_x_rms_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_x_peak_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_y_rms_velocity-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_y_rms_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_y_peak_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_z_rms_velocity-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_z_rms_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_z_peak_acceleration-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_statistics_temperature-0': {
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            break;
        }
        case 'vb_spectrum-0': {
            encoder.pushEnum(fieldId + '.axis', enums.vb_axis_v0);
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.spectrum_type', enums.vb_spectrum_type_v0);
            encoder.push(fieldId + '.averaging', 'uint3');
            encoder.push(fieldId + '.time_to_transmit_min', 'pfloat15');
            encoder.pushEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
            encoder.push(fieldId + '.send_condition.threshold', 'float16');
            encoder.pushContext(fieldId + 'rfu', 'uint4');
            break;
        }
        case 'vb_machine_fault_indicator-0': {
            encoder.pushEnum(fieldId + '.axis', enums.vb_config_axis_v0);
            encoder.pushEnum(fieldId + '.range', enums.vb_range_v0);
            encoder.push(fieldId + '.sample_speed_divider', 'uint8');
            encoder.push(fieldId + '.f_min', 'pfloat15');
            encoder.push(fieldId + '.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.fault_type', enums.vb_fault_type_v0);
            encoder.pushEnum(fieldId + '.send_condition.value_type', enums.vb_send_condition_v0);
            encoder.push(fieldId + '.send_condition.threshold', 'float16');
            break;
        }
        case 'schedule-0': {
            encoder.pushEnum(fieldId + '.command', enums.schedule_set_command_v0);
            encoder.push(fieldId + '.timing', 'timing');
            encoder.push(fieldId + '.triggered_on_button_press', 'bool');
            encoder.push(fieldId + '.send', 'bool');
            encoder.pushContext(fieldId + 'rfu', 'uint6');
            encodeConfig(encoder, fieldId + '.settings', 'schedule_settings');
            break;
        }
        case 'transmitter-0': {
            encoder.push(fieldId + '.allow_deactivation', 'bool');
            encoder.push(fieldId + '.require_sensor_pairing', 'bool');
            encoder.push(fieldId + '.enable_class_b', 'bool');
            encoder.push(fieldId + '.time_synchronization_interval_days', 'uint3');
            encoder.push(fieldId + '.fragmented_uplink_redundancy_percent', 'uint8');
            encoder.pushContext(fieldId + 'rfu', 'uint2');
            break;
        }
        case 'vb_alert-0': {
            encoder.push(fieldId + '.enable_confirmed_alert', 'bool');
            encoder.push(fieldId + '.enable_spectrum_on_alert', 'bool');
            encoder.pushEnum(fieldId + '.spectrum_type', enums.vb_spectrum_type_v0);
            encoder.push(fieldId + '.time_to_transmit_min', 'pfloat15');
            encoder.push(fieldId + '.hold_off_hours', 'uint10');
            encoder.pushEnum(fieldId + '.alert_0.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_0.threshold', 'float16');
            encoder.push(fieldId + '.alert_0.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_1.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_1.threshold', 'float16');
            encoder.push(fieldId + '.alert_1.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_2.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_2.threshold', 'float16');
            encoder.push(fieldId + '.alert_2.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_3.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_3.threshold', 'float16');
            encoder.push(fieldId + '.alert_3.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_4.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_4.threshold', 'float16');
            encoder.push(fieldId + '.alert_4.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_5.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_5.threshold', 'float16');
            encoder.push(fieldId + '.alert_5.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_6.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_6.threshold', 'float16');
            encoder.push(fieldId + '.alert_6.hysteresis', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_7.selection', enums.vb_alert_selection_v0);
            encoder.push(fieldId + '.alert_7.threshold', 'float16');
            encoder.push(fieldId + '.alert_7.hysteresis', 'pfloat15');
            encoder.pushContext(fieldId + 'rfu', 'uint6');
            break;
        }
        case 'vb_spectrum_alert-0': {
            encoder.push(fieldId + '.enable_confirmed_alert', 'bool');
            encoder.push(fieldId + '.enable_spectrum_on_alert', 'bool');
            encoder.push(fieldId + '.time_to_transmit_min', 'pfloat15');
            encoder.push(fieldId + '.hold_off_hours', 'uint10');
            encoder.pushEnum(fieldId + '.alert_0.selection', enums.vb_spectrum_alert_selection_v0);
            encoder.push(fieldId + '.alert_0.threshold', 'pfloat15');
            encoder.push(fieldId + '.alert_0.hysteresis', 'pfloat15');
            encoder.push(fieldId + '.alert_0.f_min', 'pfloat15');
            encoder.push(fieldId + '.alert_0.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_1.selection', enums.vb_spectrum_alert_selection_v0);
            encoder.push(fieldId + '.alert_1.threshold', 'pfloat15');
            encoder.push(fieldId + '.alert_1.hysteresis', 'pfloat15');
            encoder.push(fieldId + '.alert_1.f_min', 'pfloat15');
            encoder.push(fieldId + '.alert_1.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_2.selection', enums.vb_spectrum_alert_selection_v0);
            encoder.push(fieldId + '.alert_2.threshold', 'pfloat15');
            encoder.push(fieldId + '.alert_2.hysteresis', 'pfloat15');
            encoder.push(fieldId + '.alert_2.f_min', 'pfloat15');
            encoder.push(fieldId + '.alert_2.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_3.selection', enums.vb_spectrum_alert_selection_v0);
            encoder.push(fieldId + '.alert_3.threshold', 'pfloat15');
            encoder.push(fieldId + '.alert_3.hysteresis', 'pfloat15');
            encoder.push(fieldId + '.alert_3.f_min', 'pfloat15');
            encoder.push(fieldId + '.alert_3.f_max', 'pfloat15');
            encoder.pushEnum(fieldId + '.alert_4.selection', enums.vb_spectrum_alert_selection_v0);
            encoder.push(fieldId + '.alert_4.threshold', 'pfloat15');
            encoder.push(fieldId + '.alert_4.hysteresis', 'pfloat15');
            encoder.push(fieldId + '.alert_4.f_min', 'pfloat15');
            encoder.push(fieldId + '.alert_4.f_max', 'pfloat15');
            break;
        }
        case 'vb_asset-0': {
            encoder.push(fieldId + '.rpm_min', 'uint16');
            encoder.push(fieldId + '.rpm_max', 'uint16');
            break;
        }
        default:
            throw new Error("Unknown configuration: ".concat(configType, " version: ").concat(configVersion));
    }
}
exports.encodeConfig = encodeConfig;
function decodeDownlink(fport, decoder, enums) {
    var message_id = decoder.readBits(4);
    var message_version = decoder.readBits(4);
    switch ((fport << 8) | (message_id << 4) | message_version) {
        // configuration_update_request FPort: 11 ID: 0 v0
        case 0xb00:
            decoder.setNameAndVersion('configuration_update_request', 0);
            decoder.pullHex('tag', 'uint32');
            decodeConfig('payload', 'device_configuration', decoder);
            break;
        default:
            throw new Error("Unknown message fPort: ".concat(fport, ", id: ").concat(message_id, ", version: ").concat(message_version));
    }
    return decoder.getResult();
}
exports.decodeDownlink = decodeDownlink;
function encodeDownlink(input) {
    var result = {};
    var encoder = new Encoder_1.Encoder(input);
    var msgName = encoder.getName();
    var msgVersion = input.data[msgName].version;
    switch (msgName + '-' + msgVersion) {
        case 'transmitter_battery_reset_request-0':
            result.fPort = 14;
            encoder.writeBits(3, 4);
            encoder.writeBits(0, 4);
            encoder.push('magic_value', 'uint16');
            break;
        case 'configuration_update_request-0':
            result.fPort = 11;
            encoder.writeBits(0, 4);
            encoder.writeBits(0, 4);
            encoder.push('tag', 'uint32');
            encodeConfig(encoder, 'payload', 'device_configuration');
            break;
        case 'fragmented_uplink_stop-0':
            result.fPort = 12;
            encoder.writeBits(2, 4);
            encoder.writeBits(0, 4);
            break;
        case 'past_measurement_request-0':
            result.fPort = 14;
            encoder.writeBits(0, 4);
            encoder.writeBits(0, 4);
            encoder.push('timestamp', 'timestamp');
            break;
        case 'factory_reset_request-0':
            result.fPort = 14;
            encoder.writeBits(2, 4);
            encoder.writeBits(0, 4);
            encoder.push('magic_value', 'uint16');
            break;
        default:
            throw new Error("Unknown message: ".concat(msgName, ", version: ").concat(msgVersion));
    }
    result.bytes = encoder.result();
    return result;
}
exports.encodeDownlink = encodeDownlink;


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Decoder = void 0;
var ReadCursor_1 = __webpack_require__(2);
var TypeCodec_1 = __webpack_require__(3);
function unflattenObject(flatObject) {
    var result = {};
    // NOTE: don't use `Object.entries()` as it is not supported by `js2py`
    for (var key in flatObject) {
        var value = flatObject[key];
        var keys = key.split('.');
        var currentLevel = result;
        for (var i = 0; i < keys.length; i++) {
            var currentKey = keys[i];
            if (i === keys.length - 1) {
                currentLevel[currentKey] = value;
            }
            else {
                currentLevel[currentKey] = currentLevel[currentKey] || {};
                currentLevel = currentLevel[currentKey];
            }
        }
    }
    return result;
}
var Decoder = /** @class */ (function () {
    function Decoder(typeCodec, input) {
        this._typeCodec = typeCodec;
        this._cursor = new ReadCursor_1.ReadCursor(input.bytes);
        this._input = input;
        this._context = {};
        this._name = '';
        this._data = {};
    }
    Decoder.prototype.setNameAndVersion = function (name, version) {
        this._name = name;
        this._data["".concat(this._name, ".version")] = version;
    };
    Decoder.prototype.setField = function (fieldId, value) {
        this._data["".concat(this._name, ".").concat(fieldId)] = value;
    };
    Decoder.prototype.readBits = function (count) {
        return this._cursor.readBits(count);
    };
    Decoder.prototype.isFinished = function () {
        return this._cursor.isFinished();
    };
    Decoder.prototype.decode = function (fieldId, type, decodeAsHex, decodeToContext) {
        var value = this._typeCodec.decode(this._cursor, this._input.recvTime, this._context, type, decodeAsHex);
        if (decodeToContext) {
            this._context[fieldId] = value;
        }
        else {
            this.setField(fieldId, value);
        }
        return value;
    };
    Decoder.prototype.pull = function (fieldId, type) {
        return this.decode(fieldId, type, false, false);
    };
    Decoder.prototype.pullHex = function (fieldId, type) {
        return this.decode(fieldId, type, true, false);
    };
    Decoder.prototype.pullContext = function (fieldId, type) {
        return this.decode(fieldId, type, false, true);
    };
    Decoder.prototype.pullEnum = function (fieldId, enumeration) {
        var _a;
        var value = (_a = enumeration.values[this.readBits(enumeration.size)]) !== null && _a !== void 0 ? _a : enumeration.default;
        this.setField(fieldId, value);
        return value;
    };
    Decoder.prototype.pullDownlinks = function (fieldId, enums, decodeDownlink) {
        var downlinks = [];
        while (!this.isFinished()) {
            var result = {};
            var fPort = this.readBits(8);
            var msgLen = this.readBits(8);
            var msgBytes = [];
            for (var i = 0; i < msgLen; i++) {
                msgBytes.push(this.readBits(8));
            }
            var msgInput = {
                bytes: msgBytes,
                fPort: fPort,
                recvTime: new Date()
            };
            var msgDecoder = new Decoder(TypeCodec_1.TypeCodec.getInstance(), msgInput);
            try {
                result.data = decodeDownlink(fPort, msgDecoder, enums);
            }
            catch (e) {
                if (e instanceof Error) {
                    result.errors = [e.message];
                }
                else {
                    throw e;
                }
            }
            downlinks.push(result);
        }
        this.setField(fieldId, downlinks);
    };
    Decoder.prototype.getResult = function () {
        return unflattenObject(this._data);
    };
    return Decoder;
}());
exports.Decoder = Decoder;


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Encoder = void 0;
var WriteCursor_1 = __webpack_require__(9);
var TypeCodec_1 = __webpack_require__(3);
var Encoder = /** @class */ (function () {
    function Encoder(input) {
        this._typeCodec = TypeCodec_1.TypeCodec.getInstance();
        this._cursor = new WriteCursor_1.WriteCursor();
        this._input = input;
        this._context = {};
        // NOTE: don't use `Object.entries()` as it is not part of ES5
        this._name = Object.keys(input.data)[0];
        this._data = input.data[this._name];
    }
    Encoder.prototype.getName = function () {
        return this._name;
    };
    Encoder.prototype.getValue = function (path) {
        var value = undefined;
        var obj = this._data;
        for (var _i = 0, _a = path.split('.'); _i < _a.length; _i++) {
            var key = _a[_i];
            value = obj[key];
            if (value === undefined) {
                break;
            }
            obj = value;
        }
        if (value === undefined) {
            throw new Error("Cannot encode, field is missing: ".concat(path));
        }
        return value;
    };
    Encoder.prototype.writeBits = function (value, count) {
        this._cursor.writeBits(value, count);
    };
    Encoder.prototype.encode = function (fieldId, value, type) {
        // Check if it's an array
        var arrayPattern = /^(.+)\[(\d+)?\]$/;
        var arrayMatch = type.match(arrayPattern);
        var isArray = !!arrayMatch;
        if (isArray) {
            var arrayType = arrayMatch[1];
            var arrayLen = parseInt(arrayMatch[2]);
            if (!Array.isArray(value)) {
                throw new Error("Cannot encode field \"".concat(fieldId, "\": needs to be an array"));
            }
            if (!isNaN(arrayLen) && value.length != arrayLen) {
                throw new Error("Cannot encode field \"".concat(fieldId, "\": Length is not as expected expected: ").concat(arrayLen, " got: ").concat(value.length));
            }
            try {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var arrayValue = value_1[_i];
                    this._typeCodec.encode(this._cursor, arrayType, arrayValue);
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    throw new Error("Cannot encode field \"".concat(fieldId, "\": ").concat(e.message));
                }
                else {
                    throw e;
                }
            }
        }
        else {
            try {
                this._typeCodec.encode(this._cursor, type, value);
            }
            catch (e) {
                if (e instanceof Error) {
                    throw new Error("Cannot encode field \"".concat(fieldId, "\": ").concat(e.message));
                }
                else {
                    throw e;
                }
            }
        }
    };
    Encoder.prototype.push = function (fieldId, type) {
        this.encode(fieldId, this.getValue(fieldId), type);
    };
    Encoder.prototype.pushEnum = function (fieldId, enumeration) {
        var key = this.getValue(fieldId);
        if (typeof key !== 'string') {
            throw new Error("Cannot encode field \"".concat(fieldId, "\": Enumeration key must be a string"));
        }
        for (var value in enumeration.values) {
            if (enumeration.values[value] === key) {
                this.writeBits(parseInt(value), enumeration.size);
                return;
            }
        }
        throw new Error("Cannot encode field: \"".concat(fieldId, "\": Unknown enumeration key: ").concat(key));
    };
    Encoder.prototype.pushContext = function (fieldId, type) {
        try {
            this.encode(fieldId, this.getValue(fieldId), type);
        }
        catch (e) {
            this.encode(fieldId, 0, type);
        }
    };
    Encoder.prototype.result = function () {
        return this._cursor.bytes;
    };
    return Encoder;
}());
exports.Encoder = Encoder;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriteCursor = void 0;
var WriteCursor = /** @class */ (function () {
    /**
     * WriteCursor constructor, starts with an empty byte array.
     */
    function WriteCursor() {
        this.bytes = [];
        this.writtenBitsInByte = 8;
    }
    /**
     * Writes value within the specified number of bits
     */
    WriteCursor.prototype.writeBits = function (value, count) {
        // NOTE: Math.pow is used because JS shift operations work only on 32bit integers
        if (value < 0 || value >= Math.pow(2, count)) {
            throw new Error("Value ".concat(value, " cannot be represented with ").concat(count, " bits."));
        }
        while (count > 0) {
            if (this.writtenBitsInByte === 8) {
                // Start a new byte if the current one is full
                this.bytes.push(0);
                this.writtenBitsInByte = 0;
            }
            var bitsToWrite = Math.min(8 - this.writtenBitsInByte, count);
            var bitMask = (1 << bitsToWrite) - 1;
            var bits = (value >> (count - bitsToWrite)) & bitMask;
            this.bytes[this.bytes.length - 1] |=
                bits << (8 - (this.writtenBitsInByte + bitsToWrite));
            this.writtenBitsInByte += bitsToWrite;
            count -= bitsToWrite;
        }
    };
    /**
     * Writes an array of bytes to the cursor.
     */
    WriteCursor.prototype.writeBytes = function (byteArray) {
        if (!Array.isArray(byteArray) || byteArray.length === 0) {
            throw new Error('Invalid input for writing bytes: byteArray');
        }
        for (var _i = 0, byteArray_1 = byteArray; _i < byteArray_1.length; _i++) {
            var byte = byteArray_1[_i];
            this.writeBits(byte, 8);
        }
    };
    return WriteCursor;
}());
exports.WriteCursor = WriteCursor;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	driver = __webpack_exports__;
/******/ 	
/******/ })()
;// Export it for NodeJS if available
if (typeof exports != 'undefined') {
  for (var name in driver.default) {
    exports[name] = driver.default[name];
  }
}

/*
 * LoRaWan Payload Codec interface
 *
 * @reference ts013-1-0-0-payload-codec-api.pdf
 */
function decodeUplink(input) {
  return driver.default.decodeUplink(input);
}

function encodeDownlink(input) {
  return driver.default.encodeDownlink(input);
}

function decodeDownlink(input) {
  throw new Error('Not implemented');
}

/**
 * Entry point for ChirpStack v3 interface
 */
function Encode(fPort, obj) {
  return driver.default.Encode(fPort, obj);
}
function Decode(fPort, bytes) {
  return driver.default.Decode(fPort, bytes);
}

/**
 * Entry point for ThingsNetwork v2 interface
 */
function Encoder(obj, fPort) {
  return Encode(fPort, obj);
}
function Decoder(bytes, fPort) {
  return Decode(fPort, bytes);
}

/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
  return driver.default.DecodeHexString(fPort, hex_string);
}

//# sourceMappingURL=vb_v4-plain-2c04fa5.js.map