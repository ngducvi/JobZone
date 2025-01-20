export const handleInputBlur = (value, setter, type) => {

    if (!value && type==="currentPassword") {
        setter((prev) => ({ ...prev, error: 'Vui lòng nhập mật khẩu hiện tại' }));
        return;
    }

    if (!value) {
        setter((prev) => ({ ...prev, error: 'Trường này không được để trống' }));
        return;
    }

    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setter((prev) => ({ ...prev, error: 'Email không hợp lệ' }));
        }
    }

    if (type === 'password' && value.length < 6) {
        setter((prev) => ({ ...prev, error: 'Mật khẩu phải có ít nhất 6 kí tự' }));
    }
};
