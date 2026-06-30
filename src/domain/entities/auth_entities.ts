export type ImdLoginData = {
    imdCode: string;
    password: string;
};

export type MobileLoginData = {
    mobileNumber: string;
};

export type ForgotPasswordData = {
    email: string;
};

export type ResetPasswordData = {
    password: string;
    confirmPassword: string;
};

export type UserDetailsRequestData = {
    agentCode?: string;
    mobNo?: string;
    email?: string;
    agentType: string;
};

export interface UserDetailsUser {
    imdCode: string;
    userId: string;
    mobNo: string;
    emailId: string;
}

export interface GetUserDetailsResponse {
    error: string;
    errorMessage: string;
    status: string | null;
    hasErrors: boolean | null;
    businessCorelationId: string;
    userList: UserDetailsUser[] | null;
    agentType: string | null;
}

export interface ImitraLoginPayload {
    webUserID: string;
    password: string;
    mobNo: string;
    emailId: string;
    source: string;
    otpValidate: string;
    agentCode: string;
    empCode: string;
}

export interface ForgotPasswordPayload {
    emailId: string;
    agentCode: string;
    agentType: string;
}

export interface ForgotPasswordResponse {
    error: string;
    errorMessage: string;
    status: string | null;
    hasErrors: boolean | null;
    businessCorelationId?: string;
    otpResponse?: ImitraOtpResponse | null;
}

export interface ImitraOtpResponse {
    otp: string | null;
    flag: string | null;
    status: string | null;
    errorCode: number | null;
    errorMessage: string | null;
}

export interface ImitraLoginResponse {
    error: string;
    errorMessage: string;
    status: string | null;
    hasErrors: boolean | null;
    businessCorelationId?: string;
    keyClockResponse?: unknown;
    userLoginStatus?: string | null;
    webUserID?: string;
    otpResponse?: ImitraOtpResponse | null;
}

export interface AuthState {
    isAuthenticated: boolean;
    user?: {
        persona: 'agent' | 'rm';
        mobileNumber?: string;
        email?: string;
    };
}
