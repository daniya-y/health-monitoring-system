import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Activity, Thermometer, Heart } from "lucide-react";
import { supabase } from "./lib/supabase";
import type { Database } from "./lib/database.types";

type HealthData = Database["public"]["Tables"]["health_data"]["Row"];

function getHealthStatus(
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

function App() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
    // Set up real-time subscription
    const subscription = supabase
      .channel("health_data_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "health_data",
        },
        (payload) => {
          console.log("Received real-time update:", payload);
          setHealthData((current) => [payload.new as HealthData, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchHealthData() {
    try {
      console.log("Fetching health data...");
      const { data, error } = await supabase
        .from("health_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        throw error;
      }

      console.log("Fetched data:", data);
      setHealthData(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching health data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Health Monitoring System
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">Error: {error}</div>
            ) : healthData.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No health data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          Heart Rate
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SpO2
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          Temperature
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Health Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {healthData.map((data) => {
                      const healthStatus = getHealthStatus(
                        data.heart_rate,
                        data.spo2,
                        data.body_temperature
                      );
                      return (
                        <tr key={data.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {data.student_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.heart_rate} BPM
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.spo2}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.body_temperature}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${healthStatus.color}`}
                            >
                              {healthStatus.icon} {healthStatus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(data.created_at), "PPpp")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
