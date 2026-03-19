import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="font-bold text-lg">Grievance System</h1>
      <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
        Logout
      </button>
    </div>
  );
}