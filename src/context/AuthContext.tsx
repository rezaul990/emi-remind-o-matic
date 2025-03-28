
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut as authSignOut, 
  User
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const signInWithGoogle = async () => {
    try {
      console.log("Attempting to sign in with Google...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Sign in successful:", result.user.displayName);
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
    loading,
    signInWithGoogle,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
