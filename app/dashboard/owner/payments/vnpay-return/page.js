/**
 * VNPay Return Page
 * 
 * Handles the return callback from VNPay after payment.
 * Displays payment result and verifies with backend.
 */

"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle, XCircle, Loader2, Receipt, 
  ArrowLeft, Home, FileText 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paymentApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/ToastContext";
import { formatInvoiceId } from "@/lib/utils/id-formatter";

function VNPayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [ipnSent, setIpnSent] = useState(false);

  useEffect(() => {
    processPaymentReturn();
  }, []);

  const notifyBackendIpn = async (vnpayParams) => {
    try {
      console.log("Sending IPN notification to backend...");
      const response = await paymentApi.handleVNPayIpn(vnpayParams);
      
      if (response.success && response.data) {
        console.log("Backend IPN response:", response.data);
        if (response.data.RspCode === '00') {
          console.log("✅ Backend confirmed payment successfully");
          setIpnSent(true);
        } else {
          console.warn("⚠️ Backend IPN returned error:", response.data.Message);
        }
      }
    } catch (error) {
      console.error("Error sending IPN to backend:", error);
      // Don't show error to user as this is background process
    }
  };

  const processPaymentReturn = async () => {
    try {
      setLoading(true);
      
      // Get all query parameters from VNPay
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      console.log("VNPay return params:", params);

      // Check response code
      const responseCode = params.vnp_ResponseCode;
      const transactionStatus = params.vnp_TransactionStatus;
      const orderId = params.vnp_TxnRef; // This is the payment ID
      const amount = params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : 0;
      const orderInfo = params.vnp_OrderInfo;
      const transactionNo = params.vnp_TransactionNo;
      const bankCode = params.vnp_BankCode;

      // Determine success based on response code
      // 00 = Success, other codes = failure
      const isSuccess = responseCode === '00' && transactionStatus === '00';

      setPaymentResult({
        success: isSuccess,
        responseCode,
        transactionStatus,
        orderId,
        amount,
        orderInfo: decodeURIComponent(orderInfo || ''),
        transactionNo,
        bankCode,
        message: getResponseMessage(responseCode),
      });

      // Show toast notification
      if (isSuccess) {
        showToast("Thanh toán thành công!", "success");
      } else {
        showToast(`Thanh toán thất bại: ${getResponseMessage(responseCode)}`, "error");
      }

      // Send IPN notification to backend to update payment status
      await notifyBackendIpn(params);

    } catch (error) {
      console.error("Error processing payment return:", error);
      showToast("Lỗi khi xử lý kết quả thanh toán", "error");
      setPaymentResult({
        success: false,
        message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
      });
    } finally {
      setLoading(false);
    }
  };

  const getResponseMessage = (code) => {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };
    return messages[code] || 'Lỗi không xác định';
  };

  const handleVerifyPayment = async () => {
    if (!paymentResult?.orderId) return;

    try {
      setVerifying(true);
      const response = await paymentApi.verify(paymentResult.orderId);
      
      if (response.success) {
        showToast("Đã xác minh thanh toán thành công", "success");
        console.log("Verification result:", response.data);
      } else {
        showToast("Không thể xác minh thanh toán", "error");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      showToast("Lỗi khi xác minh thanh toán", "error");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang xử lý kết quả thanh toán...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Result Card */}
        <Card className="mb-6 overflow-hidden shadow-xl">
          <div className={`p-8 text-center ${
            paymentResult?.success 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
            {paymentResult?.success ? (
              <>
                <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">
                  Thanh toán thành công! 🎉
                </h1>
                <p className="text-white/90 text-lg">
                  Giao dịch của bạn đã được xử lý thành công
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">
                  Thanh toán không thành công
                </h1>
                <p className="text-white/90 text-lg">
                  {paymentResult?.message || 'Đã có lỗi xảy ra'}
                </p>
              </>
            )}
          </div>

          <CardContent className="p-8">
            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết giao dịch
              </h3>

              {paymentResult?.orderInfo && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Thông tin đơn hàng:</span>
                  <span className="font-medium text-gray-900">
                    {paymentResult.orderInfo}
                  </span>
                </div>
              )}

              {paymentResult?.amount > 0 && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-xl text-indigo-600">
                    {paymentResult.amount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}

              {paymentResult?.transactionNo && paymentResult.transactionNo !== '0' && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Mã giao dịch VNPay:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {paymentResult.transactionNo}
                  </span>
                </div>
              )}

              {paymentResult?.orderId && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {paymentResult.orderId}
                  </span>
                </div>
              )}

              {paymentResult?.bankCode && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium text-gray-900">
                    {paymentResult.bankCode}
                  </span>
                </div>
              )}

              {paymentResult?.responseCode && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Mã phản hồi:</span>
                  <Badge variant={paymentResult.success ? "success" : "destructive"}>
                    {paymentResult.responseCode}
                  </Badge>
                </div>
              )}

              <div className="flex justify-between py-3">
                <span className="text-gray-600">Trạng thái:</span>
                <Badge variant={paymentResult?.success ? "success" : "destructive"}>
                  {paymentResult?.success ? '✅ Thành công' : '❌ Thất bại'}
                </Badge>
              </div>

              {/* Backend Confirmation Status */}
              {paymentResult?.success && (
                <div className="flex justify-between py-3 pt-4 border-t">
                  <span className="text-gray-600">Xác nhận từ hệ thống:</span>
                  {ipnSent ? (
                    <Badge variant="success" className="bg-green-500">
                      ✅ Đã cập nhật
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-600">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Đang xử lý
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {paymentResult?.success && (
                <>
                  {/* <Button
                    onClick={handleVerifyPayment}
                    disabled={verifying}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xác minh...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Xác minh thanh toán
                      </>
                    )}
                  </Button> */}

                  <Button
                    onClick={() => router.push('/dashboard/owner/invoices')}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xem hóa đơn
                  </Button>
                </>
              )}

              <Button
                onClick={() => router.push('/dashboard/owner/invoices')}
                variant={paymentResult?.success ? "outline" : "default"}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách thanh toán
              </Button>

              {!paymentResult?.success && (
                <Button
                  onClick={() => router.push('/dashboard/owner/invoices')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Thử lại thanh toán
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">ℹ️</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Cần hỗ trợ?
                </h4>
                <p className="text-blue-800 text-sm">
                  Nếu bạn có bất kỳ thắc mắc nào về giao dịch này, 
                  vui lòng liên hệ với chúng tôi hoặc kiểm tra lại trong 
                  phần lịch sử thanh toán của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang tải...
            </h2>
          </CardContent>
        </Card>
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  );
}
