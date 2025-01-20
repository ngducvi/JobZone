export const calculateTimeSinceCreation = (createdAt) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();

    const diffTime = Math.abs(currentDate - createdDate);
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears >= 1) {
        return `${diffYears} năm trước`;
    } else if (diffMonths >= 1) {
        return `${diffMonths} tháng trước`;
    } else if (diffDays >= 1) {
        return `${diffDays} ngày trước`;
    } else if (diffHours >= 1) {
        return `${diffHours} giờ trước`;
    } else if (diffMinutes >= 1) {
        return `${diffMinutes} phút trước`;
    } else {
        return `${diffSeconds} giây trước`;
    }
};
