import { Schema } from 'mongoose';
import * as validator from 'validator';

export const ForgotPasswordSchema = new Schema({
    email: {
        required: [true, 'EMAIL_IS_BLANK'],
        type: String,
        require: true
    },
    verification: {
        type: String,
        validate: {
            validator: validator.default.isUUID,
            message: 'INVALID_VERIFICATION_UUID',
        },
    },
    firstUsed: {
        type: Boolean,
        default: false,
    },
    finalUsed: {
        type: Boolean,
        default: false,
    },
    expires: {
        type: Date,
        required: true, // Corregido a 'required'
    },
    ip: {
        type: String,
        required: true, // Corregido a 'required'
    },
    browser: {
        type: String,
        required: true, // Corregido a 'required'
    },
    country: {
        type: String,
        required: true, // Corregido a 'required'
    },
    ipChanged: {
        type: String,
    },
    browserChanged: {
        type: String,
    },
    countryChanged: {
        type: String,
    },
},
    {
        versionKey: false,
        timestamps: true,
    });
