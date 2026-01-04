import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Users, ArrowRight } from 'lucide-react';
import heroImage from '../assets/hero-image.jpg';

export default function Login() {
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              LOCALEYES
            </h1>
            <p className="mt-6 text-xl leading-8 text-white/90">
              Empowering communities to report local issues and connect with authorities for swift resolution.
            </p>
            <div className="mt-8">
              <img
                src={heroImage}
                alt="Citizens reporting community issues"
                className="mx-auto rounded-2xl shadow-2xl max-w-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Selection */}
      <div className="relative -mt-20 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Login</h2>
            <p className="text-muted-foreground text-lg">
              Select the appropriate login portal based on your role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Citizen Login Card */}
            <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">Citizen Portal</CardTitle>
                <CardDescription className="text-base">
                  Report community issues, track progress, and upvote important concerns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Report local issues and problems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Track issue resolution progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Upvote and prioritize community concerns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Receive updates on reported issues</span>
                  </div>
                </div>
                
                <Link to="/user-login" className="block">
                  <Button className="w-full h-12 text-lg font-semibold shadow-primary">
                    Login as Citizen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Demo Account:</div>
                  <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                    citizen@example.com
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authority Login Card */}
            <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl font-bold text-secondary">Authority Portal</CardTitle>
                <CardDescription className="text-base">
                  Manage and resolve community issues assigned to your department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>View assigned department issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>Update issue status and progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>Prioritize issues by community votes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>Communicate with citizens</span>
                  </div>
                </div>
                
                <Link to="/admin-login" className="block">
                  <Button className="w-full h-12 text-lg font-semibold shadow-secondary bg-secondary hover:bg-secondary/90">
                    Login as Authority
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Demo Accounts:</div>
                  <div className="space-y-1">
                    <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                      pwd@kseb.localeyes.com
                    </div>
                    <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                      water@kerala.localeyes.com
                    </div>
                    <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                      waste@kerala.localeyes.com
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}