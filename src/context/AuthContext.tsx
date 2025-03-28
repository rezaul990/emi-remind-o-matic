
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut as authSignOut, 
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";

interface UserData {
  isAdmin: boolean;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Function to fetch or create user data
  const fetchOrCreateUserData = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // User exists in Firestore, get their data
        const userData = userSnap.data() as UserData;
        setUserData(userData);
        return userData;
      } else {
        // Create new user in Firestore
        const newUserData: UserData = {
          isAdmin: false, // Default to non-admin
          email: user.email || '',
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
        return newUserData;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchOrCreateUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const signInWithGoogle = async () => {
    try {
      console.log("Attempting to sign in with Google...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Sign in successful:", result.user.displayName);
      
      // Fetch or create user data after sign in
      await fetchOrCreateUserData(result.user);
      
      toast({
        title: "Success!",
        description: `Welcome ${result.user.displayName || ""}! You have successfully logged in.`,
      });
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      let errorMessage = "Please try again later.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase authentication is not configured properly for this domain.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked. Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was canceled. Please try again.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Error signing in",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const logout = async () => {
    try {
      await authSignOut(auth);
      setUserData(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const value = {
    currentUser,
    userData,
    loading,
    isAdmin: userData?.isAdmin || false,
    signInWithGoogle,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
