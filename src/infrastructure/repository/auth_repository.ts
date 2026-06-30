import type { IAuthRepository } from '../../domain/interfaces/auth_interfaces';
import type { 
    ImdLoginData, 
    MobileLoginData, 
    ForgotPasswordData, 
    ResetPasswordData,
    UserDetailsRequestData,
    GetUserDetailsResponse,
    ImitraLoginPayload,
    ImitraLoginResponse,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
} from '../../domain/entities/auth_entities';
import axios from 'axios';
import api from '../networkservice/core/api';
import { generateCorrelationId, encrypt, generateHmacAsync, decrypt } from '../../utils/crypto';
import { getTokenValue, setTokenValue } from '../../utils/tokenStorage';
import { setItem } from '../../utils/storage';
import { ENV } from '../../config/env';


type LoginResponse = {
    hasError?: boolean;
    success?: boolean;
};

type OtpResponse = {
    hasError?: boolean;
    otp?: string;
};

type PasswordResponse = {
    hasError?: boolean;
    message?: string;
};

type TokenGenerationResponse = {
    hasError?: boolean;
    token?: string;
    expires_in?: number;
};

type EncryptedResponse = {
    payload: string;
};

const isSuccessfulResponse = (response: { hasError?: boolean; hasErrors?: boolean } | null | undefined) => {
    return response?.hasError !== true && response?.hasErrors !== true;
};

