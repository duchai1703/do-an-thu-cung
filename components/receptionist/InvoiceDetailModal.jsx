"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  Download,
  PawPrint,
  Calendar,
  Loader2,
  MapPin,
  Receipt
} from "lucide-react";
import { invoiceApi, appointmentApi } from "@/lib/api";
import apiClient from "@/lib/api/client";

export default function InvoiceDetailModal({ isOpen, onClose, invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [cageAssignment, setCageAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printContentRef = useRef(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceDetail();
    }
  }, [isOpen, invoiceId]);

  const loadInvoiceDetail = async () => {
    try {
      setLoading(true);
      const invoiceResponse = await invoiceApi.getById(invoiceId);
      
      if (invoiceResponse.success) {
        let invoiceData = invoiceResponse.data;

        // Manually fetch related data since backend doesn't support generic inclusion
        if (invoiceData.appointmentId) {
          try {
            const apptResponse = await appointmentApi.getById(invoiceData.appointmentId);

            if (apptResponse.success && apptResponse.data) {
              invoiceData.appointment = apptResponse.data;

              // Data Mapping: Use nested owner data from appointment if available
              if (invoiceData.appointment.pet?.owner) {
                invoiceData.petOwner = invoiceData.appointment.pet.owner;
                // Map account if available (for email)
                if (invoiceData.appointment.pet.owner.account) {
                  if (!invoiceData.petOwner.account) {
                    invoiceData.petOwner.account = invoiceData.appointment.pet.owner.account;
                  }
                }
              }

              // Fetch cage assignment if exists
              if (invoiceData.appointment?.cageAssignmentId) {
                try {
                  const cageRes = await apiClient.get(`/cages/assignments/${invoiceData.appointment.cageAssignmentId}`);
                  if (cageRes.data) {
                    setCageAssignment(cageRes.data);
                  }
                } catch (cageErr) {
                  console.log("No cage assignment or error:", cageErr);
                }
              }
            }
          } catch (err) {
            console.error("Error fetching related appointment/owner:", err);
          }
        }

        setInvoice(invoiceData);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Generate printable HTML content
  const generatePrintableContent = useCallback(() => {
    if (!invoice) return '';
    
    const isPaid = invoice.status === 'PAID';
    const otherFees = (Number(invoice.totalAmount) || 0) - (Number(invoice.subtotal) || 0) + (Number(invoice.discount) || 0) - (Number(invoice.tax) || 0);
    const displayedTax = Number(invoice.tax) || 0;
    const showOtherFees = otherFees > 1000;
    
    const servicesHtml = invoice.services?.length > 0 
      ? invoice.services.map((service, idx) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${service.serviceName || service.name || 'Dịch vụ'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(Number(service.basePrice) || 0)}</td>
        </tr>
      `).join('')
      : `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoice.appointment?.service?.serviceName || 'Dịch vụ'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(invoice.subtotal - (cageAssignment?.totalCost || 0))}</td>
        </tr>`;

    const cageHtml = cageAssignment ? `
      <tr style="background-color: #f3e8ff;">
        <td style="padding: 8px; border-bottom: 1px solid #eee;">🏠 Phí lưu trú chuồng ${cageAssignment.cage?.cageNumber || ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(cageAssignment.totalCost || 0)}</td>
      </tr>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .invoice-title { font-size: 20px; margin-top: 10px; color: #333; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; flex: 1; margin: 0 5px; }
          .info-box h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
          .info-box p { font-size: 14px; color: #111827; margin: 4px 0; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; }
          .total-row { font-weight: bold; font-size: 16px; background: #ecfdf5; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🐾 PAW LOVERS</div>
          <div class="invoice-title">HÓA ĐƠN DỊCH VỤ</div>
          <p style="color: #6b7280; margin-top: 5px;">Pet Care System</p>
        </div>

        <div class="invoice-info">
          <div class="info-box">
            <h3>Thông tin hóa đơn</h3>
            <p><strong>Mã HĐ:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Ngày:</strong> ${formatDate(invoice.issueDate)}</p>
            <p><strong>Trạng thái:</strong> <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}</span></p>
          </div>
          <div class="info-box">
            <h3>Khách hàng</h3>
            <p><strong>Họ tên:</strong> ${invoice.petOwner?.fullName || 'N/A'}</p>
            <p><strong>SĐT:</strong> ${invoice.petOwner?.phoneNumber || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> ${invoice.petOwner?.address || 'N/A'}</p>
          </div>
          <div class="info-box">
            <h3>Thú cưng</h3>
            <p><strong>Tên:</strong> ${invoice.appointment?.pet?.name || 'N/A'}</p>
            <p><strong>Loài:</strong> ${invoice.appointment?.pet?.species || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
            ${cageHtml}
            <tr>
              <td style="padding: 8px;">Tạm tính</td>
              <td style="padding: 8px; text-align: right;">${formatCurrency(invoice.subtotal)}</td>
            </tr>
            ${Number(invoice.discount) > 0 ? `
            <tr style="color: #d97706;">
              <td style="padding: 8px;">🏷️ Giảm giá</td>
              <td style="padding: 8px; text-align: right;">-${formatCurrency(invoice.discount)}</td>
            </tr>` : ''}
            ${displayedTax > 0 ? `
            <tr>
              <td style="padding: 8px;">📋 Thuế (10%)</td>
              <td style="padding: 8px; text-align: right;">+${formatCurrency(displayedTax)}</td>
            </tr>` : ''}
            ${showOtherFees ? `
            <tr>
              <td style="padding: 8px;">📦 Phí khác</td>
              <td style="padding: 8px; text-align: right;">+${formatCurrency(otherFees)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td style="padding: 12px;">TỔNG THANH TOÁN</td>
              <td style="padding: 12px; text-align: right; color: #059669;">${formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        ${invoice.payments?.length > 0 ? `
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <h3 style="font-size: 14px; margin-bottom: 10px;">Thông tin thanh toán</h3>
          <p><strong>Phương thức:</strong> ${invoice.payments[0].paymentMethod === 'CASH' ? 'Tiền mặt' : invoice.payments[0].paymentMethod === 'VNPAY' ? 'VNPay' : invoice.payments[0].paymentMethod}</p>
          <p><strong>Số tiền:</strong> ${formatCurrency(invoice.payments[0].amount)}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của PAW LOVERS!</p>
          <p>Hotline: 1900-XXXX | Email: support@pawlovers.vn</p>
        </div>
      </body>
      </html>
    `;
  }, [invoice, cageAssignment, formatCurrency, formatDate]);

  // Handle Print - Opens new window with printable content
  const handlePrint = useCallback(() => {
    if (!invoice) return;
    
    setIsPrinting(true);
    
    try {
      const printContent = generatePrintableContent();
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          // Close after print dialog is closed
          printWindow.onafterprint = () => printWindow.close();
        };
        
        // Fallback for browsers that don't support onafterprint
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.print();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Lỗi khi in hóa đơn');
    } finally {
      setIsPrinting(false);
    }
  }, [invoice, generatePrintableContent]);

  // Handle PDF Download - Uses html2canvas + jspdf with fallback
  const handleDownloadPDF = useCallback(async () => {
    if (!invoice) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Try using html2canvas and jspdf
      let html2canvas;
      let jsPDF;
      
      // Try to import html2canvas (try original first, then pro version)
      try {
        const html2canvasModule = await import('html2canvas');
        html2canvas = html2canvasModule.default;
      } catch (e1) {
        try {
          const html2canvasProModule = await import('html2canvas-pro');
          html2canvas = html2canvasProModule.default;
        } catch (e2) {
          throw new Error('Could not load html2canvas library');
        }
      }
      
      // Import jsPDF
      try {
        const jspdfModule = await import('jspdf');
        jsPDF = jspdfModule.jsPDF;
      } catch (e) {
        throw new Error('Could not load jsPDF library');
      }
      
      // Create a hidden container for rendering
      const container = document.createElement('div');
      container.innerHTML = generatePrintableContent();
      container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; background-color: white; padding: 20px;';
      document.body.appendChild(container);
      
      // Wait a bit for DOM to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // Generate canvas from HTML
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        windowHeight: container.scrollHeight,
      });
      
      // Remove the temporary container
      document.body.removeChild(container);
      
      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add image to PDF (handle multiple pages if content is long)
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = -pageHeight + (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const fileName = `${invoice.invoiceNumber || 'hoa-don'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback: open print dialog (user can save as PDF)
      try {
        handlePrint();
        alert('Lỗi khi tạo PDF. Vui lòng sử dụng tính năng "Save as PDF" trong hộp thoại in.');
      } catch (printError) {
        alert('Lỗi khi tạo PDF. Vui lòng thử lại.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [invoice, generatePrintableContent, handlePrint]);

  const isPaid = invoice?.status === 'PAID';
  const otherFees = (Number(invoice?.totalAmount) || 0) - (Number(invoice?.subtotal) || 0) + (Number(invoice?.discount) || 0) - (Number(invoice?.tax) || 0);
  const displayedTax = (Number(invoice?.tax) || 0);
  const showOtherFees = otherFees > 1000; // threshold for float errors
  
  const isValidDate = (date) => {
    return date && new Date(date).toString() !== 'Invalid Date' && new Date(date).getFullYear() > 1970;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Chi tiết hóa đơn</span>
            {invoice && (
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrint} 
                  variant="outline" 
                  size="sm"
                  disabled={isPrinting}
                >
                  {isPrinting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4 mr-2" />
                  )}
                  In
                </Button>
                <Button 
                  onClick={handleDownloadPDF} 
                  size="sm" 
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : invoice ? (
          <div className="space-y-4">
            {/* Status & Amount */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Mã hóa đơn</p>
                    <p className="font-mono font-bold text-lg">{invoice.invoiceNumber}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    isPaid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                      {invoice.petOwner?.fullName?.[0] || 'N'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="font-semibold">{invoice.petOwner?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">SĐT</p>
                      <p className="font-semibold">{invoice.petOwner?.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-sm">{invoice.petOwner?.account?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Địa chỉ</p>
                      <p className="font-semibold text-sm truncate max-w-[150px]" title={invoice.petOwner?.address}>
                        {invoice.petOwner?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {invoice.appointment?.pet && (
                    <div className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs text-gray-500">Thú cưng</p>
                        <p className="font-semibold">{invoice.appointment.pet.name} ({invoice.appointment.pet.species})</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            {invoice.appointment && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Lịch hẹn
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Dịch vụ</p>
                      <p className="font-semibold">{invoice.appointment.service?.serviceName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày</p>
                      <p className="font-semibold">
                        {invoice.appointment.appointmentDate ? formatDate(invoice.appointment.appointmentDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Thời gian</p>
                      <p className="font-semibold">{invoice.appointment.startTime} - {invoice.appointment.endTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service & Cost Details Breakdown */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="w-4 h-4" />
                  Chi tiết dịch vụ & Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Table Header */}
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 border-b pb-2">
                    <span>Hạng mục</span>
                    <span>Thành tiền</span>
                </div>
                
                {/* Itemized Services List */}
                {invoice.services && invoice.services.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {invoice.services.map((service, idx) => {
                      const serviceName = service.serviceName || service.name || 'Dịch vụ';
                      const price = Number(service.basePrice) || 0;
                      
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 px-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                              💉 {serviceName}
                            </p>
                            {service.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <p className="font-medium">{formatCurrency(price)}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback: Single service from appointment */
                  <div className="flex justify-between items-center py-2">
                      <div>
                          <p className="font-semibold text-gray-800">{invoice.appointment?.service?.serviceName || 'Dịch vụ'}</p>
                          <p className="text-xs text-gray-500">Phí dịch vụ</p>
                      </div>
                      <p className="font-medium">{formatCurrency(invoice.subtotal - (cageAssignment?.totalCost || 0))}</p>
                  </div>
                )}

                {/* Cage Boarding Cost Breakdown */}
                {cageAssignment && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-purple-800 flex items-center gap-2">
                          🏠 Phí lưu trú chuồng {cageAssignment.cage?.cageNumber || ''}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {formatCurrency(cageAssignment.dailyRate)}/ngày × {(() => {
                            const checkIn = new Date(cageAssignment.checkInDate);
                            const checkOut = cageAssignment.checkOutDate 
                              ? new Date(cageAssignment.checkOutDate) 
                              : new Date(cageAssignment.expectedCheckOutDate || new Date());
                            const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
                            return days;
                          })()} ngày
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(cageAssignment.checkInDate).toLocaleDateString('vi-VN')} → {cageAssignment.checkOutDate 
                            ? new Date(cageAssignment.checkOutDate).toLocaleDateString('vi-VN')
                            : new Date(cageAssignment.expectedCheckOutDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <p className="font-bold text-purple-700">{formatCurrency(cageAssignment.totalCost || 0)}</p>
                    </div>
                  </div>
                )}

                {/* Subtotal Row */}
                <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>

                {/* Discount Row */}
                {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between items-center py-2 text-amber-600 bg-amber-50/50 px-2 rounded-lg">
                        <span className="flex items-center gap-1">🏷️ Giảm giá</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                )}

                {/* Tax Row */}
                {displayedTax > 0 && (
                    <div className="flex justify-between items-center py-2 text-gray-600">
                        <span>📋 Thuế (10%)</span>
                        <span>+{formatCurrency(displayedTax)}</span>
                    </div>
                )}

                {/* Other Fees Row */}
                {showOtherFees && (
                    <div className="flex justify-between items-center py-2 text-gray-600">
                        <span>📦 Phí khác</span>
                        <span>+{formatCurrency(otherFees)}</span>
                    </div>
                )}

                {/* Total Row */}
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-dashed border-gray-200">
                    <span className="font-bold text-lg text-emerald-700">Tổng thanh toán</span>
                    <span className="font-bold text-xl text-emerald-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Thông tin hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Ngày phát hành</p>
                    <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hạn thanh toán</p>
                    <p className="font-semibold">{isValidDate(invoice.dueDate) ? formatDate(invoice.dueDate) : '---'}</p>
                  </div>
                  {isPaid && invoice.paidDate && (
                    <div>
                      <p className="text-xs text-gray-500">Ngày thanh toán</p>
                      <p className="font-semibold text-emerald-600">{formatDate(invoice.paidDate)}</p>
                    </div>
                  )}
                </div>

                {/* Payments */}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-3">Thanh toán</h4>
                    {invoice.payments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Phương thức</p>
                            <p className="font-semibold">
                              {payment.paymentMethod === 'CASH' ? '💵 Tiền mặt' :
                               payment.paymentMethod === 'BANK_TRANSFER' ? '🏦 Chuyển khoản' :
                               payment.paymentMethod === 'VNPAY' ? '📱 VNPay' : payment.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Số tiền</p>
                            <p className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                          </div>
                          {payment.notes && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Ghi chú</p>
                              <p className="text-sm">{payment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy hóa đơn
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
