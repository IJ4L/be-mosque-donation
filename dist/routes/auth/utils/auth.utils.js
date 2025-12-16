import * as bcrypt from "bcrypt";
export class PasswordUtils {
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    static validatePasswordStrength(password) {
        const errors = [];
        if (!password) {
            errors.push("Password tidak boleh kosong");
            return { isValid: false, errors };
        }
        if (password.length < 6) {
            errors.push("Password minimal 6 karakter");
        }
        if (password.length > 100) {
            errors.push("Password maksimal 100 karakter");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
export class ValidationUtils {
    static validateLoginCredentials(credentials) {
        const errors = [];
        if (!credentials.identifier || credentials.identifier.trim() === "") {
            errors.push("Username atau nomor telepon harus diisi");
        }
        if (!credentials.password || credentials.password.trim() === "") {
            errors.push("Password harus diisi");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static validateUpdateUserData(userData) {
        const errors = [];
        if (!userData.username || userData.username.trim() === "") {
            errors.push("Username harus diisi");
        }
        if (!userData.phoneNumber || userData.phoneNumber.trim() === "") {
            errors.push("Nomor telepon harus diisi");
        }
        if (userData.username && userData.username.length < 3) {
            errors.push("Username minimal 3 karakter");
        }
        if (userData.username && userData.username.length > 50) {
            errors.push("Username maksimal 50 karakter");
        }
        if (userData.phoneNumber &&
            !this.isValidPhoneNumber(userData.phoneNumber)) {
            errors.push("Format nomor telepon tidak valid");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static validatePasswordUpdateData(passwordData) {
        const errors = [];
        if (!passwordData.currentPassword ||
            passwordData.currentPassword.trim() === "") {
            errors.push("Password saat ini harus diisi");
        }
        if (!passwordData.newPassword || passwordData.newPassword.trim() === "") {
            errors.push("Password baru harus diisi");
        }
        const passwordValidation = PasswordUtils.validatePasswordStrength(passwordData.newPassword);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            errors.push("Password baru harus berbeda dengan password saat ini");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static isValidPhoneNumber(phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        const phoneRegex = /^(\+?628|08)\d{8,11}$/;
        return phoneRegex.test(cleanPhone);
    }
}
export class ResponseUtils {
    static createSuccessResponse(message, data) {
        return {
            message,
            data,
        };
    }
    static createErrorResponse(message) {
        return {
            message,
            data: null,
        };
    }
    static createValidationErrorResponse(errors) {
        return {
            message: errors.join(", "),
            data: null,
        };
    }
}
export class TransformUtils {
    static removePasswordFromUser(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static sanitizeUserInput(input) {
        return input.trim();
    }
    static sanitizeLoginCredentials(credentials) {
        return {
            identifier: this.sanitizeUserInput(credentials.identifier),
            password: credentials.password, // Don't trim password as it might be intentional
        };
    }
    static sanitizeUpdateUserData(userData) {
        return {
            username: this.sanitizeUserInput(userData.username),
            phoneNumber: this.sanitizeUserInput(userData.phoneNumber),
        };
    }
}
