import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Image as ImageIcon, Loader2, Upload, ArrowLeft } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const LOGO = "https://media.base44.com/images/public/6acea8c53ba315332ee93348/dec0a2986_logo.jpg";

export default function Register() {
  const [step, setStep] = useState(0); // 0=welcome, 1=email, 2=otp, 3=profile
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep(2);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!fullName.trim()) { setError("Pick a username"); return; }
    if (!photoFile) { setError("Add a profile picture to continue"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file: photoFile });
      await base44.auth.updateMe({ full_name: fullName.trim(), profile_image_url: res.file_url });
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Couldn't finish setup");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const back = () => { setError(""); setStep((s) => Math.max(0, s - 1)); };

  const returnToLogin = "/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        {/* logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={LOGO} alt="Strawberry" className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-pink-300/40 mb-4" />
        </div>

        {/* STEP 0 — email */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Join Strawberry</h1>
              <p className="text-sm text-muted-foreground mt-1.5">What's your email?</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
            <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) { setError(""); setStep(1); } }} className="space-y-4">
              <Input
                type="email"
                autoFocus
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl"
                required
              />
              <Button type="submit" className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
                Continue
              </Button>
            </form>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button onClick={handleGoogle} className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                <GoogleIcon className="w-3.5 h-3.5 mr-1.5" />
                or continue with Google
              </button>
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to={returnToLogin} className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        {/* STEP 1 — password */}
        {step === 1 && (
          <div className="space-y-5">
            <button onClick={back} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create a password</h1>
              <p className="text-sm text-muted-foreground mt-1.5">{email}</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="password"
                autoFocus
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl"
                required
              />
              <Button type="submit" disabled={loading} className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Continue"}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <div className="space-y-5">
            <button onClick={back} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
              <p className="text-sm text-muted-foreground mt-1.5">We sent a code to {email}</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
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
            <Button onClick={handleVerify} disabled={loading || otpCode.length < 6} className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Verify"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Didn't get it?{" "}
              <button onClick={handleResend} className="text-primary font-medium hover:underline">Resend</button>
            </p>
          </div>
        )}

        {/* STEP 3 — username + photo */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Set up your profile</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Pick a username and a profile picture</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
            <div className="flex flex-col items-center">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden strawberry-gradient flex items-center justify-center shadow-lg shadow-pink-300/40 ring-4 ring-pink-200/40"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-9 h-9 text-white/80" />
                )}
              </button>
              <button onClick={() => fileRef.current?.click()} className="mt-3 text-sm text-primary font-medium hover:underline flex items-center">
                <Upload className="w-3.5 h-3.5 mr-1" /> {photoPreview ? "Change photo" : "Upload photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
            </div>
            <Input
              placeholder="Username"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 rounded-2xl text-center"
            />
            <Button onClick={handleFinish} disabled={loading} className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finishing...</> : "Finish"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}