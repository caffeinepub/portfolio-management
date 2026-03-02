import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, BarChart3, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
    children: React.ReactNode;
    userName?: string | null;
}

function Header({ userName }: { userName?: string | null }) {
    const { login, clear, loginStatus, identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
        } else {
            try {
                await login();
            } catch (error: unknown) {
                if (error instanceof Error && error.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => login(), 300);
                }
            }
        }
    };

    const initials = userName
        ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <BarChart3 size={18} className="text-primary-foreground" />
                    </div>
                    <div>
                        <span className="text-base font-bold text-foreground tracking-tight">WealthTrack</span>
                        <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Portfolio Manager</span>
                    </div>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 h-9 px-3">
                                    <Avatar className="w-7 h-7">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {userName || 'My Portfolio'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-foreground">{userName || 'Portfolio User'}</p>
                                    <p className="text-xs text-muted-foreground">Signed in</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleAuth} className="text-destructive gap-2">
                                    <LogOut size={14} />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            onClick={handleAuth}
                            disabled={isLoggingIn}
                            size="sm"
                            className="gap-2"
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <User size={14} />
                                    Sign In
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

function Footer() {
    const appId = encodeURIComponent(window.location.hostname || 'portfolio-management');
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <BarChart3 size={12} className="text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        WealthTrack © {year}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Built with{' '}
                    <span className="text-destructive">♥</span>
                    {' '}using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                    >
                        caffeine.ai
                    </a>
                </p>
            </div>
        </footer>
    );
}

export default function Layout({ children, userName }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header userName={userName} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
