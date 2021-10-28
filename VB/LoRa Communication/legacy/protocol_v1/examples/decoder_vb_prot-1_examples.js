var decoder = require('../../../decoder_vb_doc-E_rev-4.js');

var bootPattern = [0x10, 0x05, 0x0D, 0xF0, 0xAD, 0x8B, 0x34, 0x12, 0x0C, 0x03, 0x03, 0x44, 0x33, 0x22, 0x11, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x06, 0x01, 0x02, 0x03, 0x04, 0x05, 0xDE, 0xC0, 0xED, 0xFE, 0xBB, 0xAA, 0x55, 0x44, 0x0A, 0x04, 0x04, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0xEE,];
var activated = [0x11, 0x06, 8, 1, 2, 3, 4,];
var deactivated = [0x12, 0x02, 0x00];
var deviceStatusPattern = [0x14, 0xED, 0xFE, 0x0B, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x15, 0x16, 0x17, 0x02, 0x03, 0x04, 0x05, 0x06, 0x06, 0xDE, 0xC0, 0x37, 0x13, 0x01, 0x07];
var applicationEventPattern = [0x13, 0x01, 0x01, 0x00, 0xD2, 0x04, 0x88, 0x13, 0x02, 0x00, 0xD3, 0x04, 0x87, 0x13, 0x03, 0x00, 0xD4, 0x04, 0x86, 0x13, 0x04, 0x00, 0xD5, 0x04, 0x85, 0x13, 0x05, 0x00, 0xD6, 0x04, 0x84, 0x13, 0x06, 0x00, 0xD7, 0x04, 0x83, 0x13, 0x61, 0xF0, 0xD2, 0x04, 0x40, 0x1F, 0x15];
var applicationDataPattern = [0x18, 0x2B, 0x99, 0x40, 0x06, 0x02, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28];

function decode(tag, bytestring) {
  console.log("###### " + tag)
  console.log("Bytestring (hexidecimal):")
  console.log("```")
  console.log(Buffer.from(bytestring).toString('hex'))
  console.log("```")
  var object = decoder.Decode(15, bytestring);
  console.log("JSON:")
  console.log("```json")
  console.log(JSON.stringify(object, null, 4))
  console.log("```")
}

console.log("##### Decoding")
decode("Boot message", bootPattern)
decode("Activated message", activated)
decode("Deactivated message", deactivated)
decode("Device status message (pattern)", deviceStatusPattern)
decode("Application event message", applicationEventPattern)
decode("Application data message", applicationDataPattern)