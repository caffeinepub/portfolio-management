import React, { useState } from 'react';
import { Loader2, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProfileSetupPageProps {
    onComplete: () => void;
}

export default function ProfileSetupPage({ onComplete }: ProfileSetupPageProps) {
    const [name, setName] = useState('');
    const saveProfile = useSaveCallerUserProfile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await saveProfile.mutateAsync({ name: name.trim() });
            toast.success(`Welcome, ${name.trim()}!`);
            onComplete();
        } catch {
            toast.error('Failed to save profile. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-2xl border border-border shadow-card p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <User size={28} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Set Up Your Profile</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tell us your name to personalize your portfolio dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={!name.trim() || saveProfile.isPending}
                            className="w-full gap-2 h-11"
                        >
                            {saveProfile.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Continue to Dashboard'
                            )}
                        </Button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <BarChart3 size={12} className="text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">WealthTrack</span>
                </div>
            </div>
        </div>
    );
}
