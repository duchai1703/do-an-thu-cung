// components/forms/ResetPasswordForm.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, XCircle, ArrowLeft, Sparkles } from "lucide-react";
import { validateResetPassword } from "@/lib/utils/validation";
import { AccountController } from "@/lib/controllers/AccountController";
import { Input } from "@/components/ui/input";
import DogMascot from "@/components/ui/DogMascot";
import { cn } from "@/lib/utils.js";

/**
 * Boundary Class: ResetPasswordForm
 * Implements UC-06: Reset Password
 * Allows users to request password reset via email
 */
export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate email
    const validationErrors = validateResetPassword({ email });
    if (validationErrors.email) {
      setError(validationErrors.email);
      return;
    }

    // Submit reset request
    setLoading(true);
    const response = await AccountController.handlePasswordReset({ email });
    setLoading(false);

    if (response.success) {
      setMessage({ type: 'success', text: response.message });
      setEmail("");
      setError("");
    } else {
      setMessage({ type: 'error', text: response.message });
    }
  };

  return (
    <div className="auth-glass-card rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-2xl">
      {/* Dog Mascot - shows concern/waiting */}
      <DogMascot isPasswordFocused={false} isHappy={loading || message.type === 'success'} />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          Quên mật khẩu?
        </h1>
        <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Đừng lo, chúng tôi sẽ giúp bạn!
          <Sparkles className="w-4 h-4 text-amber-400" />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email đã đăng ký"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          error={error}
          placeholder="email@example.com"
          icon={Mail}
          required
        />

        {/* Enhanced Reset Button */}
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className={cn(
            "w-full py-4 px-6 rounded-2xl font-bold text-white text-lg",
            "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500",
            "hover:from-amber-500 hover:via-orange-600 hover:to-rose-600",
            "transform hover:scale-[1.03] active:scale-[0.98]",
            "transition-all duration-300 ease-out",
            "focus:outline-none focus:ring-4 focus:ring-amber-300",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
            "relative overflow-hidden shadow-lg hover:shadow-xl",
            "border-2 border-amber-300/50"
          )}
        >
          {/* Paw prints decoration when hovered */}
          {isButtonHovered && !loading && (
            <>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg animate-bounce">🐾</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-lg animate-bounce" style={{ animationDelay: '150ms' }}>🐾</span>
            </>
          )}
          
          <span className="relative flex items-center justify-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">📧</span>
                <span>Gửi yêu cầu khôi phục</span>
              </>
            )}
          </span>
        </button>

        {message.text && (
          <div className={cn(
            "flex items-center gap-2 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300",
            message.type === 'success' 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        <div className="text-center space-y-3 mt-6 pt-6 border-t border-gray-200/50">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
          <p className="text-xs text-gray-400">
            Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc liên hệ{' '}
            <a href="mailto:support@pawlovers.com" className="text-amber-600 hover:underline">
              support@pawlovers.com
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

