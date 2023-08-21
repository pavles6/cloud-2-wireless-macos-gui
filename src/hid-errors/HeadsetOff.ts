import { HIDError } from "./HIDError";

export class HeadsetOff extends HIDError {
  constructor() {
    super("Headset is off", "headsetOff");
  }
}
