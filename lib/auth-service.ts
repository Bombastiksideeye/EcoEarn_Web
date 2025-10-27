import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: string;
  createdAt: any;
  setupBy: string;
}

class AuthService {
  private currentUser: User | null = null;
  private adminData: AdminUser | null = null;

  constructor() {
    // Auth state changes are now handled by the context
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; adminData?: AdminUser }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user exists in admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        // User is not an admin, sign them out
        await this.logout();
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }

      const adminData = adminDoc.data() as AdminUser;
      this.adminData = { ...adminData, uid: user.uid };
      
      return { success: true, adminData: this.adminData };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.adminData = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async fetchAdminData(uid: string): Promise<AdminUser | null> {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as AdminUser;
        this.adminData = { uid, ...adminData };
        return this.adminData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching admin data:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAdminData(): AdminUser | null {
    return this.adminData;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.adminData !== null;
  }

  isAdmin(): boolean {
    return this.adminData?.role === 'admin';
  }

  // Listen for auth state changes and return unsubscribe function
  onAuthStateChanged(callback: (user: User | null, adminData: AdminUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        // Fetch admin data when user is authenticated
        await this.fetchAdminData(user.uid);
        callback(user, this.adminData);
      } else {
        this.adminData = null;
        callback(null, null);
      }
    });
  }
}

export const authService = new AuthService();
