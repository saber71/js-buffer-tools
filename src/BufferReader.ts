import type { Class } from "@heraclius/js-tools";
import { BufferData } from "./BufferData";

export class BufferReader {
  constructor(
    protected readonly _data: Buffer,
    protected readonly _start: number,
    protected readonly _end: number = _data.length - 1,
  ) {}

  static slice(
    buffer: Buffer,
    offset: number,
    length: number = buffer.length - offset,
  ) {
    const result = Buffer.alloc(length);
    buffer.copy(result, 0, offset, offset + length);
    return result;
  }

  get length() {
    return this._end - this._start + 1;
  }

  getData() {
    return this._data;
  }

  /**
   * 从当前缓冲区读取器中切出一个新的缓冲区读取器
   *
   * 此方法允许从当前缓冲区读取器中指定一个范围，然后根据这个范围创建一个新的缓冲区读取器
   * 它主要用于在处理缓冲区数据时，提取特定部分的数据进行操作或传输
   */
  slice<T extends BufferReader>(
    clazz: Class<T>,
    offset: number = 0,
    length: number = this.length,
  ): T {
    // 检查指定的范围是否超出了当前缓冲区读取器的边界
    if (offset + length - 1 > this._end)
      throw new Error("length out of buffer range");
    return new clazz(
      this._data,
      this._start + offset,
      this._start + offset + length,
    );
  }

  // 读取指定偏移量处的指定位数的二进制位，注意是从高位往低位读取
  readBit(offset: number, bit: number) {
    if (bit < 0 || bit > 7) throw new Error("bit out of range");
    bit = 7 - bit;
    const byte = this.readUint8(offset);
    const mask = 1 << bit;
    return (byte & mask) > 0 ? 1 : 0;
  }

  readInt8(offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    return this._data.readInt8(offset);
  }

  readUint8(offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint8(offset);
  }

  readInt16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this._data.readInt16BE(offset);
  }

  readUint16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint16BE(offset);
  }

  readInt32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this._data.readInt32BE(offset);
  }

  readUint32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint32BE(offset);
  }

  readInt64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this._data.readBigInt64BE(offset);
  }

  readUint64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this._data.readBigUInt64BE(offset);
  }

  read(type: BufferData.Type, offset: number) {
    if (type === "uint8") return this.readUint8(offset);
    else if (type === "int8") return this.readInt8(offset);
    else if (type === "int16") return this.readInt16(offset);
    else if (type === "uint16") return this.readUint16(offset);
    else if (type === "int32") return this.readInt32(offset);
    else if (type === "uint32") return this.readUint32(offset);
    else if (type === "uint64") return this.readUint64(offset);
    else if (type === "int64") return this.readInt64(offset);
    throw new Error("Invalid type " + type);
  }

  toString(encoding: BufferEncoding = "utf-8") {
    return this._data.toString(encoding, this._start, this._end + 1);
  }

  toNumberArray(type: BufferData.Type): Array<number> {
    const array = [];
    let methodName: string,
      offsetStep = 1;
    switch (type) {
      case "int8":
        methodName = "readInt8";
        break;
      case "int16":
        methodName = "readInt16";
        offsetStep = 2;
        break;
      case "uint8":
        methodName = "readUint8";
        break;
      case "uint16":
        methodName = "readUint16";
        offsetStep = 2;
        break;
      case "uint32":
        methodName = "readUint32";
        offsetStep = 4;
        break;
      case "int32":
        methodName = "readInt32";
        offsetStep = 4;
        break;
      default:
        throw new Error("Invalid type " + type);
    }
    for (let i = 0; i < this.length; i += offsetStep) {
      array.push((this as any)[methodName](i));
    }
    return array;
  }

  toBigintArray(unsigned: boolean = false): Array<bigint> {
    const array = [];
    const methodName = unsigned ? "readUint64" : "readInt64";
    for (let i = 0; i < this.length; i += 8) {
      array.push((this as any)[methodName](i));
    }
    return array;
  }
}
