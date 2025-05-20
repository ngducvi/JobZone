//  page payment return recruiter
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentReturnRecruiter = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const data = params.get('data');
        const isValid = params.get('is_valid');
        const errorParam = params.get('error');

        if (errorParam) {
            let msg = 'Có lỗi xảy ra trong quá trình thanh toán.';
            if (errorParam === 'direct_access') msg = 'Truy cập trực tiếp không hợp lệ.';
            if (errorParam === 'missing_order_id') msg = 'Thiếu mã đơn hàng.';
            if (errorParam === 'transaction_not_found') msg = 'Không tìm thấy giao dịch.';
            if (errorParam === 'missing_signature') msg = 'Thiếu chữ ký xác thực.';
            if (errorParam === 'company_not_found') msg = 'Không tìm thấy công ty.';
            if (errorParam === 'server_error') msg = 'Lỗi máy chủ.';
            setError(msg);
            return;
        }
        if (!data) {
            setError('Không nhận được dữ liệu thanh toán.');
            return;
        }
        // Parse data string
        const arr = data.split('|');
        setResult({
            responseCode: arr[0],
            transactionStatus: arr[1],
            orderId: arr[2],
            amount: arr[3],
            bankCode: arr[4],
            bankTranNo: arr[5],
            cardType: arr[6],
            payDate: arr[7],
            orderInfo: arr[8],
            isValid: isValid === 'true',
        });
    }, [location.search]);

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ textAlign: 'center', color: '#013a74', marginBottom: 24 }}>Kết quả thanh toán</h2>
            {error && (
                <div style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</div>
            )}
            {result && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        {result.isValid && result.responseCode === '00' && result.transactionStatus === '00' ? (
                            <>
                                <div style={{ color: '#16a34a', fontWeight: 600, fontSize: 20 }}>Thanh toán thành công!</div>
                                <div style={{ color: '#64748b', marginTop: 8 }}>Cảm ơn bạn đã nâng cấp gói dịch vụ cho công ty.</div>
                            </>
                        ) : (
                            <>
                                <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 20 }}>Thanh toán thất bại!</div>
                                <div style={{ color: '#64748b', marginTop: 8 }}>Vui lòng thử lại hoặc liên hệ hỗ trợ.</div>
                            </>
                        )}
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, fontSize: 15 }}>
                        <div><b>Mã giao dịch:</b> {result.orderId}</div>
                        <div><b>Số tiền:</b> {Number(result.amount)/100} VND</div>
                        <div><b>Ngân hàng:</b> {result.bankCode}</div>
                        <div><b>Mã giao dịch NH:</b> {result.bankTranNo}</div>
                        <div><b>Loại thẻ:</b> {result.cardType}</div>
                        <div><b>Ngày thanh toán:</b> {result.payDate}</div>
                        <div><b>Thông tin đơn hàng:</b> {result.orderInfo}</div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button onClick={() => navigate('/recruiter/pricing')} style={{ background: '#013a74', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>
                            Quay về trang gói dịch vụ
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentReturnRecruiter;  