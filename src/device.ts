import * as hid from "node-hid";
import { UnknownResponse } from "./hid-errors/UnknownResponse";
import { NoResponse } from "./hid-errors/NoResponse";
import { HIDError } from "./hid-errors/HIDError";
import { EventEmitter } from "events";
import {
  BATTERY_LEVEL_INDEX,
  BATTERY_LEVEL_PACKET,
  DeviceEvent,
  HYPER_X_CLOUD_II_WIRELESS_PID,
  HYPER_X_CLOUD_II_WIRELESS_VID,
  deviceEvents,
} from "./constants/device";

export default class Device extends EventEmitter {
  private device: hid.HID;
  isHeadsetOn: boolean = true;
  batteryLevel: number | undefined = undefined;
  isMuted: boolean | undefined = undefined;
  isCharging: boolean | undefined = undefined;
  isMicConnected: boolean | undefined = undefined;

  async pair() {
    const deviceInfo = hid
      .devices()
      .filter(
        (device) =>
          device.productId === HYPER_X_CLOUD_II_WIRELESS_PID &&
          device.vendorId === HYPER_X_CLOUD_II_WIRELESS_VID
      )[0];

    try {
      this.device = new hid.HID(deviceInfo.path);
    } catch (error) {
      this.isHeadsetOn = false;
    }

    try {
      this.batteryLevel = await this.getBatteryLevel(); // get battery level on startup
    } catch (error) {
      if (error.type) this.logError(error);
      else console.error(error);
    }

    this.device.on("data", (data) => {
      try {
        const event = this.getEventFromBuffer(data);

        this.updateSelfFromEvent(event);

        this.emit("refresh-gui");
      } catch (error) {
        if (error.type) {
          this.logError(error);
        } else {
          console.error(error);
        }
      }
    });
  }

  async updateBatteryLevel() {
    if (!this.isHeadsetOn) return;

    try {
      this.batteryLevel = await this.getBatteryLevel();
    } catch (error) {
      if (error.type) this.logError(error);
      else console.error(error);
    }
    this.emit("refresh-gui");
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  logError(error: HIDError) {
    console.log(`[${new Date()}]: ${error.message}`);
  }

  async getBatteryLevel(): Promise<number> {
    if (!this.isHeadsetOn) return 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ in new Array(10).fill(null)) {
      this.device.write(BATTERY_LEVEL_PACKET);

      const buffer = this.device.readTimeout(1000);

      try {
        const event = this.getEventFromBuffer(buffer);

        if (event === "batteryLevel") {
          return buffer[BATTERY_LEVEL_INDEX];
        }
      } catch (error) {
        continue;
      }

      await this.delay(1000);
    }
  }

  getEventFromBuffer(buffer: number[]): DeviceEvent {
    if (buffer.length == 0) {
      throw new NoResponse();
    }

    if (buffer.length == 2) {
      const event = deviceEvents.get(buffer.join());

      if (event !== "powerOn" && event !== "powerOff") {
        throw new UnknownResponse();
      }

      return event;
    }

    const prefix = buffer.slice(0, 5).join();

    const event = deviceEvents.get(prefix);

    if (!event) {
      throw new UnknownResponse();
    }

    return event;
  }

  updateSelfFromEvent(event: DeviceEvent) {
    switch (event) {
      case "charging":
        this.isCharging = true;
        break;
      case "stoppedCharging":
        this.isCharging = false;
        break;
      case "muted":
        this.isMuted = true;
        break;
      case "stoppedMuted":
        this.isMuted = false;
        break;
      case "micDisconnected":
        this.isMicConnected = false;
        break;
      case "micConnected":
        this.isMicConnected = true;
        break;
      case "powerOff":
        this.isHeadsetOn = false;
        break;
      case "powerOn":
        this.isHeadsetOn = true;
        break;
      default:
        break;
    }
  }

  close() {
    this.device.close();
  }
}
