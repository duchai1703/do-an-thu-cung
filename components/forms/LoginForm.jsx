// components/forms/LoginForm.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";
import { validateLogin } from "@/lib/utils/validation";
import { AccountController } from "@/lib/controllers/AccountController";
import { getMockAccounts } from "@/lib/api/auth";
import { RoleLabels } from "@/lib/utils/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.js";

/**
 * Boundary Class: LoginForm
 * Implements UC-05: Log In
 * Allows all user types to authenticate
 */
export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAccounts, setShowAccounts] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate form
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit login
    setLoading(true);
    const response = await AccountController.handleLogin(form);
    setLoading(false);

    if (response.success) {
      setMessage({ type: 'success', text: response.message });
      
      // Redirect to role-specific dashboard
      setTimeout(() => {
        router.push(response.data.redirectTo);
      }, 1000);
    } else {
      setMessage({ type: 'error', text: response.message });
    }
  };

  const handleQuickLogin = (account) => {
    setForm({ email: account.email, password: account.password });
    setShowAccounts(false);
  };

  return (
    <div className="w-full max-w-[440px] bg-card p-10 rounded-2xl shadow-lg border border-border">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <PawPrint className="h-8 w-8 text-primary animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Đăng nhập</h2>
        <p className="text-sm text-muted-foreground">Chào mừng quay trở lại PAW LOVERS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          type="text"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2" 
            />
            <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
          </label>
          <a 
            href="/reset-password" 
            className="text-primary hover:underline font-medium"
          >
            Quên mật khẩu?
          </a>
        </div>

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          Đăng nhập
        </Button>

        {message.text && (
          <div className={cn(
            "flex items-center gap-2 p-4 rounded-lg text-sm font-medium",
            message.type === 'success' 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        {/* Demo accounts section */}
        <div className="mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            {showAccounts ? '🔼 Ẩn tài khoản demo' : '🔽 Xem tài khoản demo'}
          </button>
          
          {showAccounts && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Click để điền nhanh:</p>
              {getMockAccounts().map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickLogin(account)}
                  className="w-full text-left px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-foreground">{RoleLabels[account.role]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{account.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </a>
        </p>
      </form>
    </div>
  );
}
