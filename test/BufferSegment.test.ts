import { describe, expect, test } from "vitest";
import { BufferSegment, BufferWriter } from "../src";

describe("BufferSegment", () => {
  test("String", () => {
    const strBuffer = Buffer.from("abc123");
    const buffer = Buffer.alloc(strBuffer.length + 1);
    strBuffer.copy(buffer, 1);
    const reader = new BufferWriter(buffer, 0);
    const string = new BufferSegment.String(reader, 1, strBuffer.length);

    expect(string.value).toEqual("abc123");
  });
});
