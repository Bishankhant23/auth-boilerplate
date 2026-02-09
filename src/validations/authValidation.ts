import Joi from 'joi';

export const signupSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name cannot be an empty field',
        'string.min': 'Name should have a minimum length of {#limit}',
        'any.required': 'Name is a required field'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is a required field'
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is a required field'
    })
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is a required field'
    })
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Token is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is a required field'
    })
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'any.required': 'Old Password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New Password should have a minimum length of {#limit}',
        'any.required': 'New Password is required'
    })
});
