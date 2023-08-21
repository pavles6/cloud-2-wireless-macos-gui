import * as hid from "node-hid";
import { UnknownResponse } from "./hid-errors/UnknownResponse";
import { NoResponse } from "./hid-errors/NoResponse";
import { HeadsetOff } from "./hid-errors/HeadsetOff";
import { HIDError } from "./hid-errors/HIDError";
import { EventEmitter } from "events";

const VID = 1008;
const PID = 395;

const BATTERY_LEVEL_INDEX = 7;
const BATTERY_LEVEL_PREFIX = [6, 255, 187, 2, 0].join();
const NOW_CHARGING = [6, 255, 187, 3, 1].join();
const STOPPED_CHARGING = [6, 255, 187, 3, 0].join();
const NOW_MUTED = [6, 255, 187, 32, 1].join();
const STOPPED_MUTED = [6, 255, 187, 32, 0].join();
const NOW_MIC_DISCONNECTED = [6, 255, 187, 8, 0].join();
const NOW_MIC_CONNECTED = [6, 255, 187, 8, 1].join();
const POWER_OFF = [100, 3].join();
const POWER_ON = [100, 1].join();

const BATTERY_LEVEL_PACKET = new Array(20).fill(0);
BATTERY_LEVEL_PACKET[0] = 6;
BATTERY_LEVEL_PACKET[1] = 255;
BATTERY_LEVEL_PACKET[2] = 187;
BATTERY_LEVEL_PACKET[3] = 2;

type DeviceEvent =
  | "batteryLevel"
  | "charging"
  | "stoppedCharging"
  | "muted"
  | "stoppedMuted"
  | "micDisconnected"
  | "micConnected"
  | "powerOff"
  | "powerOn";

const deviceEvents = new Map();

deviceEvents.set(BATTERY_LEVEL_PREFIX, "batteryLevel");
deviceEvents.set(NOW_CHARGING, "charging");
deviceEvents.set(STOPPED_CHARGING, "stoppedCharging");
deviceEvents.set(NOW_MUTED, "muted");
deviceEvents.set(STOPPED_MUTED, "stoppedMuted");
deviceEvents.set(NOW_MIC_DISCONNECTED, "micDisconnected");
deviceEvents.set(NOW_MIC_CONNECTED, "micConnected");
deviceEvents.set(POWER_OFF, "powerOff");
deviceEvents.set(POWER_ON, "powerOn");

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
        (device) => device.productId === PID && device.vendorId === VID
      )[0];

    this.device = new hid.HID(deviceInfo.path);

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
        if (error.type == "noResponse") {
          this.isHeadsetOn = false;
          throw new HeadsetOff();
        } else {
          continue;
        }
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
