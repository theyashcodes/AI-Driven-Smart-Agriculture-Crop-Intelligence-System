"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_approved: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        if (res.status === 401 || res.status === 403) {
          router.push("/");
        } else {
          setError("Failed to fetch users");
        }
      }
    } catch (err) {
      setError("Network error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  const handleApprove = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/auth/users/${userId}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        setError("Failed to approve user");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <TubesBackground>
      <div className="flex min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
             <p className="text-gray-400 mt-1">Manage users and permissions</p>
          </div>
          <Link href="/" className="bg-gray-900/60 backdrop-blur-lg hover:bg-gray-800/60 text-gray-300 border border-white/10 px-6 py-2.5 rounded-xl font-semibold transition-colors">
            Back to Dashboard
          </Link>
        </header>

        {error && <div className="bg-red-950/60 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium border border-red-500/30">{error}</div>}

        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-gray-800/40">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="capitalize">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!user.is_approved && (
                      <button onClick={() => handleApprove(user.id)} className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm">
                        Approve User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found or loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      </div>
    </TubesBackground>
  );
}
