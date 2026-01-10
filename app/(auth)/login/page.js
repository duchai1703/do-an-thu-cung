"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateLogin } from "@/lib/utils/validation";
import { AccountController } from "@/lib/controllers/AccountController";
import { getMockAccounts } from "@/lib/api/auth";
import { RoleDashboards, RoleLabels } from "@/lib/utils/constants";
import { Mail, LockKeyhole, ChevronDown, ChevronUp, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import DogMascot from "@/components/ui/DogMascot";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAccounts, setShowAccounts] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    console.log("🚀 Submitting login form:", form);
    const response = await AccountController.handleLogin(form);
    setLoading(false);

    console.log("🚀 Login response:", response) ;
    if (response.success) {
      setMessage({ type: "success", text: response.message });
      const correctPath = RoleDashboards[response.data.account.role];
      console.log("➡️ Redirecting to:", correctPath);
      router.push(correctPath);
    } else {
      setMessage({ type: "error", text: response.message });
    }
  };

  const handleQuickLogin = (account) => {
    setForm({ email: account.email, password: account.password });
    setShowAccounts(false);
  };

  return (
    <div className="auth-glass-card rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-2xl">
      {/* Dog Mascot - covers eyes when typing password */}
      <DogMascot isPasswordFocused={isPasswordFocused} isHappy={loading} />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          Đăng nhập
        </h1>
        <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Chào mừng quay trở lại PAW LOVERS
          <Sparkles className="w-4 h-4 text-amber-400" />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          error={errors.password}
          placeholder="••••••••"
          icon={LockKeyhole}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all"
            />
            <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/reset-password"
            className="text-amber-600 hover:text-amber-700 font-medium hover:underline transition-all"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Enhanced Login Button with Paw Effects */}
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
          {/* Shimmer effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          
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
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🐕</span>
                <span>Gặp boss nào!</span>
              </>
            )}
          </span>
        </button>

        {message.text && (
          <div
            className={cn(
              "p-4 rounded-xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 duration-300",
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {message.text}
          </div>
        )}

        {/* Demo accounts */}
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <button
            type="button"
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100/50 transition-all"
          >
            {showAccounts ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ẩn tài khoản demo
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Xem tài khoản demo
              </>
            )}
          </button>

          {showAccounts && (
            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-gray-400 mb-3 text-center">
                Click để điền nhanh:
              </p>
              {getMockAccounts().map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickLogin(account)}
                  className="w-full text-left px-4 py-3 bg-gray-50/80 hover:bg-amber-50 hover:shadow-md rounded-xl text-sm transition-all duration-200 border border-gray-100 hover:border-amber-200 group"
                >
                  <div className="flex items-center gap-2 font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                    <User className="h-4 w-4" />
                    {RoleLabels[account.role]}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 ml-6">
                    {account.email}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-all"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}


