
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ArrowDownUp,
} from "lucide-react";
import ReminderTable from "@/components/ReminderTable";
import AddReminderModal from "@/components/AddReminderModal";
import { getFilteredReminders } from "@/services/reminderService";
import { PaymentFilter } from "@/types";
import { Navigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  const { currentUser, logout, loading } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<PaymentFilter>("upcoming");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    data: reminders,
    isLoading: isRemindersLoading,
    refetch,
  } = useQuery({
    queryKey: ["reminders", currentFilter],
    queryFn: () => getFilteredReminders(currentFilter),
    enabled: !!currentUser,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleAddReminder = () => {
    setIsAddModalOpen(true);
  };

  const handleReminderAdded = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 sm:truncate">EMI Payment Reminders</h1>
            <p className="mt-1 text-sm text-gray-500">{currentUser?.email}</p>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Collapsible open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="px-2">
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute right-4 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-10">
                <div className="flex flex-col">
                  <Button variant="ghost" onClick={handleAddReminder} className="justify-start">
                    <Plus className="h-4 w-4 mr-2" /> Add Reminder
                  </Button>
                  <Button variant="ghost" onClick={() => logout()} className="justify-start text-red-600">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Button onClick={handleAddReminder}>
              <Plus className="h-4 w-4 mr-2" /> Add Reminder
            </Button>
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card onClick={() => setCurrentFilter("upcoming")} 
                className={`cursor-pointer ${currentFilter === "upcoming" ? "border-emi-green border-2" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-emi-amber mr-2" />
                <span className="text-2xl font-bold">
                  {reminders?.filter(r => r.status === "pending").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setCurrentFilter("overdue")} 
                className={`cursor-pointer ${currentFilter === "overdue" ? "border-emi-red border-2" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Overdue Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-emi-red mr-2" />
                <span className="text-2xl font-bold">
                  {reminders?.filter(r => r.status === "overdue").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setCurrentFilter("collected")} 
                className={`cursor-pointer ${currentFilter === "collected" ? "border-emi-green border-2" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Collected Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emi-green mr-2" />
                <span className="text-2xl font-bold">
                  {reminders?.filter(r => r.status === "collected").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={currentFilter} onValueChange={(value) => setCurrentFilter(value as PaymentFilter)}>
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="collected">Collected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Payments</h2>
            <Separator />
            {isRemindersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReminderTable
                reminders={reminders || []}
                onReminderUpdated={refetch}
              />
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <h2 className="text-xl font-semibold">Overdue Payments</h2>
            <Separator />
            {isRemindersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReminderTable
                reminders={reminders || []}
                onReminderUpdated={refetch}
              />
            )}
          </TabsContent>

          <TabsContent value="collected" className="space-y-4">
            <h2 className="text-xl font-semibold">Collected Payments</h2>
            <Separator />
            {isRemindersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReminderTable
                reminders={reminders || []}
                onReminderUpdated={refetch}
              />
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <h2 className="text-xl font-semibold">All Payments</h2>
            <Separator />
            {isRemindersLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReminderTable
                reminders={reminders || []}
                onReminderUpdated={refetch}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onReminderAdded={handleReminderAdded}
      />
    </div>
  );
};

export default Index;
