"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signupSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required().messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name cannot be an empty field',
        'string.min': 'Name should have a minimum length of {#limit}',
        'any.required': 'Name is a required field'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is a required field'
    })
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is a required field'
    })
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    })
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'any.required': 'Token is required'
    }),
    newPassword: joi_1.default.string().min(6).required().messages({
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is a required field'
    })
});
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required().messages({
        'any.required': 'Old Password is required'
    }),
    newPassword: joi_1.default.string().min(6).required().messages({
        'string.min': 'New Password should have a minimum length of {#limit}',
        'any.required': 'New Password is required'
    })
});
