export const trayIconPaths = {
  "no-device": "../assets/icons/no-device/waveform.png",
  "battery-very-high": "../assets/icons/battery-very-high/waveform.png",
  "battery-high": "../assets/icons/battery-high/waveform.png",
  "battery-medium": "../assets/icons/battery-medium/waveform.png",
  "battery-medium-low": "../assets/icons/battery-medium-low/waveform.png",
  "battery-low": "../assets/icons/battery-low/waveform.png",
  "battery-very-low": "../assets/icons/battery-very-low/waveform.png",
};

export const trayMenuTemplate = [
  {
    label: "",
    type: "normal",
    id: "status",
  },
  { type: "separator" },
  {
    label: "",
    type: "normal",
    id: "battery",
  },
  { type: "separator" },
  {
    label: "Update battery level",
    type: "normal",
    id: "battery_update",
    click: null,
  },
  {
    label: "Restart",
    type: "normal",
    id: "restart",
    click: null,
    accelerator: "CommandOrControl+R",
  },

  {
    label: "Quit",
    type: "normal",
    id: "exit",
    click: null,
    accelerator: "CommandOrControl+Q",
  },
] as unknown[];