const getEncryptionKey = () =>
    (ENV.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef').trim();

const getEncryptionIv = () =>
    (ENV.ENCRYPTION_IV || '0123456789abcdef').trim();

const getHmacKey = (endpoint: 'getImitraLoginDtls' | 'getUserDetails' | 'forgotPassword') => {
    const hmacKeys: Record<string, string> = {
        getImitraLoginDtls: 'h@i%KA@LG$L&18#%$)',
        getUserDetails: 'n&i(Ms*#G(P*as!4@3',
        forgotPassword: 'h@i(MT*FG(P*15#41)',
    };
    return hmacKeys[endpoint] || '0123456789abcdef0123456789abcdef';
};

// IMD password is held only in module memory (cleared on page unload — never persisted to storage)
let _imdPasswordMemory: string | null = null;

const IMD_LOGIN_MOBILE_NUMBER = '8087241849';
const IMD_LOGIN_EMAIL_ID = 'nilesh.borse@bajajgeneral.com';


/**
 * Infrastructure Layer - Auth Repository Implementation
 * This class implements the IAuthRepository interface and handles the actual data fetching logic.
 */
export class AuthRepository implements IAuthRepository {
    private async submitImitraLoginDetails(payloadObject: ImitraLoginPayload) {
        const correlationId = generateCorrelationId();
        const authToken = getTokenValue('authToken');
        const payloadJson = JSON.stringify(payloadObject);
        const encryptionKey = getEncryptionKey();
        const encryptionIv = getEncryptionIv();
        const hmacKey = getHmacKey('getImitraLoginDtls');
        const encryptedPayload = encrypt(encryptionKey, payloadJson, encryptionIv);
        const hmacSignature = await generateHmacAsync(payloadObject, hmacKey);

        const response = await api.post('BagicProperty/getImitraLoginDtls',
            { payload: encryptedPayload },
            {
                headers: {
                    'BusinessCorelationId': correlationId,
                    'Auth': `Bearer ${authToken}`,
                    'Authorization': `Bearer ${authToken}`,
                    'hmac': `hmc ${hmacSignature}`,
                    'Content-Type': 'application/json',
                }
            }
        ) as EncryptedResponse;

        const decryptedPayload = decrypt(encryptionKey, response.payload, encryptionIv);
        const parsedResponse = JSON.parse(decryptedPayload) as ImitraLoginResponse;
        const isSuccess = parsedResponse.hasErrors !==  true && parsedResponse.error !== '1';

        return { success: isSuccess, data: parsedResponse };
    }

    private getImitraLoginBasePayload(password: string, imdCode: string, mode: 'login' | 'verifyOtp' = 'login') {
        if (mode === 'verifyOtp') {
            return {
                webUserID: '',
                password: '',
                mobNo: IMD_LOGIN_MOBILE_NUMBER,
                emailId: IMD_LOGIN_EMAIL_ID,
                source: '',
                otpValidate: '',
                agentCode: '',
                empCode: '',
            } satisfies ImitraLoginPayload;
        }

        // Use IMD code directly from user input
        return {
            webUserID: imdCode,
            password,
            mobNo: IMD_LOGIN_MOBILE_NUMBER,
            emailId: IMD_LOGIN_EMAIL_ID,
            source: '',
            otpValidate: '',
            agentCode: '',
            empCode: '',
        } satisfies ImitraLoginPayload;
    }

    async loginWithImd(data: ImdLoginData) {
        try {
            const payloadObject = this.getImitraLoginBasePayload(data.password, data.imdCode);

            const result = await this.submitImitraLoginDetails(payloadObject);

            if (result.success) {
                _imdPasswordMemory = data.password;
            }

            return result;
        } catch (error) {
            console.error('Error logging in with IMD:', error);
            throw error;
        }
    }

    async loginWithMobile(data: MobileLoginData) {
        const response = await api.post('/auth/login/mobile', data) as LoginResponse;
        return  {success :  isSuccessfulResponse(response), data : response}
        
    }

    async generateOtp(data: ForgotPasswordData) {
        try {
            const correlationId = generateCorrelationId();
            const authToken = getTokenValue('authToken');

            const payloadObject: ForgotPasswordPayload = {
                emailId: data.email,
                agentCode: '',
                agentType: 'AGENT_ID',
            };

            const encryptionKey = getEncryptionKey();
            const encryptionIv = getEncryptionIv();
            const encryptedPayload = encrypt(encryptionKey, JSON.stringify(payloadObject), encryptionIv);
            const hmacKey = getHmacKey('forgotPassword');
            const hmacSignature = await generateHmacAsync(payloadObject, hmacKey);

            const response = await api.post('BagicProperty/forgotPassword',
                { payload: encryptedPayload },
                {
                    headers: {
                        'BusinessCorelationId': correlationId,
                        'Authorization': `Bearer ${authToken}`,
                        'hmac': `hmc ${hmacSignature}`,
                        'Content-Type': 'application/json',
                    }
                }
            ) as EncryptedResponse;

            const decryptedPayload = decrypt(encryptionKey, response.payload, encryptionIv);
            const parsedResponse = JSON.parse(decryptedPayload) as ForgotPasswordResponse;
            const isSuccess = parsedResponse.hasErrors !== true && parsedResponse.error !== '1';

            return { success: isSuccess, data: parsedResponse };
        } catch (error) {
            console.error('Error generating OTP for forgot password:', error);
            throw error;
        }
    }

    async verifyOtp(otp: string) {
        const response = await api.post('/auth/otp/verify', { otp }) as OtpResponse;
        return  {success :  isSuccessfulResponse(response), data : response}
    }

    async verifyImdOtp(otp: string) {
        try {
            const storedPassword = _imdPasswordMemory;

            if (!storedPassword) {
                return {
                    success: false,
                    data: {
                        error: '1',
                        errorMessage: 'Login session expired. Please enter IMD details again.',
                        status: null,
                        hasErrors: true,
                    } satisfies ImitraLoginResponse,
                };
            }

            const payloadObject = this.getImitraLoginBasePayload(storedPassword, 'verifyOtp');

            if (!payloadObject) {
                return {
                    success: false,
                    data: {
                        error: '1',
                        errorMessage: 'User details not found. Please verify IMD code again.',
                        status: null,
                        hasErrors: true,
                    } satisfies ImitraLoginResponse,
                };
            }

            const result = await this.submitImitraLoginDetails({
                ...payloadObject,
                otpValidate: otp,
            });

            if (result.success) {
                _imdPasswordMemory = null;
            }

            return result;
        } catch (error) {
            console.error('Error verifying IMD OTP:', error);
            throw error;
        }
    }

    async resendImdOtp() {
        try {
            const storedPassword = _imdPasswordMemory;

            if (!storedPassword) {
                return {
                    success: false,
                    data: {
                        error: '1',
                        errorMessage: 'Login session expired. Please enter IMD details again.',
                        status: null,
                        hasErrors: true,
                    } satisfies ImitraLoginResponse,
                };
            }

            const payloadObject = this.getImitraLoginBasePayload(storedPassword, 'login');

            if (!payloadObject) {
                return {
                    success: false,
                    data: {
                        error: '1',
                        errorMessage: 'User details not found. Please verify IMD code again.',
                        status: null,
                        hasErrors: true,
                    } satisfies ImitraLoginResponse,
                };
            }

            return await this.submitImitraLoginDetails(payloadObject);
        } catch (error) {
            console.error('Error resending IMD OTP:', error);
            throw error;
        }
    }

    async resetPassword(data: ResetPasswordData) {
        const response = await api.post('/auth/password/reset', data) as PasswordResponse;
        return  {success :  isSuccessfulResponse(response), data : response}
    }

    async generateToken() {
        const correlationId = generateCorrelationId();
        const response = await axios.post(`${ENV.API_BASE_URL}/BagicProperty/token`, {}, {
            headers: {
                'BusinessCorelationId': correlationId,
                'Content-Type': 'application/json',
            }
        }) as { data: TokenGenerationResponse };
        
        const responseData = response.data;
        const isSuccess = isSuccessfulResponse(responseData)
        if (isSuccess && responseData.token) {
            setTokenValue('authToken', responseData.token);
            setTokenValue('tokenExpiresIn', String(responseData.expires_in ?? ''));
        }
        
        return  {success :  isSuccess, data : responseData}
    }
    async getUserDetails(data: UserDetailsRequestData) {
        try {
            const correlationId = generateCorrelationId();
            const authToken = getTokenValue('authToken');
            
            // Create payload object
            const payloadObject = {
                agentCode: data.agentCode,
                agentType: data.agentType,
                mobNo: data.mobNo || ''
                
            };
            
            // JSON stringify the payload
            const payloadJson = JSON.stringify(payloadObject);
            console.log('Payload JSON:', payloadJson);
            
            // Encrypt the payload (using a 32-char key and 16-char IV from environment or defaults)
            const encryptionKey = getEncryptionKey();
            const encryptionIv = getEncryptionIv();
            
            const encryptedPayload = encrypt(encryptionKey, payloadJson, encryptionIv);
            console.log('Encrypted Payload:', encryptedPayload);
            
            // Generate HMAC for the plaintext payload string
            const hmacKey = getHmacKey('getUserDetails');
            const hmacSignature = await generateHmacAsync(payloadObject, hmacKey);
            console.log('HMAC Signature:', hmacSignature);
            
            // Make the API request and decrypt the business payload before returning it.
            const response = await api.post('BagicProperty/getUserDetails',
                { payload: encryptedPayload },
                {
                    headers: {
                        'BusinessCorelationId': correlationId,
                        'Authorization': `Bearer ${authToken}`,
                        'hmac': `hmc ${hmacSignature}`,
                        'Content-Type': 'application/json',
                    }
                }
            ) as EncryptedResponse;

            const decryptedPayload = decrypt(encryptionKey, response.payload, encryptionIv);
            const parsedResponse = JSON.parse(decryptedPayload) as GetUserDetailsResponse;
            const isSuccess = parsedResponse.hasErrors !== true && parsedResponse.error !== '1';

            if (isSuccess) {
                await setItem('userList', JSON.stringify(parsedResponse.userList ?? []));
            }
            
            return {
                success: isSuccess,
                data: parsedResponse,
            };
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    }}

// Export a singleton instance
export const authRepository = new AuthRepository();
