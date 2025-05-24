interface ConditionInfoModal {
  isOpen: boolean;
  onClose: () => void;
  healthStatus: {
    status: string;
    icon: string;
    color: string;
  };
}

function ConditionModal({ isOpen, onClose, healthStatus }: ConditionInfoModal) {
  console.log("isOpen:", isOpen);
  console.log("healthStatus:", healthStatus);

  if (!isOpen) {
    return null;
  }

  let modalContent;

  switch (healthStatus.status) {
    case "Kondisi Baik":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold">Alasan Kondisi Baik:</p>
          <ul>
            <li>Semua tanda vital berada dalam kisaran optimal.</li>
            <li>Detak Jantung: 60-100 BPM</li>
            <li>Saturasi Oksigen: ≥ 95%</li>
            <li>Suhu Tubuh: 36.1 - 37.5°C</li>
          </ul>
        </div>
      );
      break;
    case "Kondisi Kurang Baik":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold">Alasan Kondisi Kurang Baik:</p>
          <p className="mb-2">
          Satu atau beberapa tanda vital berada sedikit di luar kisaran optimal.
          Pemantauan dianjurkan.
          </p>
          <ul>
            <li>Detak Jantung: &lt; 50 atau &gt; 120 BPM</li>
            <li>Saturasi Oksigen: 90-94%</li>
            <li>Suhu Tubuh: &lt; 36.0°C atau &gt; 37.5°C</li>
          </ul>
        </div>
      );
      break;
    case "Kondisi Perlu Perhatian":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold text-red-600">
            Terdeteksi Kondisi Perlu Perhatian!
          </p>
          <p className="mb-2">Perhatian medis segera diperlukan.</p>
          <ul>
            <li>Detak Jantung: &lt; 40 atau &gt; 130 BPM</li>
            <li>Saturasi Oksigen: &lt; 90%</li>
            <li>Suhu Tubuh: &gt; 39.5°C atau &lt; 35.0°C</li>
          </ul>
        </div>
      );
      break;
    default:
      modalContent = <p>No specific information available.</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg text-left w-1/2 h-auto max-h-3/4 overflow-y-auto">
        {modalContent}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default ConditionModal;