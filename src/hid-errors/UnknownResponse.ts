import { HIDError } from "./HIDError";

export class UnknownResponse extends HIDError {
  constructor() {
    super("Unknown response from device", "unknownResponse");
  }
}
