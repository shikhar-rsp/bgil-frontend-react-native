import type { 
    ImdLoginData, 
    MobileLoginData, 
    ForgotPasswordData, 
    ResetPasswordData,
    UserDetailsRequestData,
    GetUserDetailsResponse,
    ImitraLoginResponse,
    ForgotPasswordResponse,
} from '../entities/auth_entities';

/**
 * Interface definition for Authentication Repository.
 * Following Clean Architecture, the Domain layer defines the requirements.
 */
export interface IAuthRepository {
    loginWithImd(data: ImdLoginData): Promise<{ success: boolean; data?: ImitraLoginResponse }>;
    loginWithMobile(data: MobileLoginData): Promise<{ success: boolean; data?: unknown }>;
    generateOtp(data: ForgotPasswordData): Promise<{ success: boolean; data?: ForgotPasswordResponse }>;
    verifyOtp(otp: string): Promise<{ success: boolean; data?: unknown }>;
    verifyImdOtp(otp: string): Promise<{ success: boolean; data?: ImitraLoginResponse }>;
    resendImdOtp(): Promise<{ success: boolean; data?: ImitraLoginResponse }>;
    resetPassword(data: ResetPasswordData): Promise<{ success: boolean; data?: unknown }>;
    generateToken(): Promise<{ success: boolean; data?: unknown }>;
    getUserDetails(data: UserDetailsRequestData): Promise<{ success: boolean; data?: GetUserDetailsResponse }>;
}
