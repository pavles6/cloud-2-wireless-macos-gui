import { HIDError } from "./HIDError";

export class NoResponse extends HIDError {
  constructor() {
    super("No response from device", "noResponse");
  }
}
