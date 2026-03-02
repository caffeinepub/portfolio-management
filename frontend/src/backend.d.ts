import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Portfolio {
    fd: number;
    pf: number;
    nps: number;
    rsu: number;
    mutualFunds: number;
    usStocks: number;
    interest: number;
    homeLoan: number;
    esop: number;
    gold: number;
    indianEquity: number;
    dividends: number;
}
export interface MonthlySnapshot {
    fd: number;
    pf: number;
    nps: number;
    rsu: RsusOrEsop;
    goldRate: number;
    mutualFunds: number;
    month: bigint;
    usStocks: number;
    interest: number;
    homeLoan: number;
    esop: RsusOrEsop;
    silverGrams: number;
    year: bigint;
    goldGrams: number;
    silverRate: number;
    indianEquity: number;
    dividends: number;
}
export interface UserProfile {
    name: string;
}
export interface RsusOrEsop {
    stockName: string;
    rate: number;
    quantity: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboard(): Promise<{
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
    }>;
    getMonthlySnapshots(): Promise<Array<MonthlySnapshot>>;
    getPortfolio(): Promise<Portfolio>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAuthenticated(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMonthlySnapshot(snapshot: MonthlySnapshot): Promise<void>;
    updatePortfolio(portfolio: Portfolio): Promise<void>;
}
