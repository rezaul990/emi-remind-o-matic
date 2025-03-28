
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PaymentReminder, PaymentStatus } from "@/types";
import { updateReminderStatus, deleteReminder } from "@/services/reminderService";
import { Check, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReminderTableProps {
  reminders: PaymentReminder[];
  onReminderUpdated: () => void;
  isAdmin?: boolean;
}

const ReminderTable = ({ reminders, onReminderUpdated, isAdmin = false }: ReminderTableProps) => {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: PaymentStatus) => {
    setLoadingId(id);
    try {
      await updateReminderStatus(id, newStatus);
      toast({
        title: "Status Updated",
        description: `Payment status updated to ${newStatus}`,
      });
      onReminderUpdated();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteReminder(id);
      toast({
        title: "Reminder Deleted",
        description: "Payment reminder has been deleted",
      });
      onReminderUpdated();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment reminder",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "collected":
        return <Badge className="bg-emi-green">Collected</Badge>;
      case "overdue":
        return <Badge className="bg-emi-red">Overdue</Badge>;
      default:
        return <Badge className="bg-emi-amber">Pending</Badge>;
    }
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Number</TableHead>
            <TableHead>Promised Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No payment reminders found
              </TableCell>
            </TableRow>
          ) : (
            reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell className="font-medium">{reminder.accountNumber}</TableCell>
                <TableCell>
                  {format(reminder.promisedDate, "MMM dd, yyyy")}
                  {reminder.status === "pending" && isOverdue(reminder.promisedDate) && (
                    <Badge className="ml-2 bg-emi-red">Overdue</Badge>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                <TableCell>{reminder.createdBy}</TableCell>
                <TableCell className="text-right">
                  {reminder.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleStatusChange(reminder.id, "collected")}
                      disabled={loadingId === reminder.id}
                    >
                      {loadingId === reminder.id ? "..." : <Check className="h-4 w-4 mr-1" />}
                      Mark Collected
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === reminder.id}
                      >
                        {deletingId === reminder.id ? "..." : <Trash className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this payment reminder? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(reminder.id)}
                          className="bg-emi-red hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReminderTable;
