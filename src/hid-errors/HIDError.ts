export type HIDErrorType = "noResponse" | "unknownResponse" | "headsetOff";

export abstract class HIDError extends Error {
  type: HIDErrorType;
  constructor(message: string, type: HIDErrorType) {
    super(message);
    this.type = type;
  }
}
