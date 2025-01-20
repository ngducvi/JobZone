class Common {
    static getErrorMessage(error) {
        if (error.response) {
            return error.response.data.message;
        }
        return error.message;
    }
    static calculateTokens(inputText) {
        if (typeof inputText !== "string" || inputText.trim() === "") {
            console.error("Invalid input: inputText must be a non-empty string.");
            return 0;
        }

        const tokenRegex = /[\w'-]+|[.,!?;:()]/g; // Matches words and punctuation
        const tokens = inputText.match(tokenRegex);
        return tokens ? tokens.length : 0;
    }
    static regexEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
    static regexPhone(phone) {
        const regex = /^\d{10}$/;
        return regex.test(phone);
    }
    static regexStrongPassword(password) {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return regex.test(password);
    }
    static checkValidUserInfo(user) {
        if (!user.email || !user.password || !user.username || !user.phone) {
            return {
                message: "Username, email, name, phone, and password are required",
                isValid: false,
            };
        }
        if (!this.regexStrongPassword(user.password)) {
            return {
                message: "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, and one number",
                isValid: false
            }
        }

        if (!this.regexEmail(user.email)) {
            return {
                message: "Invalid email",
                isValid: false,
            }
        }
        if (user.phone && !this.regexPhone(user.phone)) {
            return {
                message: "Invalid phone number",
                isValid: false,
            }
        }
        return {
            message: "Valid",
            isValid: true,
        };
    }
    static generateToken(length = 36) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }
        return token;
    }
}
module.exports = Common;