import * as hid from "node-hid";
import { UnknownResponse } from "./hid-errors/UnknownResponse";
import { NoResponse } from "./hid-errors/NoResponse";
import {
  BATTERY_LEVEL_INDEX,
  BATTERY_LEVEL_PACKET,
  DeviceEvent,
  HYPER_X_CLOUD_II_WIRELESS_PID,
  HYPER_X_CLOUD_II_WIRELESS_VID,
  deviceEvents,
} from "./constants/device";

export default class Device {
  private device: hid.HID | undefined = undefined;
  isHeadsetOn: boolean = false;
  batteryLevel: number = -1;
  // isMuted: boolean | undefined = undefined;
  // isCharging: boolean | undefined = undefined;
  // isMicConnected: boolean | undefined = undefined;

  private openDevice() {
    try {
      this.device = new hid.HID(
        HYPER_X_CLOUD_II_WIRELESS_VID,
        HYPER_X_CLOUD_II_WIRELESS_PID
      );
      this.isHeadsetOn = true;
    } catch (error) {
      console.log(error);
      this.isHeadsetOn = false;
    }
  }

  private closeDevice() {
    this.device.close();
    this.isHeadsetOn = false;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getBatteryLevel(): Promise<number> {
    if (this.isHeadsetOn) return -1; // device is open for another operations

    this.openDevice();

    const batteryLevel = await this.readBatteryLevelFromDevice();

    if (!batteryLevel) {
      this.batteryLevel = -1;
    } else {
      this.batteryLevel = batteryLevel;
    }

    this.closeDevice();

    return this.batteryLevel;
  }

  private async readBatteryLevelFromDevice(): Promise<number | undefined> {
    if (!this.isHeadsetOn) return undefined;

    // try 10 times
    for (const _ in new Array(10).fill(null)) {
      this.device.write(BATTERY_LEVEL_PACKET);

      const buffer = this.device.readTimeout(1000);

      try {
        const event = this.getEventFromBuffer(buffer);

        if (event === "batteryLevel") {
          return buffer[BATTERY_LEVEL_INDEX];
        }
      } catch (error) {
        console.log(error);

        if (error.type == "noResponse") {
          this.isHeadsetOn = false;
          break;
        } else continue;
      }

      await this.delay(1000);
    }
  }

  getEventFromBuffer(buffer: number[]): DeviceEvent {
    if (buffer.length == 0) {
      throw new NoResponse();
    }

    const prefix = buffer.slice(0, 5).join();

    const event = deviceEvents.get(prefix);

    if (!event) {
      throw new UnknownResponse();
    }

    return event;
  }
}
