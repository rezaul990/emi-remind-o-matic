
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  ArrowLeft 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFilteredReminders } from "@/services/reminderService";
import ReminderTable from "@/components/ReminderTable";
import { Link } from "react-router-dom";

const Admin = () => {
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"reminders" | "users">("reminders");

  const {
    data: reminders,
    isLoading: isRemindersLoading,
    refetch,
  } = useQuery({
    queryKey: ["reminders", "all"],
    queryFn: () => getFilteredReminders("all"),
    enabled: !!currentUser,
  });

  // Placeholder for user data - in a real app, you would fetch this from Firestore
  const mockUsers = [
    { id: "1", email: "user1@example.com", isAdmin: false },
    { id: "2", email: "admin@example.com", isAdmin: true },
    { id: "3", email: "user2@example.com", isAdmin: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:truncate flex items-center">
                <Shield className="h-5 w-5 mr-2 text-emi-blue" /> 
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">{userData?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card onClick={() => setActiveTab("reminders")} 
                className={`cursor-pointer ${activeTab === "reminders" ? "border-emi-blue border-2" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">All Payment Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{reminders?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setActiveTab("users")} 
                className={`cursor-pointer ${activeTab === "users" ? "border-emi-blue border-2" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-emi-blue mr-2" />
                <span className="text-2xl font-bold">{mockUsers.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Payment Reminders</h2>
            <Separator />
            {isRemindersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReminderTable
                reminders={reminders || []}
                onReminderUpdated={refetch}
                isAdmin={true}
              />
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Separator />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            User
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
