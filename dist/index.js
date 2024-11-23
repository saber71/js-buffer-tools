var BufferData;
(function(BufferData) {
    function bytes(type) {
        if (type === "int64") return 8;
        else if (type === "uint32") return 4;
        else if (type === "uint64") return 8;
        else if (type === "uint16") return 2;
        else if (type === "int8") return 1;
        else if (type === "uint8") return 1;
        else if (type === "int16") return 2;
        else if (type === "int32") return 4;
        throw new Error(`Unknown data type ${type}`);
    }
    BufferData.bytes = bytes;
    function unsignedType(bytes) {
        if (bytes === 1) return "uint8";
        else if (bytes === 2) return "uint16";
        else if (bytes === 4) return "uint32";
        else if (bytes === 8) return "uint64";
        throw new Error(`Unknown data type with ${bytes} bytes`);
    }
    BufferData.unsignedType = unsignedType;
    function signedType(bytes) {
        if (bytes === 1) return "int8";
        else if (bytes === 2) return "int16";
        else if (bytes === 4) return "int32";
        else if (bytes === 8) return "int64";
        throw new Error(`Unknown data type with ${bytes} bytes`);
    }
    BufferData.signedType = signedType;
})(BufferData || (BufferData = {}));

class BufferReader {
    _data;
    _start;
    _end;
    constructor(_data, _start, _end = _data.length - 1){
        this._data = _data;
        this._start = _start;
        this._end = _end;
    }
    static slice(buffer, offset, length = buffer.length - offset) {
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
   */ slice(clazz, offset = 0, length = this.length) {
        // 检查指定的范围是否超出了当前缓冲区读取器的边界
        if (offset + length - 1 > this._end) throw new Error("length out of buffer range");
        return new clazz(this._data, this._start + offset, this._start + offset + length);
    }
    // 读取指定偏移量处的指定位数的二进制位，注意是从高位往低位读取
    readBit(offset, bit) {
        if (bit < 0 || bit > 7) throw new Error("bit out of range");
        bit = 7 - bit;
        const byte = this.readUint8(offset);
        const mask = 1 << bit;
        return (byte & mask) > 0 ? 1 : 0;
    }
    readInt8(offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt8(offset);
    }
    readUint8(offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint8(offset);
    }
    readInt16(offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt16BE(offset);
    }
    readUint16(offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint16BE(offset);
    }
    readInt32(offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt32BE(offset);
    }
    readUint32(offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint32BE(offset);
    }
    readInt64(offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        return this._data.readBigInt64BE(offset);
    }
    readUint64(offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        return this._data.readBigUInt64BE(offset);
    }
    read(type, offset) {
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
    toString(encoding = "utf-8") {
        return this._data.toString(encoding, this._start, this._end + 1);
    }
    toNumberArray(type) {
        const array = [];
        let methodName, offsetStep = 1;
        switch(type){
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
        for(let i = 0; i < this.length; i += offsetStep){
            array.push(this[methodName](i));
        }
        return array;
    }
    toBigintArray(unsigned = false) {
        const array = [];
        const methodName = unsigned ? "readUint64" : "readInt64";
        for(let i = 0; i < this.length; i += 8){
            array.push(this[methodName](i));
        }
        return array;
    }
}

class BufferWriter extends BufferReader {
    writeBit(bool, bit, offset) {
        if (bit < 0 || bit > 7) throw new Error("bit out of range");
        bit = 7 - bit;
        const bitValue = bool ? 1 : 0;
        const oldValue = this.readUint8(offset);
        const newValue = bitValue ? oldValue | 1 << bit : oldValue & ~(1 << bit);
        this.writeUint8(newValue, offset);
    }
    writeInt8(value, offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt8(value, offset);
    }
    writeUint8(value, offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint8(value, offset);
    }
    writeInt16(value, offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt16BE(value, offset);
    }
    writeUint16(value, offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint16BE(value, offset);
    }
    writeInt32(value, offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt32BE(value, offset);
    }
    writeUint32(value, offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint32BE(value, offset);
    }
    writeInt64(value, offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        this._data.writeBigInt64BE(value, offset);
    }
    writeUint64(value, offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        this._data.writeBigUInt64BE(value, offset);
    }
    write(type, value, offset) {
        if (type === "uint8") return this.writeUint8(value, offset);
        else if (type === "int8") return this.writeInt8(value, offset);
        else if (type === "int16") return this.writeInt16(value, offset);
        else if (type === "uint16") return this.writeUint16(value, offset);
        else if (type === "int32") return this.writeInt32(value, offset);
        else if (type === "uint32") return this.writeUint32(value, offset);
        else if (type === "uint64") return this.writeUint64(value, offset);
        else if (type === "int64") return this.writeInt64(value, offset);
        throw new Error("Invalid type " + type);
    }
    putArray(array, type, writeInStart = 0) {
        let methodName = "", offsetStep = 1;
        switch(type){
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
        for(let i = 0; i < array.length; i++, writeInStart += offsetStep){
            this[methodName](array[i], writeInStart);
        }
    }
    putBigintArray(data, writeInStart = 0, unsigned = false) {
        const methodName = unsigned ? "writeUint64" : "writeInt64";
        for(let i = 0; i < data.length; i++, writeInStart += 8){
            this[methodName](data[i], writeInStart);
        }
    }
    putBuffer(data, offset, start = 0, length = data.length) {
        if (this._start + offset + length > this._end) throw new Error("offset out of buffer range");
        if (data instanceof BufferReader) data = data.getData();
        data.copy(this._data, this._start + offset, start, length);
    }
}

var BufferSegment;
(function(BufferSegment) {
    let Base = class Base {
        buffer;
        offset;
        constructor(buffer, offset){
            this.buffer = buffer;
            this.offset = offset;
        }
        get value() {
            return this._readValue();
        }
        set value(val) {
            this._writeValue(val);
        }
    };
    BufferSegment.Base = Base;
    let Bit = class Bit extends Base {
        bit;
        constructor(buffer, offset, bit){
            super(buffer, offset);
            this.bit = bit;
        }
        _readValue() {
            return this.buffer.readBit(this.offset, this.bit);
        }
        _writeValue(value) {
            this.buffer.writeBit(value, this.offset, this.bit);
        }
    };
    BufferSegment.Bit = Bit;
    let Int8 = class Int8 extends Base {
        _readValue() {
            return this.buffer.readInt8(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeInt8(value, this.offset);
        }
    };
    BufferSegment.Int8 = Int8;
    let Uint8 = class Uint8 extends Base {
        _readValue() {
            return this.buffer.readUint8(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeUint8(value, this.offset);
        }
    };
    BufferSegment.Uint8 = Uint8;
    let Int16 = class Int16 extends Base {
        _readValue() {
            return this.buffer.readInt16(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeInt16(value, this.offset);
        }
    };
    BufferSegment.Int16 = Int16;
    let Uint16 = class Uint16 extends Base {
        _readValue() {
            return this.buffer.readUint16(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeUint16(value, this.offset);
        }
    };
    BufferSegment.Uint16 = Uint16;
    let Int32 = class Int32 extends Base {
        _readValue() {
            return this.buffer.readInt32(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeInt32(value, this.offset);
        }
    };
    BufferSegment.Int32 = Int32;
    let Uint32 = class Uint32 extends Base {
        _readValue() {
            return this.buffer.readUint32(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeUint32(value, this.offset);
        }
    };
    BufferSegment.Uint32 = Uint32;
    let Int64 = class Int64 extends Base {
        _readValue() {
            return this.buffer.readInt64(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeInt64(value, this.offset);
        }
    };
    BufferSegment.Int64 = Int64;
    let Uint64 = class Uint64 extends Base {
        _readValue() {
            return this.buffer.readUint64(this.offset);
        }
        _writeValue(value) {
            this.buffer.writeUint64(value, this.offset);
        }
    };
    BufferSegment.Uint64 = Uint64;
    let String = class String extends Base {
        maxLength;
        _byteLength;
        constructor(buffer, offset, maxLength, _byteLength = maxLength){
            super(buffer, offset);
            this.maxLength = maxLength;
            this._byteLength = _byteLength;
        }
        _readValue() {
            return this.buffer.slice(BufferReader, this.offset, this._byteLength).toString();
        }
        _writeValue(value) {
            const strBuffer = Buffer.from(value);
            if (strBuffer.length > this.maxLength) throw new Error("String too long");
            this._byteLength = strBuffer.length;
            const data = Buffer.alloc(this.maxLength);
            strBuffer.copy(data);
            this.buffer.putBuffer(data, this.offset);
        }
    };
    BufferSegment.String = String;
    let StringWithLength = class StringWithLength extends Base {
        length;
        lengthByte;
        constructor(buffer, offset, length, lengthByte){
            super(buffer, offset);
            this.length = length;
            this.lengthByte = lengthByte;
        }
        _readValue() {
            const data = this.buffer.slice(BufferReader, this.offset, this.length);
            const strLength = data.read(BufferData.unsignedType(this.lengthByte), data.length - this.lengthByte);
            return this.buffer.slice(BufferReader, this.offset, strLength).toString();
        }
        _writeValue(value) {
            const strBuffer = Buffer.from(value);
            if (strBuffer.length > this.length - this.lengthByte) throw new Error("String too long");
            const buffer = new BufferWriter(Buffer.alloc(this.length), 0);
            buffer.putBuffer(strBuffer, 0);
            buffer.write(BufferData.unsignedType(this.lengthByte), Buffer.from(value).length, this.length - this.lengthByte);
            this.buffer.putBuffer(buffer, this.offset);
        }
    };
    BufferSegment.StringWithLength = StringWithLength;
    let Bitmap = class Bitmap extends Base {
        bitLength;
        _byteLength;
        constructor(buffer, offset, bitLength){
            super(buffer, offset);
            this.bitLength = bitLength;
            this._byteLength = Math.ceil(bitLength / 8);
        }
        getBit(offset) {
            if (offset >= this.bitLength) throw new Error("offset out of range");
            const byteOffset = Math.floor(offset / 8);
            const bitOffset = offset % 8;
            return this.buffer.readBit(this.offset + byteOffset, bitOffset);
        }
        setBit(offset, value) {
            if (offset >= this.bitLength) throw new Error("offset out of range");
            const byteOffset = Math.floor(offset / 8);
            const bitOffset = offset % 8;
            return this.buffer.writeBit(value, bitOffset, this.offset + byteOffset);
        }
        _readValue() {
            return this.buffer.slice(BufferReader, this.offset, this._byteLength).toNumberArray("uint8");
        }
        _writeValue(value) {
            this.buffer.putArray(value, "uint8", this.offset);
        }
    };
    BufferSegment.Bitmap = Bitmap;
})(BufferSegment || (BufferSegment = {}));

export { BufferData, BufferReader, BufferSegment, BufferWriter };
