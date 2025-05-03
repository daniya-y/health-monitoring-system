export function getHealthStatus(
  heartRate: number,
  spo2: number,
  temperature: number
): {
  status: string;
  icon: string;
  color: string;
} {
  // Critical condition checks
  if (
    heartRate < 40 ||
    heartRate > 130 ||
    spo2 < 90 ||
    temperature > 39.5 ||
    temperature < 35.0
  ) {
    return {
      status: "Critical Condition",
      icon: "🚨",
      color: "text-red-600",
    };
  }

  // Less good condition checks
  if (
    heartRate < 50 ||
    heartRate > 120 ||
    (spo2 >= 90 && spo2 < 95) ||
    temperature < 36.0 ||
    temperature > 37.5
  ) {
    return {
      status: "Less Good Condition",
      icon: "⚠️",
      color: "text-yellow-600",
    };
  }

  // Good condition
  return {
    status: "Good Condition",
    icon: "✅",
    color: "text-green-600",
  };
}
