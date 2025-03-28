
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { PaymentReminder, PaymentStatus } from "../types";

const REMINDERS_COLLECTION = 'paymentReminders';

export const addReminder = async (reminder: Omit<PaymentReminder, 'id' | 'updatedAt' | 'createdAt'>): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), {
      ...reminder,
      promisedDate: Timestamp.fromDate(reminder.promisedDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding reminder: ", error);
    throw error;
  }
};

export const getReminders = async (): Promise<PaymentReminder[]> => {
  try {
    const q = query(collection(db, REMINDERS_COLLECTION), orderBy('promisedDate'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        accountNumber: data.accountNumber,
        promisedDate: data.promisedDate.toDate(),
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        createdBy: data.createdBy,
      } as PaymentReminder;
    });
  } catch (error) {
    console.error("Error getting reminders: ", error);
    throw error;
  }
};

export const updateReminderStatus = async (id: string, status: PaymentStatus): Promise<void> => {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, id);
    await updateDoc(reminderRef, {
      status: status,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error("Error updating reminder status: ", error);
    throw error;
  }
};

export const deleteReminder = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REMINDERS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting reminder: ", error);
    throw error;
  }
};

export const getFilteredReminders = async (filter: string): Promise<PaymentReminder[]> => {
  try {
    let q;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(filter) {
      case 'upcoming':
        q = query(
          collection(db, REMINDERS_COLLECTION),
          where('promisedDate', '>=', Timestamp.fromDate(today)),
          where('status', '==', 'pending'),
          orderBy('promisedDate')
        );
        break;
      case 'overdue':
        q = query(
          collection(db, REMINDERS_COLLECTION),
          where('status', '==', 'overdue'),
          orderBy('promisedDate')
        );
        break;
      case 'collected':
        q = query(
          collection(db, REMINDERS_COLLECTION),
          where('status', '==', 'collected'),
          orderBy('promisedDate', 'desc')
        );
        break;
      default:
        q = query(collection(db, REMINDERS_COLLECTION), orderBy('promisedDate'));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as {
        accountNumber: string;
        promisedDate: Timestamp;
        status: PaymentStatus;
        createdAt: Timestamp;
        updatedAt: Timestamp;
        createdBy: string;
      };
      
      return {
        id: doc.id,
        accountNumber: data.accountNumber,
        promisedDate: data.promisedDate.toDate(),
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        createdBy: data.createdBy,
      } as PaymentReminder;
    });
  } catch (error) {
    console.error("Error getting filtered reminders: ", error);
    throw error;
  }
};
