import { useState } from "react";
import CredentialModal from "./CredentialModal";
import axios from "axios";
import { toast } from "react-hot-toast";

let API_URL = import.meta.env.VITE_API_URL;
let API_ADMIN_ROUTE = import.meta.env.VITE_API_ADMIN_ROUTE;

const EmployeeAccountTable = ({ employees, refresh }) => {

  const [selected, setSelected] = useState(null);

  const updateStatus = async (id) => {
    try {
     
      let response = await axios.put(
        `${API_URL}${API_ADMIN_ROUTE}/users/toggleActiveStatus/${id}`,
        {},
        { withCredentials: true }
      );
      
      toast.success("Employee status updated");
      refresh();

    } catch (error) {
      
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="mt-4 bg-white shadow rounded-xl overflow-hidden">

      <table className="w-full table-fixed">

        {/* HEADER */}
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="px-4 py-3 text-left w-[18%]">Name</th>
            <th className="px-4 py-3 text-left w-[22%]">Email</th>
            <th className="px-4 py-3 text-left w-[12%]">Role</th>
            <th className="px-4 py-3 text-left w-[15%]">City</th>
            <th className="px-4 py-3 text-left w-[15%]">Zone</th>
            <th className="px-4 py-3 text-center w-[10%]">Status</th>
            <th className="px-4 py-3 text-center w-[8%]">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="text-sm">
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr
                key={emp._id}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* NAME */}
                <td className="px-4 py-3 font-medium">
                  {emp.fullName}
                </td>

                {/* EMAIL */}
                <td className="px-4 py-3 truncate">
                  {emp.userID?.email || "-"}
                </td>

                {/* ROLE */}
                <td className="px-4 py-3 capitalize">
                  {emp.role}
                </td>

                {/* CITY */}
                <td className="px-4 py-3">
                  {emp.city?.name || "-"}
                </td>

                {/* ZONE */}
                <td className="px-4 py-3">
                  {emp.zone?.name || "Null"}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => updateStatus(emp.userID._id)}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      emp.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                {/* ACTION */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelected(emp)}
                    className="text-blue-600 hover:underline"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-6 text-gray-500"
              >
                No employees found
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* MODAL */}
      {selected && (
        <CredentialModal
          employee={selected}
          onClose={() => setSelected(null)}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default EmployeeAccountTable;