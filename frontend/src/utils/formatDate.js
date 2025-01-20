// utils.js

/**
 * Chuyển đổi định dạng ngày từ ISO 8601 thành định dạng "15-9".
 * 
 * @param {string} isoDate - Ngày ở định dạng ISO 8601 (VD: "2024-09-15T00:00:00.000Z").
 * @returns {string} - Ngày ở định dạng "15-9".
 */
function formatDate(isoDate) {
    const date = new Date(isoDate);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng bắt đầu từ 0 nên cần cộng thêm 1

    return `${day}-${month}`;
}

export default formatDate;
