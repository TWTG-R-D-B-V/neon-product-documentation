var decoder = require('../../decoder_tt_rev-6');

// protocol v2
var tt_BootPattern = [0x20, 0x04, 0x44, 0x33, 0x22, 0x11, 0x01, 0x00, 0x02, 0x00, 0x03, 0x04, 0x06, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x07, 0x08,];
var tt_Activated = [0x21];
var tt_Deactivated = [0x22];
var tt_ApplicationEventPattern = [0x23, 0x01, 0x02, 0x00, 0x03, 0x00, 0x04, 0x00, 0x05,];
var tt_ApplicationEventPattern2 = [0x23, 0x04, 0x74, 0xF5, 0x44, 0x48, 0xD7, 0x00, 0x09,];
var tt_DeviceStatusPattern = [0x24, 0xCD, 0xAB, 0x34, 0x12, 0x03, 0x0B, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x15, 0x16, 0x17, 0x06, 0x07, 0x08,];
var tt_DeviceStatusPattern2 = [0x24, 0x34, 0x12, 0xCD, 0xAB, 0xFF, 0xA0, 0x0F, 0x10, 0x0E, 0x5E, 0x0E, 0xD8, 0x50, 0x15, 0x7B, 0x4B, 0xF6,];

function decode(tag, bytestring) {
  console.log("#### " + tag)
  console.log("Bytestring (hexidecimal):")
  console.log("```")
  console.log(Buffer.from(bytestring).toString('hex'))
  console.log("```")
  var object = decoder.Decode(15, bytestring);
  console.log("JSON:")
  console.log("```")
  console.log(JSON.stringify(object, null, 4))
  console.log("```")
}

console.log("")
console.log("### Decoding TT protocol v2")
console.log("")
console.log("Generated by:")
console.log("```")
console.log("nodejs ./examples/" + __filename.split('/').slice(-1)[0])
console.log("```")
console.log("")
decode("Boot message", tt_BootPattern)
decode("Activated message", tt_Activated)
decode("Deactivated message", tt_Deactivated)
decode("Application event message (pattern 1)", tt_ApplicationEventPattern)
decode("Application event message (pattern 2)", tt_ApplicationEventPattern2)
decode("Device status message (pattern 1)", tt_DeviceStatusPattern)
decode("Device status message (pattern 2)", tt_DeviceStatusPattern2)
