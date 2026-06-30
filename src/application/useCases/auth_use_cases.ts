import type { IAuthRepository } from '../../domain/interfaces/auth_interfaces';
import type { 
    ImdLoginData, 
    MobileLoginData, 
    ForgotPasswordData, 
    ResetPasswordData,
    UserDetailsRequestData,
    GetUserDetailsResponse,
    ImitraLoginResponse,
    ForgotPasswordResponse,
} from '../../domain/entities/auth_entities';

/**
 * Factory that creates auth use cases with the given repository.
 * Follows Dependency Inversion: depends on IAuthRepository interface, not a concrete class.
 * Pure application logic — no UI concerns, no route strings, no framework imports.
 */
export const createAuthUseCases = (repository: IAuthRepository) => ({
    loginWithImd: async (data: ImdLoginData) => {
        console.log('Application: loginWithImd');
        const result = await repository.loginWithImd(data);
        return {
            success: result.success,
            data: result.data as ImitraLoginResponse | undefined,
            message: result.data?.errorMessage,
        };
    },

    loginWithMobile: async (data: MobileLoginData) => {
        console.log('Application: loginWithMobile');
        const result = await repository.loginWithMobile(data);
        return { success: result.success };
    },

    generateOtp: async (data: ForgotPasswordData) => {
        console.log('Application: generateOtp');
        const result = await repository.generateOtp(data);
        return {
            success: result.success,
            data: result.data as ForgotPasswordResponse | undefined,
            message: result.data?.errorMessage,
        };
    },

    verifyOtp: async (otp: string, isRecovery: boolean) => {
        console.log('Application: verifyOtp');
        const result = isRecovery
            ? await repository.verifyOtp(otp)
            : await repository.verifyImdOtp(otp);
        const data = result.data as ImitraLoginResponse | undefined;
        const message = data?.errorMessage
            || data?.otpResponse?.flag
            || null;
        return {
            success: result.success,
            message,
        };
    },

    resetPassword: async (data: ResetPasswordData) => {
        console.log('Application: resetPassword');
        const result = await repository.resetPassword(data);
        return { success: result.success };
    },

    generateToken: async () => {
        console.log('Application: generateToken');
        const result = await repository.generateToken();
        return { success: result.success, data: result.data };
    },

    getUserDetails: async (data: UserDetailsRequestData) => {
        console.log('Application: getUserDetails');
        const result = await repository.getUserDetails(data);
        return { success: result.success, data: result.data as GetUserDetailsResponse | undefined };
    },

    resendImdOtp: async () => {
        console.log('Application: resendImdOtp');
        const result = await repository.resendImdOtp();
        return {
            success: result.success,
            data: result.data as ImitraLoginResponse | undefined,
            message: result.data?.errorMessage,
        };
    },
});
