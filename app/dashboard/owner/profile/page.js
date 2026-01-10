/**
 * Profile Page - Premium UI
 * 
 * Features:
 * - Gradient header with avatar
 * - View profile information
 * - Edit profile (name, phone, address)
 * 
 * APIs:
 * - GET /auth/me
 * - GET /pet-owners/me
 * - PUT /pet-owners/me
 */

"use client";
import { useState, useEffect } from "react";
import { 
  User, Phone, Mail, MapPin, Calendar, Edit,
  Save, X, Shield
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
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
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
      
      // Get current user (includes accountId)
      const userRes = await apiClient.get('/auth/me');
      const userData = userRes.data || userRes;
      setUser(userData);

      // Get pet owner profile using /me endpoint
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
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Không thể tải thông tin cá nhân", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await apiClient.put('/pet-owners/me', {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address
      });
      
      showToast("Đã cập nhật thông tin!", "success");
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast(error.response?.data?.message || "Không thể cập nhật thông tin", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Gradient Header with Avatar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-8 pb-24 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <User className="h-8 w-8" />
            Thông Tin Cá Nhân
          </h1>
          <p className="text-white/90">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 pb-8">
        {/* Profile Card */}
        <Card className="shadow-xl">
          <CardContent className="p-0">
            {/* Avatar Section */}
            <div className="flex flex-col items-center -mt-12 pt-0">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {getInitials(editForm.fullName || user?.fullName)}
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editForm.fullName || user?.fullName || 'Chưa cập nhật'}
                </h2>
                <Badge className="mt-2 bg-purple-100 text-purple-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Chủ thú cưng
                </Badge>
              </div>
            </div>

            <div className="p-6 mt-6">
              {/* Edit/View Toggle */}
              <div className="flex justify-end mb-6">
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Fields */}
              <div className="space-y-6">
                {/* Email - Read only */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    {editing ? (
                      <Input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {editForm.fullName || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    {editing ? (
                      <Input
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {editForm.phoneNumber || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    {editing ? (
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        placeholder="Nhập địa chỉ"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {editForm.address || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Created */}
                {user?.createdAt && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Ngày tham gia</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
