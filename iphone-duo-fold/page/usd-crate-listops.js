// three r186's USDCParser returns null for reference and payload list-ops (crate types 35 and 55), which the
// iPhone Duo USDZ uses to pull in its geometry and pose layers. This teaches the parser to read them, following
// the crate layout in OpenUSD's crateFile.cpp:
//   ListOp<T>   = u8 header bits, then for each present list (explicit, added, prepended, appended, deleted,
//                 ordered): u64 count + items
//   Reference   = string index (u32), path index (u32), layer offset (2 × f64), customData dictionary
//   Payload     = string index (u32), path index (u32), layer offset (2 × f64, crate ≥ 0.8.0)
import { USDCParser } from 'three/addons/loaders/usd/USDCParser.js';

const REFERENCE_LIST_OP = 35;
const PAYLOAD_LIST_OP = 55;
const LISTS = [[0x02, 'explicit'], [0x04, 'added'], [0x20, 'prepended'], [0x40, 'appended'], [0x08, 'deleted'], [0x10, 'ordered']];

const readScalarValue = USDCParser.prototype._readScalarValue;
USDCParser.prototype._readScalarValue = function (type) {
  if (type !== REFERENCE_LIST_OP && type !== PAYLOAD_LIST_OP) return readScalarValue.call(this, type);
  const reader = this.reader;
  const header = reader.readUint8();
  const lists = {};
  for (const [bit, name] of LISTS) {
    if (!(header & bit)) continue;
    const count = reader.readUint64();
    const items = [];
    for (let i = 0; i < count; i++) {
      const assetPath = this.tokens[this.strings[reader.readUint32()]] ?? '';
      const primPath = this.paths[reader.readUint32()] ?? '';
      let offset = 0, scale = 1;
      const v = this.version;
      if (type === REFERENCE_LIST_OP || v.major > 0 || v.minor >= 8) {
        offset = reader.readFloat64();
        scale = reader.readFloat64();
      }
      if (type === REFERENCE_LIST_OP) {
        // customData: u64 count, then per entry a string index and a relative value offset. Not needed here.
        const entries = reader.readUint64();
        for (let e = 0; e < entries; e++) {
          reader.readUint32();
          reader.readInt64();
        }
      }
      items.push({ assetPath, primPath, offset, scale });
    }
    lists[name] = items;
  }
  const items = [...(lists.explicit ?? []), ...(lists.prepended ?? []), ...(lists.added ?? []), ...(lists.appended ?? [])];
  return { listOp: type === REFERENCE_LIST_OP ? 'references' : 'payload', items };
};

export { USDCParser };
