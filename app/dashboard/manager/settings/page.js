'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/contexts/ToastContext';
import apiClient from '@/lib/api/client';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'MANAGER',
    avatar: null
  });
  
  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
    marketingEmails: false
  });
  
  // Center info state
  const [centerInfo, setCenterInfo] = useState({
    name: 'PAW LOVERS Pet Care Center',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    hotline: '0901234567',
    email: 'info@pawlovers.vn',
    openingHours: '08:00 - 21:00',
    workingDays: 'Tất cả các ngày'
  });
  
  // Edit modes
  const [editProfile, setEditProfile] = useState(false);
  const [editCenter, setEditCenter] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setProfile({
          fullName: user.fullName || user.name || 'Manager',
          email: user.email || '',
          phone: user.phone || '',
          role: user.userType || 'MANAGER',
          avatar: user.avatar || null,
          accountId: user.accountId || null
        });
      }
      
      // Try to load from API /auth/me
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.data || res.data) {
          const userData = res.data?.data || res.data;
          setProfile(prev => ({
            ...prev,
            fullName: userData.fullName || prev.fullName,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
            role: userData.userType || prev.role,
            accountId: userData.accountId || prev.accountId
          }));
        }
      } catch (e) {
        console.log('Could not load profile from API:', e);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Backend không có API update profile, chỉ lưu localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      savedUser.fullName = profile.fullName;
      savedUser.phone = profile.phone;
      localStorage.setItem('user', JSON.stringify(savedUser));
      
      showToast('Cập nhật thông tin thành công!', 'success');
      setEditProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Không thể cập nhật thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    
    if (security.newPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    if (!profile.accountId) {
      showToast('Không tìm thấy thông tin tài khoản', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Backend API: PUT /api/auth/account/:id/change-password
      await apiClient.put(`/auth/account/${profile.accountId}/change-password`, {
        oldPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      
      showToast('Đổi mật khẩu thành công!', 'success');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: security.twoFactorEnabled
      });
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // Save notifications preferences
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      showToast('Cập nhật cài đặt thông báo thành công!', 'success');
    } catch (error) {
      console.error('Error saving notifications:', error);
      showToast('Không thể lưu cài đặt', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCenterInfo = async () => {
    try {
      setSaving(true);
      // Save center info (would normally call API)
      localStorage.setItem('centerInfo', JSON.stringify(centerInfo));
      showToast('Cập nhật thông tin trung tâm thành công!', 'success');
      setEditCenter(false);
    } catch (error) {
      console.error('Error saving center info:', error);
      showToast('Không thể cập nhật thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '👤 Hồ sơ', icon: '👤' },
    { id: 'security', label: '🔒 Bảo mật', icon: '🔒' },
    { id: 'notifications', label: '🔔 Thông báo', icon: '🔔' },
    { id: 'center', label: '🏪 Trung tâm', icon: '🏪' }
  ];

  const getRoleLabel = (role) => {
    const roles = {
      'MANAGER': 'Quản lý',
      'VETERINARIAN': 'Bác sĩ thú y',
      'CARE_STAFF': 'Nhân viên chăm sóc',
      'RECEPTIONIST': 'Lễ tân'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-500 text-lg">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 🌈 Gradient Header (Slate → Gray) */}
      <div className="bg-gradient-to-r from-slate-600 via-slate-500 to-gray-500 text-white p-8 pb-28 shadow-lg rounded-b-3xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span className="text-4xl">⚙️</span>
                Cài Đặt Hệ Thống
              </h1>
              <p className="text-white/90">
                Quản lý cấu hình và tùy chọn hệ thống
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 pb-8">
        {/* Tabs */}
        <Card className="bg-white shadow-xl mb-6">
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                Thông Tin Cá Nhân
              </CardTitle>
              <Button 
                variant={editProfile ? "outline" : "default"}
                onClick={() => setEditProfile(!editProfile)}
                className={editProfile ? "" : "bg-gradient-to-r from-slate-600 to-gray-600 text-white"}
              >
                {editProfile ? '❌ Hủy' : '✏️ Sửa'}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-500 to-gray-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                    {profile.fullName?.charAt(0) || 'M'}
                  </div>
                  {editProfile && (
                    <Button variant="outline" className="mt-4" size="sm">
                      📷 Đổi ảnh
                    </Button>
                  )}
                </div>
                
                {/* Info Form */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Họ và tên</Label>
                      {editProfile ? (
                        <Input
                          value={profile.fullName}
                          onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                          placeholder="Nhập họ tên"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 mt-1">{profile.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Email</Label>
                      <p className="text-lg text-gray-700 mt-1 flex items-center gap-2">
                        📧 {profile.email}
                        <Badge className="bg-green-100 text-green-700">Đã xác thực</Badge>
                      </p>
                    </div>
                    
                    <div>
                      <Label>Số điện thoại</Label>
                      {editProfile ? (
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <p className="text-lg text-gray-700 mt-1">📱 {profile.phone || 'Chưa cập nhật'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Vai trò</Label>
                      <p className="text-lg mt-1">
                        <Badge className="bg-slate-100 text-slate-700 text-base px-3 py-1">
                          👔 {getRoleLabel(profile.role)}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  {editProfile && (
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      >
                        {saving ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditProfile(false);
                          loadUserData();
                        }}
                      >
                        Hủy bỏ
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  Đổi Mật Khẩu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-md space-y-4">
                  <div>
                    <Label>Mật khẩu hiện tại</Label>
                    <Input
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div>
                    <Label>Mật khẩu mới</Label>
                    <Input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    />
                  </div>
                  <div>
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={saving || !security.currentPassword || !security.newPassword}
                    className="bg-gradient-to-r from-slate-600 to-gray-600 text-white"
                  >
                    {saving ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Two Factor Auth */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  Xác Thực 2 Yếu Tố
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Bảo mật tài khoản bằng xác thực 2 yếu tố</p>
                    <p className="text-sm text-gray-500">Yêu cầu mã xác thực khi đăng nhập từ thiết bị mới</p>
                  </div>
                  <button
                    onClick={() => setSecurity({...security, twoFactorEnabled: !security.twoFactorEnabled})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  Phiên Đăng Nhập
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🖥️</span>
                      <div>
                        <p className="font-medium text-gray-900">Windows - Chrome</p>
                        <p className="text-sm text-gray-500">Thiết bị hiện tại • IP: 192.168.1.x</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Đang hoạt động</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="font-medium text-gray-900">iPhone - Safari</p>
                        <p className="text-sm text-gray-500">Đăng nhập 2 ngày trước</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                Cài Đặt Thông Báo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      📧 Thông báo qua Email
                    </p>
                    <p className="text-sm text-gray-500">Nhận thông báo quan trọng qua email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, emailNotifications: !notifications.emailNotifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Appointment Reminders */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      📅 Nhắc nhở lịch hẹn
                    </p>
                    <p className="text-sm text-gray-500">Thông báo trước khi có lịch hẹn</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, appointmentReminders: !notifications.appointmentReminders})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.appointmentReminders ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* System Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      ⚠️ Cảnh báo hệ thống
                    </p>
                    <p className="text-sm text-gray-500">Thông báo về vấn đề hệ thống quan trọng</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, systemAlerts: !notifications.systemAlerts})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.systemAlerts ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      📢 Email khuyến mãi
                    </p>
                    <p className="text-sm text-gray-500">Nhận thông tin về ưu đãi và khuyến mãi</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, marketingEmails: !notifications.marketingEmails})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.marketingEmails ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <Button 
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-gradient-to-r from-slate-600 to-gray-600 text-white"
                >
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Center Info Tab */}
        {activeTab === 'center' && (
          <Card className="bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏪</span>
                Thông Tin Trung Tâm
              </CardTitle>
              <Button 
                variant={editCenter ? "outline" : "default"}
                onClick={() => setEditCenter(!editCenter)}
                className={editCenter ? "" : "bg-gradient-to-r from-slate-600 to-gray-600 text-white"}
              >
                {editCenter ? '❌ Hủy' : '✏️ Sửa'}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Logo & Name */}
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-5xl shadow-lg">
                    🐾
                  </div>
                  <div className="flex-1">
                    {editCenter ? (
                      <Input
                        value={centerInfo.name}
                        onChange={(e) => setCenterInfo({...centerInfo, name: e.target.value})}
                        className="text-xl font-bold"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{centerInfo.name}</h2>
                    )}
                    <p className="text-gray-500 mt-1">Pet Care & Veterinary Services</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500">📍 Địa chỉ</Label>
                      {editCenter ? (
                        <Input
                          value={centerInfo.address}
                          onChange={(e) => setCenterInfo({...centerInfo, address: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{centerInfo.address}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-gray-500">📞 Hotline</Label>
                      {editCenter ? (
                        <Input
                          value={centerInfo.hotline}
                          onChange={(e) => setCenterInfo({...centerInfo, hotline: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 font-medium">{centerInfo.hotline}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-gray-500">📧 Email</Label>
                      {editCenter ? (
                        <Input
                          value={centerInfo.email}
                          onChange={(e) => setCenterInfo({...centerInfo, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{centerInfo.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500">🕐 Giờ mở cửa</Label>
                      {editCenter ? (
                        <Input
                          value={centerInfo.openingHours}
                          onChange={(e) => setCenterInfo({...centerInfo, openingHours: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 font-medium text-green-600">{centerInfo.openingHours}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-gray-500">📅 Ngày làm việc</Label>
                      {editCenter ? (
                        <Input
                          value={centerInfo.workingDays}
                          onChange={(e) => setCenterInfo({...centerInfo, workingDays: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{centerInfo.workingDays}</p>
                      )}
                    </div>
                  </div>
                </div>

                {editCenter && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={handleSaveCenterInfo}
                      disabled={saving}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    >
                      {saving ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditCenter(false)}
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                )}

                {/* Quick Actions */}
                {!editCenter && (
                  <div className="pt-6 border-t">
                    <h3 className="font-medium text-gray-900 mb-4">⚡ Thao tác nhanh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                        <span className="text-xl">📤</span>
                        <span className="text-xs">Xuất dữ liệu</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                        <span className="text-xl">🔄</span>
                        <span className="text-xs">Sao lưu</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                        <span className="text-xl">📊</span>
                        <span className="text-xs">Báo cáo</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                        <span className="text-xl">🛠️</span>
                        <span className="text-xs">Bảo trì</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
