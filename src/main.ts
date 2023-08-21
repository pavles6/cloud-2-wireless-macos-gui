import { app, Menu, MenuItem, Tray } from "electron";
import * as path from "path";
import Device from "./device";
import {
  labelGetters,
  trayIconPaths,
  trayMenuTemplate,
} from "./constants/tray";
import { FIVE_MINUTES_IN_MS } from "./constants/other";

app.setLoginItemSettings({
  openAtLogin: true,
});

let tray: Tray | null = null;

let device: Device;

function refreshTrayData(app: Electron.App, tray: Tray) {
  let updatedItems: MenuItem[];

  let trayTooltip: string;

  const appQuitHandler = () => {
    app.quit();
  };

  if (!device.isHeadsetOn) {
    updatedItems = [
      {
        label: labelGetters.get("status")(device),
        type: "normal",
        id: "status",
      },
      { type: "separator" },
      {
        label: "Exit",
        type: "normal",
        id: "exit",
        click: appQuitHandler,
      },
    ] as MenuItem[];

    trayTooltip = "HyperX Cloud II Wireless: Not connected";
  } else {
    updatedItems = structuredClone(trayMenuTemplate as MenuItem[]).map(
      (item) => {
        if (item.id && item.id !== "exit") {
          item.label = labelGetters.get(item.id)(device);
        }

        if (item.id === "exit") {
          item.click = appQuitHandler;
        }

        return item;
      }
    );

    trayTooltip = `HyperX Cloud II Wireless: Connected, ${device.batteryLevel}% battery remaining`;
  }

  tray.setToolTip(trayTooltip);

  tray.setContextMenu(Menu.buildFromTemplate(updatedItems as MenuItem[]));

  const batteryStatus = getBatteryLevelStatus(device);

  updateTrayIcon(tray, batteryStatus);
}

function updateTrayIcon(tray: Tray, key: keyof typeof trayIconPaths) {
  tray.setImage(path.join(__dirname, trayIconPaths[key]));
}

function getBatteryLevelStatus(device: Device): keyof typeof trayIconPaths {
  if (device.isHeadsetOn) {
    if (device.batteryLevel >= 50) {
      return "battery-high";
    }
    if (device.batteryLevel >= 10) {
      return "battery-medium";
    }
    return "battery-low";
  }
  return "no-device";
}

let batteryLevelUpdateInterval: NodeJS.Timeout | undefined = undefined;

app.dock.hide();
app.whenReady().then(async () => {
  tray = new Tray(
    path.join(__dirname, "../assets/icons/no-device/waveform.png")
  );

  device = new Device();

  try {
    await device.pair();
  } catch (error) {
    device.isHeadsetOn = false;
  }

  device.on("refresh-gui", () => {
    refreshTrayData(app, tray);
  });

  refreshTrayData(app, tray);

  batteryLevelUpdateInterval = setInterval(() => {
    device.updateBatteryLevel();
    console.log("Updated battery level ", device.batteryLevel);
  }, FIVE_MINUTES_IN_MS);
});

app.on("before-quit", () => {
  if (device) device.close();
  if (batteryLevelUpdateInterval) clearInterval(batteryLevelUpdateInterval);
});
