export namespace BufferData {
  export type Type =
    | "uint8"
    | "int8"
    | "uint16"
    | "int16"
    | "uint32"
    | "int32"
    | "uint64"
    | "int64";

  export function bytes(type: Type) {
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

  export function unsignedType(bytes: number) {
    if (bytes === 1) return "uint8";
    else if (bytes === 2) return "uint16";
    else if (bytes === 4) return "uint32";
    else if (bytes === 8) return "uint64";
    throw new Error(`Unknown data type with ${bytes} bytes`);
  }

  export function signedType(bytes: number) {
    if (bytes === 1) return "int8";
    else if (bytes === 2) return "int16";
    else if (bytes === 4) return "int32";
    else if (bytes === 8) return "int64";
    throw new Error(`Unknown data type with ${bytes} bytes`);
  }
}
