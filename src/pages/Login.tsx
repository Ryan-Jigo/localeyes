import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Eye, EyeOff, Shield, Users, Flame, Activity, TrafficCone, Wrench, Droplet } from 'lucide-react';
import Logo from '../components/Logo';

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

  const fillDemoCredentials = (type: 'citizen' | 'authority', department?: 'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Traffic' | 'Fire Department' | 'Police' | 'Ambulance/Healthcare' | 'Other') => {
    if (type === 'citizen') {
      setEmail('citizen@example.com');
      setPassword('password123');
      return;
    }
    const emailByDept: Record<string, string> = {
      PWD: 'pwd@kseb.localeyes.com',
      Water: 'water@kerala.localeyes.com',
      KSEB: 'kseb@kerala.localeyes.com',
      'Waste Management': 'waste@kerala.localeyes.com',
      Traffic: 'traffic@kerala.localeyes.com',
      'Fire Department': 'fire@kerala.localeyes.com',
      Police: 'police@kerala.localeyes.com',
      'Ambulance/Healthcare': 'health@kerala.localeyes.com',
      Other: 'other@kerala.localeyes.com',
    };
    const selectedEmail = department ? emailByDept[department] : emailByDept.PWD;
    setEmail(selectedEmail);
    setPassword('authority123');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="shadow-xl border border-border bg-card overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            {/* Left Section - Logo */}
            <div className="bg-muted/30 p-12 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
              <div className="text-center flex flex-col items-center">
                <div className="w-64 h-64 flex items-center justify-center mb-6">
                  <div className="w-full h-full relative flex items-center justify-center">
                    <Logo size={256} hideText={true} light={true} />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4 tracking-wide">
                  LꙪCAL EYES
                </h1>
                <p className="text-xl font-semibold text-muted-foreground">
                  SPOT IT. REPORT IT. FIX IT.
                </p>
              </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-card-foreground mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">
                    Sign in to report issues or manage community requests
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email Address</label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    id="login-submit"
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Log In'}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-700 underline">Create an account</Link>
                </div>

                <div className="mt-8">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                      <span className="bg-card px-3 text-muted-foreground">Demo Accounts</span>
                    </div>
                  </div>

                  {/* CITIZEN PROFILE BUTTON */}
                  <button
                    onClick={() => fillDemoCredentials('citizen')}
                    type="button"
                    className="w-full mb-3 p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex items-center gap-4 text-left group cursor-pointer rounded-lg"
                    id="demo-citizen-btn"
                  >
                    <div className="w-8 h-8 bg-muted text-muted-foreground flex items-center justify-center rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium tracking-wide text-foreground">Citizen Profile</p>
                      <p className="text-xs text-muted-foreground transition-colors">Test as a local citizen</p>
                    </div>
                  </button>

                  {/* AGENCIES GRID CONTAINER */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {/* Police */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'Police')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Shield size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Police</span>
                    </button>

                    {/* Fire Dept */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'Fire Department')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all">
                        <Flame size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Fire Dept</span>
                    </button>

                    {/* Healthcare */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'Ambulance/Healthcare')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-green-500/10 group-hover:text-green-500 transition-all">
                        <Activity size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Healthcare</span>
                    </button>

                    {/* Traffic */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'Traffic')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-all">
                        <TrafficCone size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Traffic</span>
                    </button>

                    {/* PWD */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'PWD')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Wrench size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">PWD</span>
                    </button>

                    {/* Water */}
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('authority', 'Water')}
                      className="p-3 bg-muted/30 hover:bg-muted/60 border border-border transition-all flex flex-col items-center justify-center cursor-pointer rounded-lg group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center mb-2 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                        <Droplet size={14} />
                      </div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Water</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}