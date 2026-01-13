/**
 * Profile Page - Premium UI v2 🎀
 * 
 * Features:
 * - Stunning gradient header với floating decorations
 * - Premium avatar với initials
 * - Glassmorphism profile card
 * - Animated profile fields
 * - Edit mode with smooth transitions
 * - Stats summary
 * - Password Change Tab 🔒
 */

"use client";
import { useState, useEffect } from "react";
import { 
  User, Phone, Mail, MapPin, Calendar, Edit,
  Save, X, Shield, Sparkles, Heart, PawPrint, Loader2,
  Lock, Key, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api/client";
import { useToast } from "@/lib/contexts/ToastContext";

export default function ProfilePage() {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [petCount, setPetCount] = useState(0);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: ""
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const userRes = await apiClient.get('/auth/me');
      const userData = userRes.data || userRes;
      setUser(userData);

      try {
        const ownerRes = await apiClient.get('/pet-owners/me');
        const ownerData = ownerRes.data || ownerRes;
        setOwnerProfile(ownerData);
        
        setEditForm({
          fullName: ownerData.fullName || userData.fullName || "",
          phoneNumber: ownerData.phoneNumber || userData.phoneNumber || "",
          address: ownerData.address || ""
        });
      } catch (err) {
        console.log("Pet owner profile not found, using user data");
        setEditForm({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
          address: ""
        });
      }

      // Load pet count
      try {
        const petsRes = await apiClient.get('/pets/me');
        const petsData = petsRes.data || petsRes || [];
        setPetCount(petsData.length);
      } catch (err) {
        console.log("Could not load pets count");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Không thể tải thông tin cá nhân", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await apiClient.put('/pet-owners/me', {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address
      });
      
      showToast("Đã cập nhật thông tin! ✅", "success");
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast(error.response?.data?.message || "Không thể cập nhật thông tin", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("Mật khẩu mới không khớp ❌", "error");
      return;
    }

    if (passwords.newPassword.length < 8) {
      showToast("Mật khẩu mới phải có ít nhất 8 ký tự ⚠️", "error");
      return;
    }

    try {
      setIsChangingPassword(true);
      await apiClient.put(`/auth/account/${user.accountId}/change-password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      
      showToast("Đổi mật khẩu thành công! 🔒✅", "success");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      showToast(error.response?.data?.message || "Lỗi khi đổi mật khẩu", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMemberDays = () => {
    if (!user?.createdAt) return 0;
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl animate-bounce">👤</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-ping">✨</div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải hồ sơ...</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 🌈 Premium Gradient Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-white/10 text-3xl animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i % 2}s`
              }}
            >
              {['👤', '💜', '🐾', '✨', '💖', '⭐'][i]}
            </span>
          ))}
        </div>

        <div className="relative text-white p-8 pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
                👤
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  Hồ Sơ Của Tôi
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </h1>
                <p className="text-white/80 mt-1">
                  Quản lý thông tin tài khoản và bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-24 pb-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-md p-1 h-14 rounded-2xl shadow-lg border border-white/40">
            <TabsTrigger 
              value="profile" 
              className="rounded-xl text-base font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-xl text-base font-medium data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-md transition-all duration-300"
            >
              <Lock className="w-4 h-4 mr-2" />
              Đổi mật khẩu
            </TabsTrigger>
          </TabsList>

          {/* 👤 Profile Tab Content */}
          <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
              <CardContent className="p-0">
                {/* Avatar Section */}
                <div className="flex flex-col items-center pt-8 pb-6 bg-gradient-to-b from-indigo-50/50 to-white">
                  <div className="relative group">
                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                      {getInitials(editForm.fullName || user?.fullName)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editForm.fullName || user?.fullName || 'Chưa cập nhật'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                    <Badge className="mt-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 shadow-sm px-4 py-1.5 rounded-full">
                      <Shield className="h-3 w-3 mr-1" />
                      Chủ thú cưng yêu dấu
                    </Badge>
                  </div>
                </div>

                {/* 📊 Quick Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 border-y bg-gray-50/50">
                  <div className="text-center group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-indigo-600">{petCount}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1 font-medium">
                      <PawPrint className="h-3 w-3" /> Thú cưng
                    </div>
                  </div>
                  <div className="text-center border-x border-gray-200 group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-purple-600">{getMemberDays()}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" /> Ngày tham gia
                    </div>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-pink-600">VIP</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Hạng thành viên</div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Edit Toggle */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                       Chi tiết hồ sơ
                    </h3>
                    {!editing ? (
                      <Button
                        onClick={() => setEditing(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:scale-105 transition-transform rounded-xl"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditing(false)}
                          variant="outline"
                          className="border-gray-300 rounded-xl"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg rounded-xl"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Lưu thay đổi
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Profile Fields */}
                  <div className="space-y-5">
                    {/* Email - Read only */}
                    <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100 group hover:shadow-md transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Email</p>
                        <p className="font-semibold text-gray-800 text-lg">{user?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Email không thể thay đổi
                        </p>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className={`flex items-center gap-5 p-5 rounded-2xl border group hover:shadow-md transition-all duration-300 ${
                      editing ? 'bg-purple-50 border-purple-300 shadow-md ring-2 ring-purple-100' : 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-100'
                    }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Họ và tên</p>
                        {editing ? (
                          <Input
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            placeholder="Nhập họ và tên đầy đủ"
                            className="mt-2 h-12 text-lg border-2 border-purple-300 focus:border-purple-500 rounded-xl bg-white"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 text-lg mt-1">
                            {editForm.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className={`flex items-center gap-5 p-5 rounded-2xl border group hover:shadow-md transition-all duration-300 ${
                      editing ? 'bg-green-50 border-green-300 shadow-md ring-2 ring-green-100' : 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-100'
                    }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Số điện thoại</p>
                        {editing ? (
                          <Input
                            value={editForm.phoneNumber}
                            onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                            placeholder="Nhập số điện thoại"
                            className="mt-2 h-12 text-lg border-2 border-green-300 focus:border-green-500 rounded-xl bg-white"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 text-lg mt-1">
                            {editForm.phoneNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className={`flex items-center gap-5 p-5 rounded-2xl border group hover:shadow-md transition-all duration-300 ${
                      editing ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-100' : 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-100'
                    }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Địa chỉ</p>
                        {editing ? (
                          <Input
                            value={editForm.address}
                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            placeholder="Nhập địa chỉ của bạn"
                            className="mt-2 h-12 text-lg border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-white"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 text-lg mt-1">
                            {editForm.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                   {/* 💡 Tips Card */}
                  <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 flex gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-centershrink-0 text-xl">
                      💡
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Mẹo nhỏ</h4>
                      <p className="text-indigo-700/80 text-sm mt-1">
                        Cập nhật đầy đủ thông tin cá nhân giúp chúng tôi liên hệ với bạn nhanh chóng hơn trong các trường hợp khẩn cấp liên quan đến thú cưng của bạn.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🔒 Security Tab Content */}
          <TabsContent value="security" className="mt-0 focus-visible:outline-none">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="h-2 bg-gradient-to-r from-orange-400 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Shield className="w-6 h-6 text-pink-500" />
                  Bảo mật tài khoản
                </CardTitle>
                <CardDescription>
                  Thay đổi mật khẩu và quản lý bảo mật
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                      <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Đổi mật khẩu
                      </h3>
                      
                      <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div className="space-y-2">
                          <Label>Mật khẩu hiện tại</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input 
                              type="text" 
                              className="pl-10 h-11 bg-white" 
                              placeholder="••••••••"
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
                            className="h-11 bg-white" 
                            placeholder="Ít nhất 8 ký tự"
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
                            className="h-11 bg-white" 
                            placeholder="Nhập lại mật khẩu mới"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg h-11 text-base font-medium rounded-xl"
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : "Cập nhật mật khẩu"}
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                      <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Lời khuyên bảo mật
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-blue-900/80">
                          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">1</span>
                          Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                        </li>
                        <li className="flex gap-3 text-sm text-blue-900/80">
                          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">2</span>
                          Không sử dụng mật khẩu dễ đoán như ngày sinh, số điện thoại.
                        </li>
                        <li className="flex gap-3 text-sm text-blue-900/80">
                          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">3</span>
                          Đổi mật khẩu định kỳ 3-6 tháng một lần để đảm bảo an toàn.
                        </li>
                        <li className="flex gap-3 text-sm text-blue-900/80">
                          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">4</span>
                          Tuyệt đối không chia sẻ mật khẩu của bạn cho bất kỳ ai, kể cả nhân viên chăm sóc.
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-center p-8 opacity-60">
                       <Shield className="w-32 h-32 text-gray-200" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
