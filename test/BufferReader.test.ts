import { describe, expect, test } from "vitest";
import { BufferReader } from "../src";

describe("BufferReader", () => {
  test("slice method should return a new BufferReader instance with correct data", () => {
    const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    const reader = new BufferReader(buffer, 1, 3);
    const sliced = reader.slice(BufferReader, 1, 2);

    expect(sliced.readUint8(0)).toEqual(3);
    expect(sliced.readUint8(1)).toEqual(4);
  });

  test("readBit method should return correct bit", () => {
    const buffer = Buffer.from([0b10101010]);
    const reader = new BufferReader(buffer, 0);

    expect(reader.readBit(0, 0)).toBe(1);
    expect(reader.readBit(0, 1)).toBe(0);
    expect(reader.readBit(0, 2)).toBe(1);
    expect(reader.readBit(0, 3)).toBe(0);
    expect(reader.readBit(0, 4)).toBe(1);
    expect(reader.readBit(0, 5)).toBe(0);
  });

  // Add more tests for other read methods ...

  test("method should throw error when offset out of buffer range", () => {
    const buffer = Buffer.from([0x01]);
    const reader = new BufferReader(buffer, 0, 0);

    expect(() => reader.readInt8(1)).toThrowError("offset out of buffer range");
  });

  // ... other similar tests for different methods
});
