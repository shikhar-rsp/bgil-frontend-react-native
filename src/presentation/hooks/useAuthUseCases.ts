import { useLoader } from '../context/LoaderContext';
import { createAuthUseCases } from '../../application/useCases/auth_use_cases';
import { authRepository } from '../../infrastructure/repository/auth_repository';
import type {
    ImdLoginData,
    MobileLoginData,
    ForgotPasswordData,
    ResetPasswordData,
    UserDetailsRequestData,
} from '../../domain/entities/auth_entities';

/**
 * Presentation-layer hook that wires the auth use cases with the injected repository
 * and wraps every call with the global loader.
 * Keeps the application layer free of UI concerns (clean architecture).
 */
export const useAuthUseCases = () => {
    const { withLoader } = useLoader();
    const authUseCases = createAuthUseCases(authRepository);

    return {
        loginWithImd: (data: ImdLoginData) =>
            withLoader(() => authUseCases.loginWithImd(data)),

        loginWithMobile: (data: MobileLoginData) =>
            withLoader(() => authUseCases.loginWithMobile(data)),

        generateOtp: (data: ForgotPasswordData) =>
            withLoader(() => authUseCases.generateOtp(data)),

        verifyOtp: (otp: string, isRecovery: boolean) =>
            withLoader(() => authUseCases.verifyOtp(otp, isRecovery)),

        resetPassword: (data: ResetPasswordData) =>
            withLoader(() => authUseCases.resetPassword(data)),

        generateToken: () =>
            withLoader(() => authUseCases.generateToken()),

        getUserDetails: (data: UserDetailsRequestData) =>
            withLoader(() => authUseCases.getUserDetails(data)),
        
        resendImdOtp: () =>
            withLoader(() => authUseCases.resendImdOtp()),
    };
};
