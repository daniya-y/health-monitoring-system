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
    case "Good Condition":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold">Reason for Good Condition:</p>
          <ul>
            <li>All vital signs are within the optimal range.</li>
            <li>Heart Rate: 60-100 BPM</li>
            <li>SpO₂: ≥ 95%</li>
            <li>Body Temperature: 36.1 - 37.5°C</li>
          </ul>
        </div>
      );
      break;
    case "Less Good Condition":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold">Reasons for Less Good Condition:</p>
          <p className="mb-2">
            One or more vital signs are slightly outside the optimal range.
            Monitoring is advised.
          </p>
          <ul>
            <li>Heart Rate: &lt; 50 or &gt; 120 BPM</li>
            <li>SpO₂: 90-94%</li>
            <li>Body Temperature: &lt; 36.0°C or &gt; 37.5°C</li>
          </ul>
        </div>
      );
      break;
    case "Critical Condition":
      modalContent = (
        <div>
          <p className="mb-2 font-semibold text-red-600">
            Critical Condition Detected!
          </p>
          <p className="mb-2">Immediate medical attention is required.</p>
          <ul>
            <li>Heart Rate: &lt; 40 or &gt; 130 BPM</li>
            <li>SpO₂: &lt; 90%</li>
            <li>Body Temperature: &gt; 39.5°C or &lt; 35.0°C</li>
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
