import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Loader2, Upload, ArrowLeft } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const LOGO = "https://media.base44.com/images/public/6acea8c53ba315332ee93348/dec0a2986_logo.jpg";

export default function Login() {
  const [step, setStep] = useState(0); // 0=email, 1=password, 2=photo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);
  const returnTo = safeReturnTo();

  const handlePassword = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      setStep(2);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const finish = async () => {
    setLoading(true);
    try {
      if (photoFile) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: photoFile });
        await base44.auth.updateMe({ profile_image_url: res.file_url });
      }
    } catch {
      // photo is optional — ignore errors and continue
    } finally {
      setLoading(false);
    }
    window.location.href = returnTo;
  };

  const back = () => { setError(""); setStep((s) => Math.max(0, s - 1)); };
  const registerLink = "/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <img src={LOGO} alt="Strawberry" className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-pink-300/40 mb-4" />
        </div>

        {/* STEP 0 — email */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
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
                New here?{" "}
                <Link to={registerLink} className="text-primary font-medium hover:underline">Create an account</Link>
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
              <h1 className="text-2xl font-bold text-foreground">Enter your password</h1>
              <p className="text-sm text-muted-foreground mt-1.5">{email}</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
            <form onSubmit={handlePassword} className="space-y-4">
              <Input
                type="password"
                autoFocus
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl"
                required
              />
              <Link to="/forgot-password" className="block text-xs text-primary hover:underline text-center">
                Forgot password?
              </Link>
              <Button type="submit" disabled={loading} className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</> : "Log in"}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2 — optional profile photo */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Add a photo?</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Optional — you can skip this for now</p>
            </div>
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
            <Button onClick={finish} disabled={loading} className="w-full h-12 text-sm font-semibold strawberry-gradient text-white rounded-2xl shadow-lg shadow-pink-300/40">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : photoFile ? "Done" : "Skip"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}