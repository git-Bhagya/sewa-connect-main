import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const authResult = await signInWithOtp(email);
    setIsLoading(false);

    if (authResult.error) {
      setError((authResult.error as Error).message);
      toast.error('Failed to process request. Please try again.');
    } else {
      // Check if signInWithOtp actually returned user data (Bypass mode)
      // Note: We need to modify useAuth.tsx to return the data or check the context
      // For now, let's assume the context user will be updated by signInWithOtp if bypass works
      // or check if we are already logged in
      if (localStorage.getItem('token')) {
        toast.success('Developer Bypass Active: Welcome back!');
        return; // useEffect will handle navigation
      }

      setStep('otp');
      toast.success('OTP sent to your email!');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(email, otp);
    setIsLoading(false);

    if (error) {
      setError('Invalid OTP. Please try again.');
      toast.error('Invalid OTP');
    } else {
      toast.success('Welcome to Sewa!');
      // Navigate is handled by useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Welcome to Sewa</h1>
          <p className="text-muted-foreground mt-2">
            {step === 'email'
              ? 'Enter your email to get started'
              : `Enter the OTP sent to ${email}`
            }
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to Sewa's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
