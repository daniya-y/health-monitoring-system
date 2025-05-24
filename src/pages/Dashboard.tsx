import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  Thermometer,
  Heart,
  Pencil,
  Trash2,
  X,
  UserPlus,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import NavigationBar from "../components/NavigationBar";
import { getHealthStatus } from "../utils/healthUtils";
import ConditionInfoModal from "../components/ConditionInfoModal";

type HealthData = Database["public"]["Tables"]["health_data"]["Row"];

interface EditModalProps {
  data: HealthData;
  onClose: () => void;
  onSave: (updatedData: HealthData) => Promise<void>;
}

function EditModal({ data, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    student_id: data.student_id,
    heart_rate: data.heart_rate,
    spo2: data.spo2,
    body_temperature: data.body_temperature,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...data, ...formData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Health Data</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIM
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_id: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Detak Jantung (BPM)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.heart_rate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heart_rate: parseFloat(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Saturasi Oksigen (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.spo2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    spo2: parseFloat(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Suhu Tubuh (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.body_temperature}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    body_temperature: parseFloat(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<HealthData | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("health_data")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHealthData(healthData.filter((data) => data.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record");
    }
  };

  const handleEdit = async (updatedData: HealthData) => {
    try {
      const { error } = await supabase
        .from("health_data")
        .update({
          student_id: updatedData.student_id,
          heart_rate: updatedData.heart_rate,
          spo2: updatedData.spo2,
          body_temperature: updatedData.body_temperature,
        })
        .eq("id", updatedData.id);

      if (error) throw error;

      setHealthData(
        healthData.map((data) =>
          data.id === updatedData.id ? updatedData : data
        )
      );
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Student Health Monitoring
              </h1>
            </div>
            <NavigationBar />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-end items-center mb-2">
            <Link
              to="/users"
              className="flex items-center gap-1 px-4 py-2 rounded-md font-semibold text-gray-700 shadow bg-gray-50 border-gray-100 hover:bg-gray-900 hover:text-white"
            >
              <UserPlus className="h-5 w-5" />
              Tambah User
            </Link>
          </div>
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
                        NIM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          Detak Jantung
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saturasi Oksigen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          Suhu Tubuh
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kondisi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingData(data)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(data.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Condition Info Modal */}
                <ConditionInfoModal
                  isOpen={isConditionInfoModalOpen}
                  onClose={handleCloseConditionInfoModal}
                  healthStatus={currentHealthStatus}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {editingData && (
        <EditModal
          data={editingData}
          onClose={() => setEditingData(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

export default Dashboard;
