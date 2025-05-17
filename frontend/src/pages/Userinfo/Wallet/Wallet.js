// Wallet.js
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Wallet.module.scss';
import { authAPI, userApis } from '~/utils/api';

const cx = classNames.bind(styles);

const Wallet = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const res = await authAPI().get(userApis.getAllPaymentTransactionsByUserId);
                if (res.data && res.data.success) {
                    setTransactions(res.data.data);
                } else {
                    setError('Không lấy được dữ liệu giao dịch.');
                }
            } catch (err) {
                setError('Lỗi khi lấy dữ liệu giao dịch.');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div className={cx('walletWrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Ví & Lịch sử giao dịch</h1>
                <p className={cx('subtitle')}>Quản lý các giao dịch thanh toán của bạn trên hệ thống</p>
            </div>
            {loading && <div className={cx('loading')}>Đang tải...</div>}
            {error && <div className={cx('error')}>{error}</div>}
            {!loading && !error && (
                <div className={cx('tableWrapper')}>
                    <table className={cx('walletTable')}>
                        <thead>
                            <tr>
                                <th>Mã giao dịch</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Loại giao dịch</th>
                                <th>Ngân hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={6} className={cx('noData')}>Không có giao dịch nào.</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{tx.id}</td>
                                        <td>{Number(tx.amount).toLocaleString('vi-VN')} VND</td>
                                        <td>
                                            <span className={cx('status', tx.status)}>
                                                {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                                            </span>
                                        </td>
                                        <td>{tx.transaction_date ? new Date(tx.transaction_date).toLocaleString('vi-VN') : ''}</td>
                                        <td>{tx.transaction_type}</td>
                                        <td>{tx.bank_code || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Wallet;  