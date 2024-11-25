import { readProp, TypedNumber } from "@heraclius/js-tools";
import { BufferData } from "./BufferData";
import { BufferReader, type IReadonlyBuffer } from "./BufferReader";

export interface IWritableBuffer extends IReadonlyBuffer {
  writeInt8(value: number, offset: number): void;

  writeUint8(value: number, offset: number): void;

  writeInt16BE(value: number, offset: number): void;

  writeUint16BE(value: number, offset: number): void;

  writeInt32BE(value: number, offset: number): void;

  writeUint32BE(value: number, offset: number): void;

  writeFloatBE(value: number, offset: number): void;

  writeDoubleBE(value: number, offset: number): void;

  writeBigInt64BE(value: bigint, offset: number): void;

  writeBigUInt64BE(value: bigint, offset: number): void;
}

export class BufferWriter extends BufferReader<IWritableBuffer> {
  writeBit(
    bool: boolean | number | TypedNumber.Bit,
    bit: number,
    offset: number,
  ) {
    if (bit < 0 || bit > 7) throw new Error("bit out of range");
    bit = 7 - bit;
    const bitValue = TypedNumber.Bit.value(bool) ? 1 : 0;
    const oldValue = this.readUint8(offset);
    const newValue = bitValue ? oldValue | (1 << bit) : oldValue & ~(1 << bit);
    this.writeUint8(newValue, offset);
  }

  writeInt8(value: number | TypedNumber.Int8, offset: number) {
    value = TypedNumber.Int8.value(value);
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt8(value, offset);
  }

  writeUint8(value: number | TypedNumber.Uint8, offset: number) {
    value = TypedNumber.Uint8.value(value);
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint8(value, offset);
  }

  writeInt16(value: number | TypedNumber.Int16, offset: number) {
    value = TypedNumber.Int16.value(value);
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt16BE(value, offset);
  }

  writeUint16(value: number | TypedNumber.Uint16, offset: number) {
    value = TypedNumber.Uint16.value(value);
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint16BE(value, offset);
  }

  writeInt32(value: number | TypedNumber.Int32, offset: number) {
    value = TypedNumber.Uint32.value(value);
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt32BE(value, offset);
  }

  writeUint32(value: number | TypedNumber.Uint32, offset: number) {
    value = TypedNumber.Uint32.value(value);
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint32BE(value, offset);
  }

  writeFloat(value: number | TypedNumber.Float, offset: number) {
    value = TypedNumber.Float.value(value);
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    this._data.writeFloatBE(value, offset);
  }

  writeInt64(value: bigint | TypedNumber.Int64, offset: number) {
    value = TypedNumber.Int64.value(value);
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    this._data.writeBigInt64BE(value, offset);
  }

  writeUint64(value: bigint | TypedNumber.Uint64, offset: number) {
    value = TypedNumber.Uint64.value(value);
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    this._data.writeBigUInt64BE(value, offset);
  }

  writeDouble(value: number | TypedNumber.Double, offset: number) {
    value = TypedNumber.Uint64.value(value);
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    this._data.writeDoubleBE(value, offset);
  }

  write(
    type: BufferData.Type,
    value: number | bigint | TypedNumber.Base,
    offset: number,
  ) {
    if (value instanceof TypedNumber.Bit) value = value.value;
    else value = TypedNumber.Base.value(value);
    if (type === "uint8") return this.writeUint8(value as any, offset);
    else if (type === "int8") return this.writeInt8(value as any, offset);
    else if (type === "int16") return this.writeInt16(value as any, offset);
    else if (type === "uint16") return this.writeUint16(value as any, offset);
    else if (type === "int32") return this.writeInt32(value as any, offset);
    else if (type === "uint32") return this.writeUint32(value as any, offset);
    else if (type === "uint64") return this.writeUint64(value as any, offset);
    else if (type === "int64") return this.writeInt64(value as any, offset);
    else if (type === "float") return this.writeFloat(value as any, offset);
    else if (type === "double") return this.writeDouble(value as any, offset);
    throw new Error("Invalid type " + type);
  }

  putArray(
    array: Array<number | TypedNumber.Base>,
    type: BufferData.Type,
    writeInStart: number = 0,
  ) {
    let methodName = "",
      offsetStep = 1;
    switch (type) {
      case "double":
        methodName = "writeDouble";
        offsetStep = 8;
        break;
      case "float":
        methodName = "writeFloat";
        offsetStep = 4;
        break;
      case "int32":
        methodName = "writeInt32";
        offsetStep = 4;
        break;
      case "uint32":
        methodName = "writeUint32";
        offsetStep = 4;
        break;
      case "int16":
        methodName = "writeInt16";
        offsetStep = 2;
        break;
      case "uint16":
        methodName = "writeUint16";
        offsetStep = 2;
        break;
      case "int8":
        methodName = "writeInt8";
        break;
      case "uint8":
        methodName = "writeUint8";
        break;
      default:
        throw new Error("invalid type " + type);
    }
    for (let i = 0; i < array.length; i++, writeInStart += offsetStep) {
      (this as any)[methodName](array[i], writeInStart);
    }
  }

  putBigintArray(
    data: Array<bigint | TypedNumber.Int64 | TypedNumber.Uint64>,
    writeInStart: number = 0,
    unsigned: boolean = false,
  ) {
    const methodName = unsigned ? "writeUint64" : "writeInt64";
    for (let i = 0; i < data.length; i++, writeInStart += 8) {
      this[methodName](data[i], writeInStart);
    }
  }

  putBuffer(
    data: Buffer | BufferReader,
    offset: number,
    start: number = 0,
    length: number = data.length,
  ) {
    if (this._start + offset + length > this._end)
      throw new Error("offset out of buffer range");
    if (data instanceof BufferReader) {
      const readerBuffer = readProp<IReadonlyBuffer>(data, "_data");
      if (readerBuffer.toBuffer) data = readerBuffer.toBuffer();
      else {
        // noinspection SuspiciousTypeOfGuard
        if (readerBuffer instanceof Buffer) data = readerBuffer;
        else {
          for (let i = 0; i < length; i++) {
            this.writeUint8(readerBuffer.readUint8(i + start), i + offset);
          }
          return;
        }
      }
    }
    let thisData: Buffer | undefined;
    if (this._data.toBuffer) thisData = this._data.toBuffer();
    else {
      // noinspection SuspiciousTypeOfGuard
      if (this._data instanceof Buffer) thisData = this._data;
    }
    if (thisData) {
      data.copy(thisData, this._start + offset, start, length);
    } else {
      for (let i = 0; i < length; i++) {
        this.writeUint8(data.readUint8(i + start), i + offset);
      }
    }
  }
}
