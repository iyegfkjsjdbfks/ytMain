export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private user: User | null = null;
  
  async login(email: string, password: string): Promise<User> {
    // Mock implementation;
    const user: User = { id: '1', email, name: 'User' };
    this.user = user;
    return user;
  }
  
  async logout(): Promise<void> {
    this.user = null;
  }
  
  getCurrentUser(): User | null {
    return this.user;
  }
  
  isAuthenticated(): boolean {
    return this.user !== null;
  }
}

export const authService = new AuthService();
export default authService;