import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Eye, EyeOff, Shield, ArrowLeft, Users } from 'lucide-react';
import heroImage from '../assets/hero-image.jpg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const { user, login } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (department: string) => {
    const credentials = {
      'PWD': { email: 'pwd@kseb.localeyes.com', password: 'authority123' },
      'Water': { email: 'water@kerala.localeyes.com', password: 'authority123' },
      'KSEB': { email: 'kseb@kerala.localeyes.com', password: 'authority123' },
      'Waste Management': { email: 'waste@kerala.localeyes.com', password: 'authority123' }
    };
    
    const creds = credentials[department as keyof typeof credentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setSelectedDepartment(department);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-light via-background to-primary-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              LOCALEYES
            </h1>
            <p className="mt-6 text-xl leading-8 text-white/90">
              Authority Portal - Manage community issues and provide swift resolutions.
            </p>
            <div className="mt-8">
              <img
                src={heroImage}
                alt="Authorities managing community issues"
                className="mx-auto rounded-2xl shadow-2xl max-w-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative -mt-20 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-secondary" />
                <CardTitle className="text-2xl font-bold">Authority Login</CardTitle>
              </div>
              <CardDescription>
                Sign in to manage and resolve community issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Authority email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="relative space-y-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold shadow-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In as Authority'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>

              <div className="space-y-3">
                <Select value={selectedDepartment} onValueChange={fillDemoCredentials}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Department Demo Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PWD">PWD Department</SelectItem>
                    <SelectItem value="Water">Water Department</SelectItem>
                    <SelectItem value="KSEB">KSEB Department</SelectItem>
                    <SelectItem value="Waste Management">Waste Management Department</SelectItem>
                  </SelectContent>
                </Select>

                {selectedDepartment && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{selectedDepartment} Demo</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Email: {email || 'Select department above'}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link 
                  to="/user-login" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Are you a citizen? Sign in here
                </Link>
              </div>

              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 