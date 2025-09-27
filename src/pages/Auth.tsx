import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Github } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, signInWithGitHub, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setIsLoading(true);
    
    try {
      // Validate input
      authSchema.parse({ email, password });
      
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        // Handle specific error cases with clear messages
        let errorMessage = error.message;
        let errorTitle = 'Authentication Error';
        
        if (error.message === 'Email not confirmed') {
          errorTitle = 'Email Confirmation Required';
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
      } else if (isSignUp) {
        toast({
          title: '🎉 Account Created Successfully!',
          description: 'Please check your email and click the confirmation link to activate your account. You can then sign in.',
          duration: 6000,
        });
      } else {
        toast({
          title: '✅ Welcome Back!',
          description: 'You have been successfully signed in.',
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Please Check Your Input',
          description: err.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      toast({
        title: 'Redirecting...',
        description: `You'll be redirected to ${provider === 'google' ? 'Google' : 'GitHub'} to complete the sign-in process.`,
      });
      
      const { error } = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithGitHub();

      if (error) {
        toast({
          title: 'Authentication Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Authentication Error',
        description: 'An unexpected error occurred during OAuth sign-in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const AuthForm = ({ isSignUp }: { isSignUp: boolean }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      handleAuth(email, password, isSignUp);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={isSignUp ? "signup-email" : "signin-email"} className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id={isSignUp ? "signup-email" : "signin-email"}
            name="email"
            type="email"
            placeholder="Enter your email address"
            className="auth-input"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isSignUp ? "signup-password" : "signin-password"} className="text-sm font-medium">
            Password
          </Label>
          <Input
            id={isSignUp ? "signup-password" : "signin-password"}
            name="password"
            type="password"
            placeholder={isSignUp ? "Create a secure password (min. 6 characters)" : "Enter your password"}
            className="auth-input"
            required
          />
        </div>
        {isSignUp && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            📧 After signing up, you'll receive a confirmation email. Please click the link in the email to activate your account.
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full auth-button font-medium" 
          disabled={isLoading}
        >
          {isLoading 
            ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) 
            : (isSignUp ? '🚀 Create Account' : '👋 Sign In')
          }
        </Button>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse-glow"></div>
      <Card className="w-full max-w-md auth-card animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-slide-up">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Task Management System
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account or create a new one to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full oauth-button auth-button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full oauth-button auth-button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 py-1 text-muted-foreground rounded-full">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Forms */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 auth-button">
              <TabsTrigger value="signin" className="transition-colors">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="transition-colors">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6 animate-slide-up">
              <AuthForm isSignUp={false} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6 animate-slide-up">
              <AuthForm isSignUp={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}