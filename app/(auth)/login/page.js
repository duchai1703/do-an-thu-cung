"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateLogin } from "@/lib/utils/validation";
import { AccountController } from "@/lib/controllers/AccountController";
import { getMockAccounts } from "@/lib/api/auth";
import { RoleLabels } from "@/lib/utils/constants";
import { Mail, LockKeyhole, PawPrint, ChevronDown, ChevronUp, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAccounts, setShowAccounts] = useState(false);

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

    if (response.success) {
      setMessage({ type: "success", text: response.message });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setMessage({ type: "error", text: response.message });
    }
  };

  const handleQuickLogin = (account) => {
    setForm({ email: account.email, password: account.password });
    setShowAccounts(false);
  };

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-2xl border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Chào mừng quay trở lại PAW LOVERS
          </CardDescription>
        </CardHeader>

        <CardContent>
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
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={LockKeyhole}
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
              <Link
                href="/reset-password"
                className="text-primary hover:underline font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Đăng nhập
            </Button>

            {message.text && (
              <div
                className={cn(
                  "p-3 rounded-md text-sm font-medium text-center",
                  message.type === "success"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                )}
              >
                {message.text}
              </div>
            )}

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAccounts(!showAccounts)}
                className="w-full text-sm"
              >
                {showAccounts ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ẩn tài khoản demo
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Xem tài khoản demo
                  </>
                )}
              </Button>

              {showAccounts && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    Click để điền nhanh:
                  </p>
                  {getMockAccounts().map((account, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickLogin(account)}
                      className="w-full text-left px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors border border-border"
                    >
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <User className="h-4 w-4" />
                        {RoleLabels[account.role]}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 ml-6">
                        {account.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
  );
}
