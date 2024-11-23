import { BufferData } from "./BufferData";
import { BufferReader } from "./BufferReader";
import { BufferWriter } from "./BufferWriter";

export namespace BufferSegment {
  export abstract class Base<Value = number> {
    constructor(
      readonly buffer: BufferWriter,
      readonly offset: number,
    ) {}

    get value(): Value {
      return this._readValue();
    }

    set value(val: Value) {
      this._writeValue(val);
    }

    protected abstract _readValue(): Value;

    protected abstract _writeValue(value: Value): void;
  }

  export class Bit extends Base<1 | 0> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly bit: number,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): 1 | 0 {
      return this.buffer.readBit(this.offset, this.bit);
    }

    protected _writeValue(value: 1 | 0): void {
      this.buffer.writeBit(value, this.offset, this.bit);
    }
  }

  export class Int8 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt8(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt8(value, this.offset);
    }
  }

  export class Uint8 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint8(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint8(value, this.offset);
    }
  }

  export class Int16 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt16(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt16(value, this.offset);
    }
  }

  export class Uint16 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint16(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint16(value, this.offset);
    }
  }

  export class Int32 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt32(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt32(value, this.offset);
    }
  }

  export class Uint32 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint32(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint32(value, this.offset);
    }
  }

  export class Int64 extends Base<bigint> {
    protected _readValue() {
      return this.buffer.readInt64(this.offset);
    }

    protected _writeValue(value: bigint): void {
      this.buffer.writeInt64(value, this.offset);
    }
  }

  export class Uint64 extends Base<bigint> {
    protected _readValue() {
      return this.buffer.readUint64(this.offset);
    }

    protected _writeValue(value: bigint): void {
      this.buffer.writeUint64(value, this.offset);
    }
  }

  export class Float extends Base {
    protected _readValue(): number {
      return this.buffer.readFloat(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeFloat(value, this.offset);
    }
  }

  export class Double extends Base {
    protected _readValue(): number {
      return this.buffer.readDouble(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeDouble(value, this.offset);
    }
  }

  export class String extends Base<string> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly maxLength: number,
      private _byteLength = maxLength,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): string {
      return this.buffer
        .slice(BufferReader, this.offset, this._byteLength)
        .toString();
    }

    protected _writeValue(value: string): void {
      const strBuffer = Buffer.from(value);
      if (strBuffer.length > this.maxLength) throw new Error("String too long");
      this._byteLength = strBuffer.length;
      const data = Buffer.alloc(this.maxLength);
      strBuffer.copy(data);
      this.buffer.putBuffer(data, this.offset);
    }
  }

  export class StringWithLength extends Base<string> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly length: number,
      readonly lengthByte: number,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): string {
      const data = this.buffer.slice(BufferReader, this.offset, this.length);
      const strLength = data.read(
        BufferData.unsignedType(this.lengthByte),
        data.length - this.lengthByte,
      );
      return this.buffer
        .slice(BufferReader, this.offset, strLength as any)
        .toString();
    }

    protected _writeValue(value: string): void {
      const strBuffer = Buffer.from(value);
      if (strBuffer.length > this.length - this.lengthByte)
        throw new Error("String too long");
      const buffer = new BufferWriter(Buffer.alloc(this.length), 0);
      buffer.putBuffer(strBuffer, 0);
      buffer.write(
        BufferData.unsignedType(this.lengthByte),
        Buffer.from(value).length,
        this.length - this.lengthByte,
      );
      this.buffer.putBuffer(buffer, this.offset);
    }
  }

  export class Bitmap extends Base<Array<number>> {
    protected readonly _byteLength: number;

    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly bitLength: number,
    ) {
      super(buffer, offset);
      this._byteLength = Math.ceil(bitLength / 8);
    }

    getBit(offset: number) {
      if (offset >= this.bitLength) throw new Error("offset out of range");
      const byteOffset = Math.floor(offset / 8);
      const bitOffset = offset % 8;
      return this.buffer.readBit(this.offset + byteOffset, bitOffset);
    }

    setBit(offset: number, value: boolean | number) {
      if (offset >= this.bitLength) throw new Error("offset out of range");
      const byteOffset = Math.floor(offset / 8);
      const bitOffset = offset % 8;
      return this.buffer.writeBit(value, bitOffset, this.offset + byteOffset);
    }

    protected _readValue(): Array<number> {
      return this.buffer
        .slice(BufferReader, this.offset, this._byteLength)
        .toNumberArray("uint8");
    }

    protected _writeValue(value: Array<number>): void {
      this.buffer.putArray(value, "uint8", this.offset);
    }
  }
}
