import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, Shield, Building2, Droplets, Zap, Trash2, Settings } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const fillAdminCredentials = (department: 'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Other') => {
    const credentials = {
      PWD: { email: 'pwd@kseb.localeyes.com', password: 'authority123' },
      Water: { email: 'water@kerala.localeyes.com', password: 'authority123' },
      KSEB: { email: 'kseb@kerala.localeyes.com', password: 'authority123' },
      'Waste Management': { email: 'waste@kerala.localeyes.com', password: 'authority123' },
      'Other': { email: 'other@kerala.localeyes.com', password: 'authority123' }
    };
    
    const creds = credentials[department];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'PWD': return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'Water': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'KSEB': return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'Waste Management': return <Trash2 className="h-5 w-5 text-green-600" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6">
              ADMIN PORTAL
            </h1>
            <p className="text-2xl font-semibold text-white/95 mb-4">
              AUTHORITY LOGIN
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Access your department dashboard to manage community issues and track progress.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative -mt-20 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Authority Login
              </CardTitle>
              <CardDescription>
                Sign in to manage issues for your department
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
                  className="w-full h-12 text-lg font-semibold shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Authority Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillAdminCredentials('PWD')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  {getDepartmentIcon('PWD')}
                  <div>
                    <div className="font-medium">PWD</div>
                    <Badge variant="secondary" className="text-xs">Public Works</Badge>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillAdminCredentials('Water')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  {getDepartmentIcon('Water')}
                  <div>
                    <div className="font-medium">Water</div>
                    <Badge variant="secondary" className="text-xs">Water Authority</Badge>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillAdminCredentials('KSEB')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  {getDepartmentIcon('KSEB')}
                  <div>
                    <div className="font-medium">KSEB</div>
                    <Badge variant="secondary" className="text-xs">Electricity</Badge>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillAdminCredentials('Waste Management')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  {getDepartmentIcon('Waste Management')}
                  <div>
                    <div className="font-medium">Waste</div>
                    <Badge variant="secondary" className="text-xs">Waste Management</Badge>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillAdminCredentials('Other')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  {getDepartmentIcon('Other')}
                  <div>
                    <div className="font-medium">Other Department</div>
                    <Badge variant="secondary" className="text-xs">General Authority</Badge>
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary underline">Back to Citizen Login</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
