/**
 * Receptionist Profile Page - Premium UI 🎀
 * 
 * Route: /dashboard/receptionist/profile
 * 
 * Features:
 * - View detailed profile information
 * - Change password functionality
 * - Account activity summary
 * - Google-style security card design
 */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import { User, Shield, Lock, Key, Mail, Phone, Calendar, Save, Headset } from "lucide-react";

export default function ProfilePage() {
  const { showToast } = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  // Password change state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Get current user to get accountId
      const res = await apiClient.get('/auth/me');
      if (res.data) {
        setUser(res.data);
        // Once we have user, load full profile
        loadProfile(res.data.accountId);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      showToast("Không thể tải thông tin người dùng", "error");
      setLoading(false);
    }
  };

  const loadProfile = async (accountId) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/auth/account/${accountId}/full-profile`);
      setProfileData(res.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Không thể tải thông tin hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("Mật khẩu mới không khớp", "error");
      return;
    }

    if (passwords.newPassword.length < 8) {
      showToast("Mật khẩu mới phải có ít nhất 8 ký tự", "error");
      return;
    }

    try {
      setIsChangingPassword(true);
      await apiClient.put(`/auth/account/${user.accountId}/change-password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      
      showToast("Đổi mật khẩu thành công!", "success");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      showToast(error.response?.data?.message || "Lỗi khi đổi mật khẩu", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐰</div>
          <p className="text-gray-500 font-medium">Đang tải hồ sơ lễ tân...</p>
        </div>
      </div>
    );
  }

  const { account, profile } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header - Receptionist Theme (Blue/Sky) */}
        <div className="bg-gradient-to-r from-blue-500 to-sky-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-inner border-2 border-white/30">
              🐰
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.fullName || account.email}</h1>
              <div className="flex items-center gap-2 mt-2 opacity-90">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white flex gap-1 items-center">
                  <Headset className="w-3 h-3" />
                  {account.userType}
                </Badge>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {account.isActive ? "Tài khoản đang hoạt động" : "Tài khoản bị khóa"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Personal Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>Chi tiết về tài khoản và hồ sơ của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Họ và tên</Label>
                    <div className="font-semibold text-gray-900 border-b pb-2">
                      {profile?.fullName || "---"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email đăng nhập</Label>
                    <div className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {account.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500">Số điện thoại</Label>
                    <div className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {profile?.phoneNumber || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500">Ngày tham gia</Label>
                    <div className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                {profile?.address && (
                  <div className="space-y-2">
                    <Label className="text-gray-500">Địa chỉ</Label>
                    <div className="font-semibold text-gray-900 border-b pb-2">
                      {profile.address}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Security */}
          <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-sky-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                  <Lock className="w-5 h-5 text-sky-500" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        type="text" 
                        className="pl-9" 
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input 
                      type="password" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input 
                      type="password" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100 border shadow-sm">
              <CardContent className="p-4 flex gap-3">
                <Shield className="w-8 h-8 text-blue-500 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Bảo mật tài khoản</p>
                  <p>Hãy giữ mật khẩu của bạn an toàn. Không chia sẻ cho bất kỳ ai khác.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
