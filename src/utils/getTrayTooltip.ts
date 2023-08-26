export function getTrayTooltip(isHeadsetOn: boolean, batteryLevel: number) {
  if (!isHeadsetOn && batteryLevel == -1)
    return "HyperX Cloud II Wireless: Not connected";

  return `HyperX Cloud II Wireless: ${batteryLevel}% remaining`;
}
