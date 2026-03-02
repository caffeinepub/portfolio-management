import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, BarChart3, TrendingUp, Shield, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const { login, loginStatus } = useInternetIdentity();
    const isLoggingIn = loginStatus === 'logging-in';

    const features = [
        { icon: <TrendingUp size={18} />, title: 'Track All Assets', desc: 'Indian equity, US stocks, PF, NPS, gold, FDs & mutual funds' },
        { icon: <PieChart size={18} />, title: 'Visual Allocation', desc: 'Interactive pie chart showing your portfolio breakdown' },
        { icon: <Shield size={18} />, title: 'Secure & Private', desc: 'Your data is stored securely on the Internet Computer' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-card">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <BarChart3 size={18} className="text-primary-foreground" />
                        </div>
                        <span className="text-base font-bold text-foreground tracking-tight">WealthTrack</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        {/* Left: Hero */}
                        <div className="space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                                    <BarChart3 size={12} />
                                    Portfolio Management
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                                    Manage your wealth,<br />
                                    <span className="text-primary">all in one place</span>
                                </h1>
                                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                                    Track your Indian and global investments, calculate net worth, and visualize your asset allocation with a clean, professional dashboard.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary">{feature.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Login Card */}
                        <div className="bg-card rounded-2xl border border-border shadow-card p-8">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <BarChart3 size={28} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Welcome to WealthTrack</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Sign in to access your personal portfolio dashboard
                                </p>
                            </div>

                            <Button
                                onClick={login}
                                disabled={isLoggingIn}
                                className="w-full gap-2 h-11 text-sm font-semibold"
                                size="lg"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In to Continue'
                                )}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center mt-4">
                                Secured by Internet Identity — no passwords required
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-border bg-card">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">WealthTrack © {new Date().getFullYear()}</span>
                    <p className="text-xs text-muted-foreground">
                        Built with <span className="text-destructive">♥</span> using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'portfolio-management')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
