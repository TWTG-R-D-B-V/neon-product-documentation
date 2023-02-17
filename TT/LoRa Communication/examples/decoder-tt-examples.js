var decoder = require('../decoder_tt_rev-5.js');

// protocol v4
var tt_BootPattern = [0x40, 0x01];
var tt_Activated = [0x40, 0x04];
var tt_Deactivated = [0x40, 0x00, 0x00];
var tt_ApplicationEventPattern = [0x40, 0x02, 0x4A, 0x9C, 0xFF];
var tt_ApplicationEventPattern2 = [0x40, 0x00, 0x4A, 0x44, 0x48, 0x9C, 0xFF, 0xC8, 0x00];
var tt_DeviceStatusPattern = [0x40, 0x75, 0x15, 0x03, 0x00, 0x02, 0x06, 0x01, 0x02];

function decode(tag, fport, bytestring) {
  console.log("#### " + tag)
  console.log("fPort: " + fport)
  console.log(", bytestring (hexidecimal):")
  console.log("```")
  console.log(Buffer.from(bytestring).toString('hex'))
  console.log("```")
  var object = decoder.Decode(fport, bytestring);
  console.log("JSON:")
  console.log("```")
  console.log(JSON.stringify(object, null, 4))
  console.log("```")
}

console.log("")
console.log("### Decoding TT protocol v4")
console.log("")
console.log("Generated by:")
console.log("```")
console.log("nodejs ./examples/decoder-tt-examples.js")
console.log("```")
console.log("")
decode("Boot message", 1, tt_BootPattern)
decode("Activated message", 5, tt_Activated)
decode("Deactivated message", 6, tt_Deactivated)
decode("Application event message (pattern 1)", 3, tt_ApplicationEventPattern)
decode("Application event message (pattern 2)", 3, tt_ApplicationEventPattern2)
decode("Device status message (pattern 1)", 2, tt_DeviceStatusPattern)
