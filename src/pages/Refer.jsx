import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, CheckCircle } from 'lucide-react';

export default function ReferPage() {
    const [copied, setCopied] = React.useState(false);
    // In a real app, this would be a unique referral link.
    // For now, it's the current window's URL.
    const referralLink = typeof window !== 'undefined' ? window.location.origin : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen">
            <div className="border-b border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                    <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                        Refer a Friend
                    </h1>
                    <p className="text-stone-600">
                        Share HEAUT and earn rewards.
                    </p>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-6 py-8">
                <Card className="text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
                        </div>
                        <CardTitle>Share the Gift of Reflection</CardTitle>
                        <CardDescription className="max-w-md mx-auto">
                            Invite your friends to join HEAUT. For every friend that signs up, you'll both receive bonus tokens to use for AI-powered insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg bg-stone-50">
                            <input 
                                type="text"
                                value={referralLink}
                                readOnly
                                className="flex-1 bg-transparent outline-none text-stone-700 px-2"
                            />
                            <Button onClick={copyToClipboard} size="sm">
                                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <p className="text-xs text-stone-500 mt-4">
                            (Reward system coming soon)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}