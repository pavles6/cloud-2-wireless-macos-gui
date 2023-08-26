import Device from "../device";

export function getStatusLabel(lastCheckedDate: Date, device: Device) {
  if (!device.isHeadsetOn && device.batteryLevel == -1) {
    return "Your headset is off.";
  }

  const rtf = new Intl.RelativeTimeFormat("en", {
    style: "long",
    numeric: "always",
  });

  const timeDistance = new Date(Date.now() - lastCheckedDate.getTime());

  return `Last checked ${
    timeDistance.getMinutes() > 0
      ? rtf.format(-timeDistance.getMinutes(), "minutes")
      : rtf.format(-timeDistance.getSeconds(), "seconds")
  }`;
}
