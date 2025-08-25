export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private user: User | null = null;
  private isLoading: boolean = false;
  
  async login(credentials: LoginCredentials): Promise<User> {
    this.isLoading = true;
    try {
      // Mock implementation - replace with real API call
      const { email, password } = credentials;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email && password) {
        const user: User = {
          id: '1',
          email,
          name: 'User',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
        };
        this.user = user;
        return user;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  async register(data: RegisterData): Promise<User> {
    this.isLoading = true;
    try {
      // Mock implementation - replace with real API call
      const { email, password, name } = data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email && password && name) {
        const user: User = {
          id: Date.now().toString(),
          email,
          name,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
        };
        this.user = user;
        return user;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  async logout(): Promise<void> {
    this.isLoading = true;
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      this.user = null;
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  getCurrentUser(): User | null {
    return this.user;
  }
  
  isAuthenticated(): boolean {
    return this.user !== null;
  }
  
  isLoadingState(): boolean {
    return this.isLoading;
  }
  
  async refreshToken(): Promise<User | null> {
    this.isLoading = true;
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.user;
    } catch (error) {
      this.user = null;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    this.isLoading = true;
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset email sent to:', email);
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}

export const authService = new AuthService();
export default authService;
