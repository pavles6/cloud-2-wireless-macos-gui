import { app, Menu, MenuItem, Tray } from "electron";
import * as path from "path";
import Device from "./device";
import { trayIconPaths, trayMenuTemplate } from "./constants/tray";
import { FIVE_MINUTES_IN_MS } from "./constants/other";
import { getBatteryLevelStatus } from "./utils/getBatteryStatusByLevel";
import { getBatteryLabel } from "./utils/getBatteryLabel";
import { getStatusLabel } from "./utils/getBatteryStatusLabel";
import { getTrayTooltip } from "./utils/getTrayTooltip";

app.setLoginItemSettings({
  openAtLogin: true,
});

app.dock.hide();

let tray: Tray | null = null;

let device: Device;

let batteryLevelUpdateInterval: NodeJS.Timeout | undefined = undefined;

let lastCheckedDate: Date | undefined = undefined;

function refreshTrayData(app: Electron.App, tray: Tray) {
  let trayItems: MenuItem[] = structuredClone(trayMenuTemplate) as MenuItem[];

  const appQuitHandler = () => {
    app.quit();
  };

  const restartAppHandler = () => {
    app.relaunch();
    app.quit();
  };

  if (device.batteryLevel == -1) {
    trayItems = trayItems.filter(
      (item: MenuItem) => item.id !== "battery" && item.id !== "battery_update"
    );
  }

  trayItems.find((item: MenuItem) => item.id == "status").label =
    getStatusLabel(lastCheckedDate, device);

  const batteryTrayItem = trayItems.find(
    (item: MenuItem) => item.id == "battery"
  );

  if (batteryTrayItem) batteryTrayItem.label = getBatteryLabel(device);

  const batteryUpdateTrayItem = trayItems.find(
    (item: MenuItem) => item.id == "battery_update"
  );

  if (batteryUpdateTrayItem)
    batteryUpdateTrayItem.click = () => updateTrayBatteryPercentage(device);

  trayItems.find((item: MenuItem) => item.id == "exit").click = appQuitHandler;

  trayItems.find((item: MenuItem) => item.id == "restart").click =
    restartAppHandler;

  tray.setToolTip(getTrayTooltip(device.isHeadsetOn, device.batteryLevel));

  tray.setContextMenu(Menu.buildFromTemplate(trayItems as MenuItem[]));
}

function updateTrayIcon(tray: Tray, key: keyof typeof trayIconPaths) {
  tray.setImage(path.join(__dirname, trayIconPaths[key]));
}

async function updateTrayBatteryPercentage(device: Device) {
  await device.getBatteryLevel();
  lastCheckedDate = new Date();
  updateTrayIcon(tray, getBatteryLevelStatus(device.batteryLevel));
}

app.whenReady().then(async () => {
  tray = new Tray(
    path.join(__dirname, "../assets/icons/no-device/waveform.png")
  );

  device = new Device();

  await updateTrayBatteryPercentage(device);

  refreshTrayData(app, tray);

  tray.on("click", () => {
    refreshTrayData(app, tray);
  });

  batteryLevelUpdateInterval = setInterval(async () => {
    await updateTrayBatteryPercentage(device);
  }, FIVE_MINUTES_IN_MS);
});

app.on("before-quit", () => {
  if (batteryLevelUpdateInterval) clearInterval(batteryLevelUpdateInterval);
});
