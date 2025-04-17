import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function NavigationBar() {
  const { isAuthenticated } = useAuth();
  const { logout } = useAuth(); // Uncomment if you want to use the logout function
  const navigate = useNavigate(); // Use the useNavigate hook

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/live"
        className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-gray-700 hover:text-gray-900 hover:underline hover:underline-offset-4 hover:decoration-4"
      >
        Live
      </Link>
      <Link
        to="/Dashboard"
        className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-gray-700 hover:text-gray-900 hover:underline hover:underline-offset-4 hover:decoration-4"
      >
        Dashboard
      </Link>
      <Link
        to="/Users"
        className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-gray-700 hover:text-gray-900 hover:underline hover:underline-offset-4 hover:decoration-4"
      >
        Users
      </Link>
      <button
        className="flex items-center gap-2 px-2 py-1 rounded-md font-semibold text-gray-700 hover:bg-gray-900 hover:text-white"
        //onClick={logout}
        onClick={() => {
          if (isAuthenticated) {
            logout(); // Call the logout function from AuthContext
          } else {
            navigate("/login"); // Redirect to login page if not authenticated
          }
        }}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </div>
  );
}

export default NavigationBar;
