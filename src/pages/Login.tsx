import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, Shield, Users } from 'lucide-react';
import heroImage from '../assets/hero-image.jpg';

export default function Login() {
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

  const fillDemoCredentials = (type: 'citizen' | 'authority', department?: 'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Other') => {
    if (type === 'citizen') {
      setEmail('citizen@example.com');
      setPassword('password123');
      return;
    }
    const emailByDept: Record<'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Other', string> = {
      PWD: 'pwd@kseb.localeyes.com',
      Water: 'water@kerala.localeyes.com',
      KSEB: 'kseb@kerala.localeyes.com',
      'Waste Management': 'waste@kerala.localeyes.com',
      'Other': 'other@kerala.localeyes.com',
    };
    const selectedEmail = department ? emailByDept[department] : emailByDept.PWD;
    setEmail(selectedEmail);
    setPassword('authority123');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Beautiful coastal community with waterways and modern architecture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            LOCALEYES
          </h1>
          <p className="mt-6 text-xl leading-8 text-white/90 max-w-2xl mx-auto">
            Empowering communities to report local issues and connect with authorities for swift resolution.
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to report issues or manage community requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email address"
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
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>

              {/* Demo Accounts Section */}
              <div className="space-y-4">
                {/* Citizen Account */}
                <div className="text-center">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Citizen Account</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fillDemoCredentials('citizen')}
                    className="w-full h-auto p-4 flex items-center gap-3"
                  >
                    <Users className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Citizen Demo</div>
                      <div className="text-xs text-muted-foreground">Report community issues</div>
                    </div>
                  </Button>
                </div>

                {/* Authority Accounts */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">Authority Accounts</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'PWD')}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium text-xs">PWD</div>
                        <div className="text-xs text-muted-foreground">Public Works</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'Water')}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium text-xs">Water</div>
                        <div className="text-xs text-muted-foreground">Water Supply</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'KSEB')}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium text-xs">KSEB</div>
                        <div className="text-xs text-muted-foreground">Electricity</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'Waste Management')}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium text-xs">Waste</div>
                        <div className="text-xs text-muted-foreground">Waste Mgmt</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'Other')}
                      className="h-auto p-3 flex flex-col items-center gap-2 col-span-2"
                    >
                      <Shield className="h-4 w-4 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium text-xs">Other Department</div>
                        <div className="text-xs text-muted-foreground">General Issues</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}