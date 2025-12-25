// app/(dashboard)/owner/pets/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { petApi, medicalRecordApi, appointmentApi, getToken } from "@/lib/api";

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetDetails();
  }, [params.id]);

  const loadPetDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Load pet data
      const petResponse = await petApi.getById(params.id);
      
      if (!petResponse.success || !petResponse.data) {
        setPet(null);
        setLoading(false);
        return;
      }

      const petData = petResponse.data;

      // Load medical records and appointments in parallel
      const [medicalResponse, appointmentsResponse] = await Promise.all([
        medicalRecordApi?.getByPetId ? medicalRecordApi.getByPetId(params.id) : Promise.resolve({ success: true, data: [] }),
        appointmentApi.getAll()
      ]);

      // Filter appointments for this pet
      const petAppointments = appointmentsResponse.success && appointmentsResponse.data
        ? appointmentsResponse.data.filter(apt => apt.petID === params.id || apt.pet?.petID === params.id)
        : [];

      // Extract vaccinations from medical records
      const vaccinations = medicalResponse.success && medicalResponse.data
        ? medicalResponse.data
            .filter(record => record.recordType === 'VACCINATION' || record.vaccinations)
            .map(record => ({
              name: record.diagnosis || record.treatment || 'Tiêm phòng',
              date: record.recordDate ? new Date(record.recordDate).toLocaleDateString('vi-VN') : '',
              nextDue: calculateNextVaccinationDate(record.recordDate)
            }))
        : [];

      // Map pet data to frontend format
      const mappedPet = {
        id: petData.petID || petData.id,
        name: petData.name,
        icon: petData.species?.toLowerCase() === 'dog' || petData.species?.toLowerCase() === 'chó' ? '🐕' : '🐈',
        type: petData.species || 'Unknown',
        breed: petData.breed || 'Unknown',
        age: calculateAge(petData.birthDate) || 'N/A',
        gender: petData.gender || 'Unknown',
        weight: petData.weight ? `${petData.weight} kg` : 'N/A',
        color: petData.color || 'Unknown',
        dateOfBirth: petData.birthDate ? new Date(petData.birthDate).toLocaleDateString('vi-VN') : 'N/A',
        medicalHistory: petData.medicalHistory || medicalResponse.data?.map(r => r.diagnosis).filter(Boolean).join(', ') || 'Chưa có thông tin',
        notes: petData.notes || 'Chưa có ghi chú',
        vaccinations: vaccinations.length > 0 ? vaccinations : [
          { name: 'Chưa có lịch sử tiêm phòng', date: '', nextDue: '' }
        ],
        appointments: petAppointments.map(apt => ({
          date: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN') : '',
          service: apt.service?.name || 'Unknown Service',
          status: apt.status === 'COMPLETED' ? 'Hoàn thành' : 'Sắp tới'
        }))
      };

      setPet(mappedPet);
    } catch (error) {
      console.error("Error loading pet details:", error);
      setPet(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (ageInYears < 1) {
      const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + monthDiff;
      return `${ageInMonths} tháng`;
    }
    
    return `${ageInYears} tuổi`;
  };

  const calculateNextVaccinationDate = (lastVaccinationDate) => {
    if (!lastVaccinationDate) return 'Chưa xác định';
    const lastDate = new Date(lastVaccinationDate);
    const nextDate = new Date(lastDate);
    nextDate.setFullYear(nextDate.getFullYear() + 1); // Typically annual
    return nextDate.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <DashboardHeader title="Chi tiết thú cưng" />
        <div className="empty-state-modern">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="empty-text">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="dashboard-container">
        <DashboardHeader title="Chi tiết thú cưng" />
        <div className="empty-state-modern">
          <div className="empty-icon">🐾</div>
          <p className="empty-text">Không tìm thấy thú cưng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader
        title="Chi tiết thú cưng"
        subtitle="Thông tin đầy đủ về thú cưng của bạn"
      />

      {/* Back Button */}
      <div className="section-separated">
        <button
          onClick={() => router.back()}
          className="btn-back"
        >
          <span>←</span>
          <span>Quay lại</span>
        </button>
      </div>

      {/* Pet Profile Card */}
      <div className="section-separated">
        <div className="pet-detail-profile">
          <div className="pet-profile-header">
            <div className="pet-avatar-section">
              <span className="pet-avatar-huge">{pet.icon}</span>
            </div>
            <div className="pet-profile-info">
              <h1 className="pet-profile-name">{pet.name}</h1>
              <p className="pet-profile-breed">{pet.breed}</p>
              <div className="pet-profile-tags">
                <span className="profile-tag tag-type">{pet.type}</span>
                <span className="profile-tag tag-gender">{pet.gender}</span>
                <span className="profile-tag tag-age">{pet.age}</span>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="pet-detail-section">
            <h3 className="detail-section-title">
              <span className="title-icon">📊</span>
              Thông tin cơ bản
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-card">
                <span className="detail-icon">⚖️</span>
                <div>
                  <p className="detail-label">Cân nặng</p>
                  <p className="detail-value">{pet.weight}</p>
                </div>
              </div>
              <div className="detail-info-card">
                <span className="detail-icon">🎨</span>
                <div>
                  <p className="detail-label">Màu lông</p>
                  <p className="detail-value">{pet.color}</p>
                </div>
              </div>
              <div className="detail-info-card">
                <span className="detail-icon">🎂</span>
                <div>
                  <p className="detail-label">Ngày sinh</p>
                  <p className="detail-value">{pet.dateOfBirth}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="pet-detail-section">
            <h3 className="detail-section-title">
              <span className="title-icon">🏥</span>
              Lịch sử y tế
            </h3>
            <div className="medical-history-box">
              <p className="medical-text">{pet.medicalHistory}</p>
            </div>
          </div>

          {/* Vaccinations */}
          <div className="pet-detail-section">
            <h3 className="detail-section-title">
              <span className="title-icon">💉</span>
              Lịch sử tiêm phòng
            </h3>
            <div className="vaccinations-list">
              {pet.vaccinations.map((vac, index) => (
                <div key={index} className="vaccination-item">
                  <div className="vaccination-info">
                    <p className="vaccination-name">{vac.name}</p>
                    <p className="vaccination-date">Đã tiêm: {vac.date}</p>
                  </div>
                  <div className="vaccination-next">
                    <p className="next-label">Tiêm tiếp:</p>
                    <p className="next-date">{vac.nextDue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments History */}
          <div className="pet-detail-section">
            <h3 className="detail-section-title">
              <span className="title-icon">📅</span>
              Lịch sử dịch vụ
            </h3>
            <div className="appointments-history-list">
              {pet.appointments.map((apt, index) => (
                <div key={index} className="appointment-history-item">
                  <div className="appointment-date-badge">
                    <span>{apt.date}</span>
                  </div>
                  <div className="appointment-info">
                    <p className="appointment-service">{apt.service}</p>
                    <p className={`appointment-status status-${apt.status === 'Hoàn thành' ? 'completed' : 'upcoming'}`}>
                      {apt.status === 'Hoàn thành' ? '✓' : '⏳'} {apt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="pet-detail-section">
            <h3 className="detail-section-title">
              <span className="title-icon">📝</span>
              Ghi chú
            </h3>
            <div className="notes-box">
              <p className="notes-content">{pet.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}