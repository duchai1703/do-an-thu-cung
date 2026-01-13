// components/forms/RegistrationForm.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { validateRegister } from "@/lib/utils/validation";
import { AccountController } from "@/lib/controllers/AccountController";
import { Input } from "@/components/ui/input";
import DogMascot from "@/components/ui/DogMascot";
import { cn } from "@/lib/utils.js";

/**
 * Boundary Class: RegistrationForm
 * Implements UC-02: Register Account
 * Allows Pet Owner to create a new account
 */
export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate form
    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit registration
    setLoading(true);
    const response = await AccountController.handleRegistration(form);
    setLoading(false);

    if (response.success) {
      setMessage({ type: 'success', text: response.message });
      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      
      // Show email confirmation notice
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 3000);
    } else {
      setMessage({ type: 'error', text: response.message });
    }
  };

  return (
    <div className="auth-glass-card rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-2xl">
      {/* Dog Mascot - happy for registration */}
      <DogMascot isPasswordFocused={isPasswordFocused} isHappy={loading || message.type === 'success'} />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          Đăng ký tài khoản
        </h1>
        <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Tham gia gia đình PAW LOVERS
          <Sparkles className="w-4 h-4 text-amber-400" />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Nguyễn Văn A"
          icon={User}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="email@example.com"
          icon={Mail}
          required
        />

        <Input
          label="Số điện thoại"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="0901234567"
          icon={Phone}
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          error={errors.password}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Input
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          error={errors.confirmPassword}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        {/* Enhanced Register Button */}
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
                <span>Đang đăng ký...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🐱</span>
                <span>Tham gia ngay!</span>
              </>
            )}
          </span>
        </button>

        {message.text && (
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300",
            message.type === 'success' 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{message.text}</p>
              {message.type === 'success' && (
                <p className="text-xs mt-1 text-emerald-600">
                  📧 Kiểm tra email để xác nhận tài khoản của bạn!
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Đã có tài khoản?{' '}
          <Link 
            href="/login" 
            className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-all"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}

