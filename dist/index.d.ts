import { Class } from '@heraclius/js-tools';

export declare namespace BufferData {
    export type Type = "uint8" | "int8" | "uint16" | "int16" | "uint32" | "int32" | "uint64" | "int64";
    export function bytes(type: Type): 8 | 4 | 2 | 1;
    export function unsignedType(bytes: number): "uint8" | "uint16" | "uint32" | "uint64";
    export function signedType(bytes: number): "int8" | "int16" | "int32" | "int64";
}

export declare class BufferReader {
    protected readonly _data: Buffer;
    protected readonly _start: number;
    protected readonly _end: number;
    constructor(_data: Buffer, _start: number, _end?: number);
    static slice(buffer: Buffer, offset: number, length?: number): Buffer;
    get length(): number;
    getData(): Buffer;
    /**
     * 从当前缓冲区读取器中切出一个新的缓冲区读取器
     *
     * 此方法允许从当前缓冲区读取器中指定一个范围，然后根据这个范围创建一个新的缓冲区读取器
     * 它主要用于在处理缓冲区数据时，提取特定部分的数据进行操作或传输
     */
    slice<T extends BufferReader>(clazz: Class<T>, offset?: number, length?: number): T;
    readBit(offset: number, bit: number): 1 | 0;
    readInt8(offset: number): number;
    readUint8(offset: number): number;
    readInt16(offset: number): number;
    readUint16(offset: number): number;
    readInt32(offset: number): number;
    readUint32(offset: number): number;
    readInt64(offset: number): bigint;
    readUint64(offset: number): bigint;
    read(type: BufferData.Type, offset: number): number | bigint;
    toString(encoding?: BufferEncoding): string;
    toNumberArray(type: BufferData.Type): Array<number>;
    toBigintArray(unsigned?: boolean): Array<bigint>;
}

export declare namespace BufferSegment {
    export abstract class Base<Value = number> {
        readonly buffer: BufferWriter;
        readonly offset: number;
        constructor(buffer: BufferWriter, offset: number);
        get value(): Value;
        set value(val: Value);
        protected abstract _readValue(): Value;
        protected abstract _writeValue(value: Value): void;
    }
    export class Bit extends Base<1 | 0> {
        readonly bit: number;
        constructor(buffer: BufferWriter, offset: number, bit: number);
        protected _readValue(): 1 | 0;
        protected _writeValue(value: 1 | 0): void;
    }
    export class Int8 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Uint8 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Int16 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Uint16 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Int32 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Uint32 extends Base {
        protected _readValue(): number;
        protected _writeValue(value: number): void;
    }
    export class Int64 extends Base<bigint> {
        protected _readValue(): bigint;
        protected _writeValue(value: bigint): void;
    }
    export class Uint64 extends Base<bigint> {
        protected _readValue(): bigint;
        protected _writeValue(value: bigint): void;
    }
    export class String extends Base<string> {
        readonly maxLength: number;
        private _byteLength;
        constructor(buffer: BufferWriter, offset: number, maxLength: number, _byteLength?: number);
        protected _readValue(): string;
        protected _writeValue(value: string): void;
    }
    export class StringWithLength extends Base<string> {
        readonly length: number;
        readonly lengthByte: number;
        constructor(buffer: BufferWriter, offset: number, length: number, lengthByte: number);
        protected _readValue(): string;
        protected _writeValue(value: string): void;
    }
    export class Bitmap extends Base<Array<number>> {
        readonly bitLength: number;
        protected readonly _byteLength: number;
        constructor(buffer: BufferWriter, offset: number, bitLength: number);
        getBit(offset: number): 1 | 0;
        setBit(offset: number, value: boolean | number): void;
        protected _readValue(): Array<number>;
        protected _writeValue(value: Array<number>): void;
    }
}

export declare class BufferWriter extends BufferReader {
    writeBit(bool: boolean | number, bit: number, offset: number): void;
    writeInt8(value: number, offset: number): void;
    writeUint8(value: number, offset: number): void;
    writeInt16(value: number, offset: number): void;
    writeUint16(value: number, offset: number): void;
    writeInt32(value: number, offset: number): void;
    writeUint32(value: number, offset: number): void;
    writeInt64(value: bigint, offset: number): void;
    writeUint64(value: bigint, offset: number): void;
    write(type: BufferData.Type, value: number | bigint, offset: number): void;
    putArray(array: number[], type: BufferData.Type, writeInStart?: number): void;
    putBigintArray(data: bigint[], writeInStart?: number, unsigned?: boolean): void;
    putBuffer(data: Buffer | BufferReader, offset: number, start?: number, length?: number): void;
}

export { }
