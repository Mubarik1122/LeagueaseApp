import { useState } from "react";
import { User, Mail, Key, Shield } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

export default function Account() {

  const { user, logout } = useAuthContext();
  const [formData, setFormData] = useState({
    firstName: user.firstName || "John",
    lastName: user.lastName || "Doe",
    email: user.email || "example@gmail.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add validation and API call
    console.log("Submitted data:", formData);
    alert("Account information updated successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <User size={24} /> My Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
              />
              <User
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
              />
              <User
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
            />
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Shield size={20} /> Change Password
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
              />
              <Key
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
              />
              <Key
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-10 py-2 focus:ring-2 focus:ring-[#00ade5]"
              />
              <Key
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-[#00ade5] text-white px-6 py-2 rounded-md hover:bg-[#009ccc] transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
