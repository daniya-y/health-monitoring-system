import { useEffect, useState } from "react";
import { Activity, Heart, Info, Thermometer } from "lucide-react";
import { format } from "date-fns";
import GaugeChart from "react-gauge-chart";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import NavigationBar from "../components/NavigationBar";
import ConditionInfoModal from "../components/ConditionInfoModal";
import { getHealthStatus } from "../utils/healthUtils";

type HealthData = Database["public"]["Tables"]["health_data"]["Row"];
type Student = Database["public"]["Tables"]["students"]["Row"];

function Live() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConditionInfoModalOpen, setIsConditionInfoModalOpen] =
    useState(false);
  const [currentHealthStatus, setCurrentHealthStatus] = useState({
    status: "Less good", // Example initial status
    icon: "✅",
    color: "text-red-500",
  });

  const handleCloseConditionInfoModal = () => {
    setIsConditionInfoModalOpen(false);
  };

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
        async (payload) => {
          console.log("Received real-time update:", payload);
          const newData = payload.new as HealthData;
          setHealthData((current) => {
            const updatedData = [newData, ...current].slice(0, 5);
            return updatedData;
          });
          await fetchStudentInfo(newData.student_id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchStudentInfo(studentId: string) {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student info:", error);
    }
  }

  async function fetchHealthData() {
    try {
      console.log("Fetching health data...");
      const { data, error } = await supabase
        .from("health_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        throw error;
      }

      console.log("Fetched data:", data);
      if (data && data.length > 0) {
        setHealthData(data);
        await fetchStudentInfo(data[0].student_id);
      }
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

  const latestData = healthData[0];
  const healthStatus = latestData
    ? getHealthStatus(
        latestData.heart_rate,
        latestData.spo2,
        latestData.body_temperature
      )
    : null;

  // Calculate gauge percentages based on health ranges
  const getHeartRatePercentage = (hr: number) => {
    if (hr <= 40) return 0;
    if (hr <= 50) return 0.2;
    if (hr > 50 && hr < 120) return (1 / 350) * hr + 9 / 35; // normal condition gauge fix
    if (hr <= 120) return 0.6;
    if (hr <= 130) return 0.8;
    return 1;
  };

  const getSpo2Percentage = (spo2: number) => {
    if (spo2 < 90) return 0.2;
    if (spo2 < 95) return 0.5;
    return (85 + 0.15 * spo2) / 100; // normal condition gauge fix
  };

  const getTemperaturePercentage = (temp: number) => {
    if (temp <= 35.0) return 0;
    if (temp <= 35.9) return 0.2;
    if (temp >= 36.0) return (2 / 15) * temp - 22 / 5; // normal condition gauge fix
    if (temp >= 37.5) return 0.6;
    if (temp >= 39.5) return 0.8;
    return 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Live Health Monitoring
              </h1>
            </div>
            <NavigationBar />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">Error: {error}</div>
        ) : healthData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No health data available
          </div>
        ) : (
          <>
            {/* Latest Record Info */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {student?.name || "Loading..."}
                </h2>
                <p className="text-lg text-gray-600">
                  Student ID: {student?.student_id || "Loading..."}
                </p>
                {healthStatus && (
                  <div className="flex items-center justify-center gap-x-2 mt-2">
                    <p className={`text-lg font-medium  ${healthStatus.color}`}>
                      {healthStatus.icon} {healthStatus.status}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentHealthStatus(healthStatus);
                        setIsConditionInfoModalOpen(true);
                      }}
                    >
                      <Info className="h-4 w-4 mt-1 text-slate-500"></Info>
                    </button>
                  </div>
                )}
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Heart Rate Gauge */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Heart Rate
                  </h3>
                  <GaugeChart
                    id="heart-rate-gauge"
                    nrOfLevels={5}
                    colors={[
                      "#ef4444",
                      "#f59e0b",
                      "#22c55e",
                      "#f59e0b",
                      "#ef4444",
                    ]}
                    percent={
                      latestData
                        ? getHeartRatePercentage(latestData.heart_rate)
                        : 0
                    }
                    textColor="#374151"
                    hideText={true}
                  />
                  <p className="text-center text-xl font-bold mt-2">
                    {latestData?.heart_rate} BPM
                  </p>
                </div>

                {/* SpO2 Gauge */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-center mb-2">
                    SpO2 Level
                  </h3>
                  <GaugeChart
                    id="spo2-gauge"
                    nrOfLevels={3}
                    colors={["#ef4444", "#f59e0b", "#22c55e"]}
                    percent={
                      latestData ? getSpo2Percentage(latestData.spo2) : 0
                    }
                    textColor="#374151"
                    hideText={true}
                  />
                  <p className="text-center text-xl font-bold mt-2">
                    {latestData?.spo2}%
                  </p>
                </div>

                {/* Temperature Gauge */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
                    <Thermometer className="h-5 w-5 text-blue-500" />
                    Temperature
                  </h3>
                  <GaugeChart
                    id="temperature-gauge"
                    nrOfLevels={5}
                    colors={[
                      "#ef4444",
                      "#f59e0b",
                      "#22c55e",
                      "#f59e0b",
                      "#ef4444",
                    ]}
                    percent={
                      latestData
                        ? getTemperaturePercentage(latestData.body_temperature)
                        : 0
                    }
                    textColor="#374151"
                    hideText={true}
                  />
                  <p className="text-center text-xl font-bold mt-2">
                    {latestData?.body_temperature}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Condition Info Modal */}
            <ConditionInfoModal
              isOpen={isConditionInfoModalOpen}
              onClose={handleCloseConditionInfoModal}
              healthStatus={currentHealthStatus}
            />

            {/* History Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-x-2">
                            <span
                              className={`font-medium ${healthStatus.color}`}
                            >
                              {healthStatus.icon} {healthStatus.status}
                            </span>
                            <button
                              onClick={() => {
                                setCurrentHealthStatus(healthStatus);
                                setIsConditionInfoModalOpen(true);
                              }}
                            >
                              <Info className="h-3 w-3 text-slate-500"></Info>
                            </button>
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Live;
