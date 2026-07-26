"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, Truck, Building2, Shield, Ban, CheckCircle, UserX, UserCheck, Trash2, Loader2 } from "lucide-react";
import { getAdminUsers, suspendUser, unsuspendUser, changeUserRole, deleteUser } from "@/app/actions/admin";
import { useToast } from "@/components/providers/toast-provider";

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [userFilter, userSearch]);

  async function fetchUsers() {
    setIsLoading(true);
    const result = await getAdminUsers(userFilter, userSearch);
    if (result.data) setUsers(result.data);
    setIsLoading(false);
  }

  const handleSuspend = async (user: any) => {
    const reason = prompt(`Why are you suspending ${user.full_name || user.email}?`);
    if (!reason) return;
    const result = await suspendUser(user.id, reason);
    if (result.success) {
      addToast({ type: "success", title: "User Suspended", message: `${user.full_name || user.email} has been suspended.` });
      fetchUsers();
    } else {
      addToast({ type: "error", title: "Error", message: result.error });
    }
  };

  const handleUnsuspend = async (user: any) => {
    const result = await unsuspendUser(user.id);
    if (result.success) {
      addToast({ type: "success", title: "User Unsuspended", message: `${user.full_name || user.email} is now active.` });
      fetchUsers();
    } else {
      addToast({ type: "error", title: "Error", message: result.error });
    }
  };

  const handleChangeRole = async (user: any, newRole: string) => {
    if (!confirm(`Change ${user.full_name || user.email}'s role to ${newRole}?`)) return;
    const result = await changeUserRole(user.id, newRole);
    if (result.success) {
      addToast({ type: "success", title: "Role Updated", message: `Role changed to ${newRole}` });
      fetchUsers();
    } else {
      addToast({ type: "error", title: "Error", message: result.error });
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`⚠️ DELETE ${user.full_name || user.email}? This cannot be undone!`)) return;
    const result = await deleteUser(user.id);
    if (result.success) {
      addToast({ type: "success", title: "User Deleted", message: `${user.full_name || user.email} has been removed.` });
      fetchUsers();
    } else {
      addToast({ type: "error", title: "Error", message: result.error });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" placeholder="Search users by name or email..." value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-white text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "customer", "driver", "supplier", "admin"].map((filter) => (
            <button key={filter} onClick={() => setUserFilter(filter)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${userFilter === filter ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
            >{filter}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">State</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleConfig: Record<string, { icon: any; color: string }> = {
                    customer: { icon: User, color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                    driver: { icon: Truck, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
                    supplier: { icon: Building2, color: "bg-green-500/10 text-green-400 border-green-500/30" },
                    admin: { icon: Shield, color: "bg-red-500/10 text-red-400 border-red-500/30" },
                  };
                  const role = roleConfig[user.role] || roleConfig.customer;
                  const RoleIcon = role.icon;
                  
                  return (
                    <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{user.full_name || "No Name"}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium capitalize border ${role.color}`}>
                          <RoleIcon className="w-3 h-3" /> {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 hidden md:table-cell">{user.state || "-"}</td>
                      <td className="p-4 hidden md:table-cell">
                        {user.is_suspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                            <Ban className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {user.is_suspended ? (
                            <button onClick={() => handleUnsuspend(user)} className="p-1.5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors" title="Unsuspend">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleSuspend(user)} className="p-1.5 hover:bg-yellow-500/10 text-yellow-400 rounded-lg transition-colors" title="Suspend">
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <select onChange={(e) => handleChangeRole(user, e.target.value)} value={user.role} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white">
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            <option value="supplier">Supplier</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => handleDelete(user)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users match your filters</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}