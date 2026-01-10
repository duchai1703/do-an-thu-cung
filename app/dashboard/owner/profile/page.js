/**
 * Profile Page - Premium UI v2
 * 
 * Features:
 * - Stunning gradient header với floating decorations
 * - Premium avatar với initials
 * - Glassmorphism profile card
 * - Animated profile fields
 * - Edit mode with smooth transitions
 * - Stats summary
 */

"use client";
import { useState, useEffect } from "react";
import { 
  User, Phone, Mail, MapPin, Calendar, Edit,
  Save, X, Shield, Sparkles, Heart, PawPrint, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
                  Quản lý thông tin tài khoản cá nhân
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-24 pb-8">
        {/* 👤 Profile Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Avatar Section */}
            <div className="flex flex-col items-center pt-6 pb-4">
              <div className="relative group">
                <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform">
                  {getInitials(editForm.fullName || user?.fullName)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editForm.fullName || user?.fullName || 'Chưa cập nhật'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                <Badge className="mt-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 shadow-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Chủ thú cưng yêu dấu
                </Badge>
              </div>
            </div>

            {/* 📊 Quick Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 border-y bg-gradient-to-r from-indigo-50/50 to-pink-50/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{petCount}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <PawPrint className="h-3 w-3" /> Thú cưng
                </div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-3xl font-bold text-purple-600">{getMemberDays()}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">⭐</div>
                <div className="text-xs text-gray-500 mt-1">Thành viên VIP</div>
              </div>
            </div>

            <div className="p-6">
              {/* Edit Toggle */}
              <div className="flex justify-end mb-6">
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:scale-105 transition-transform"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditing(false)}
                      variant="outline"
                      className="border-gray-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
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
              <div className="space-y-4">
                {/* Email - Read only */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100 group hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Email</p>
                    <p className="font-semibold text-gray-800 text-lg">{user?.email || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">🔒 Email không thể thay đổi</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border group hover:shadow-md transition-all ${
                  editing ? 'bg-purple-50 border-purple-300 shadow-md' : 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-100'
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
                        className="mt-1 h-12 text-lg border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800 text-lg">
                        {editForm.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border group hover:shadow-md transition-all ${
                  editing ? 'bg-green-50 border-green-300 shadow-md' : 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-100'
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
                        className="mt-1 h-12 text-lg border-2 border-green-300 focus:border-green-500 rounded-xl"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800 text-lg">
                        {editForm.phoneNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border group hover:shadow-md transition-all ${
                  editing ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-100'
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
                        className="mt-1 h-12 text-lg border-2 border-amber-300 focus:border-amber-500 rounded-xl"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800 text-lg">
                        {editForm.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Created */}
                {user?.createdAt && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-100/50 rounded-2xl border border-blue-100 group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Ngày tạo tài khoản</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        🎉 Đã là thành viên được {getMemberDays()} ngày
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Date from PetOwner */}
                {ownerProfile?.registrationDate && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-100/50 rounded-2xl border border-pink-100 group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-pink-600 font-semibold uppercase tracking-wide">Ngày đăng ký chủ thú cưng</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {new Date(ownerProfile.registrationDate).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preferred Contact Method */}
                {ownerProfile?.preferredContactMethod && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-teal-100/50 rounded-2xl border border-cyan-100 group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Phương thức liên lạc ưa thích</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {ownerProfile.preferredContactMethod === 'phone' ? '📱 Điện thoại' :
                         ownerProfile.preferredContactMethod === 'email' ? '📧 Email' :
                         ownerProfile.preferredContactMethod === 'sms' ? '💬 SMS' :
                         ownerProfile.preferredContactMethod}
                      </p>
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {ownerProfile?.emergencyContact && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-100/50 rounded-2xl border border-red-100 group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🆘</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Liên hệ khẩn cấp</p>
                      <p className="font-semibold text-gray-800 text-lg">{ownerProfile.emergencyContact}</p>
                      <p className="text-xs text-gray-400">Số liên lạc khi có trường hợp khẩn cấp</p>
                    </div>
                  </div>
                )}

                {/* Owner ID - Read only */}
                {ownerProfile?.petOwnerId && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-100/50 rounded-2xl border border-gray-200 group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl">#️⃣</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Mã chủ thú cưng</p>
                      <p className="font-semibold text-gray-800 text-lg font-mono">PO-{String(ownerProfile.petOwnerId).padStart(4, '0')}</p>
                      <p className="text-xs text-gray-400">Account ID: {ownerProfile.accountId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 💡 Tips Card */}
        <Card className="mt-6 shadow-xl border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute right-4 top-4 text-6xl opacity-20">💡</div>
            <h3 className="font-bold text-lg mb-2">💡 Mẹo hay</h3>
            <p className="text-white/90 text-sm">
              Cập nhật đầy đủ thông tin cá nhân để chúng tôi có thể liên lạc khi cần thiết và cung cấp dịch vụ tốt nhất cho bạn và thú cưng!
            </p>
          </CardContent>
        </Card>
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
