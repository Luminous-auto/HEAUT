
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle, Copy, Shield, Phone, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        username: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        ai_access_authorized: false,
        is_helper: false,
        helper_roles: [],
        helper_bio: '',
        helper_availability: true,
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me(),
        retry: false,
    });

    // Show demo content if not authenticated (for static landing page)
    const isDemoMode = !user && !isLoadingUser;
    const displayUser = user || (isDemoMode ? {
        email: 'demo@example.com',
        id: 'demo-user-id',
        username: 'Demo User'
    } : null);

    useEffect(() => {
        if (user && !isDemoMode) {
            setFormData({
                username: user.username || '',
                emergency_contact_name: user.emergency_contact_name || '',
                emergency_contact_phone: user.emergency_contact_phone || '',
                emergency_contact_relationship: user.emergency_contact_relationship || '',
                ai_access_authorized: user.ai_access_authorized || false,
                is_helper: user.is_helper || false,
                helper_roles: user.helper_roles || [],
                helper_bio: user.helper_bio || '',
                helper_availability: user.helper_availability !== undefined ? user.helper_availability : true,
            });
        }
    }, [user, isDemoMode]);

    const updateProfileMutation = useMutation({
        mutationFn: (profileData) => base44.auth.updateMe(profileData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        },
        onError: (error) => {
            console.error("Failed to update profile:", error);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleHelperRoleToggle = (role) => {
        setFormData(prev => ({
            ...prev,
            helper_roles: prev.helper_roles.includes(role)
                ? prev.helper_roles.filter(r => r !== role)
                : [...prev.helper_roles, role]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const helperRoleOptions = [
        { value: 'counselor', label: 'Counselor' },
        { value: 'social_worker', label: 'Social Worker' },
        { value: 'writer', label: 'Writer' },
        { value: 'life_coach', label: 'Life Coach' },
        { value: 'peer_support', label: 'Peer Support' },
        { value: 'other', label: 'Other' },
    ];

    if (isLoadingUser) {
        return (
            <div className="min-h-screen">
                <div className="border-b border-stone-200 bg-white">
                    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                         <Skeleton className="h-10 w-1/3 mb-2" />
                         <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-1/4 mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!displayUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Please sign in to view your profile.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen">
            <div className="border-b border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                    <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                        Your Profile
                    </h1>
                    <p className="text-stone-600">
                        Manage your account details and preferences.
                    </p>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>This information will be displayed on your profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isDemoMode && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800">
                                        This is a demo view. Sign in to access your actual profile.
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="font-medium text-stone-700 text-sm">Email Address</label>
                                <Input value={displayUser.email} readOnly disabled className="bg-stone-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="font-medium text-stone-700 text-sm">System ID</label>
                                <div className="flex items-center gap-2">
                                    <Input value={displayUser.id} readOnly disabled className="bg-stone-100" />
                                    <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(displayUser.id)}>
                                        {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="username" className="font-medium text-stone-700 text-sm">Username</label>
                                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="A unique username" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                                Emergency Contact
                            </CardTitle>
                            <CardDescription>Contact information for emergency situations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="emergency_contact_name" className="font-medium text-stone-700 text-sm">Contact Name</label>
                                <Input 
                                    id="emergency_contact_name" 
                                    name="emergency_contact_name" 
                                    value={formData.emergency_contact_name} 
                                    onChange={handleInputChange} 
                                    placeholder="Full name of emergency contact" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="emergency_contact_phone" className="font-medium text-stone-700 text-sm">Phone Number</label>
                                <Input 
                                    id="emergency_contact_phone" 
                                    name="emergency_contact_phone" 
                                    value={formData.emergency_contact_phone} 
                                    onChange={handleInputChange} 
                                    placeholder="+1 (555) 123-4567" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="emergency_contact_relationship" className="font-medium text-stone-700 text-sm">Relationship</label>
                                <Input 
                                    id="emergency_contact_relationship" 
                                    name="emergency_contact_relationship" 
                                    value={formData.emergency_contact_relationship} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., spouse, parent, friend" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                                AI Authorization
                            </CardTitle>
                            <CardDescription>
                                Control whether the AI can access your personal information to provide better assistance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium text-stone-900">Allow AI Access to Personal Information</p>
                                    <p className="text-sm text-stone-600">
                                        When enabled, the AI can access your profile information (including emergency contact) to provide personalized support during conversations.
                                    </p>
                                </div>
                                <Switch 
                                    checked={formData.ai_access_authorized}
                                    onCheckedChange={(checked) => handleSwitchChange('ai_access_authorized', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                                Helper Profile
                            </CardTitle>
                            <CardDescription>
                                Volunteer to support others in the HEAUT community.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium text-stone-900">I want to help others</p>
                                    <p className="text-sm text-stone-600">
                                        Make yourself available to support other users as a counselor, peer supporter, or mentor.
                                    </p>
                                </div>
                                <Switch 
                                    checked={formData.is_helper}
                                    onCheckedChange={(checked) => handleSwitchChange('is_helper', checked)}
                                />
                            </div>

                            {formData.is_helper && (
                                <>
                                    <div className="space-y-3">
                                        <label className="font-medium text-stone-700 text-sm">My Roles</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {helperRoleOptions.map(option => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={option.value}
                                                        checked={formData.helper_roles.includes(option.value)}
                                                        onCheckedChange={() => handleHelperRoleToggle(option.value)}
                                                    />
                                                    <label
                                                        htmlFor={option.value}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="helper_bio" className="font-medium text-stone-700 text-sm">
                                            Bio (How can you help?)
                                        </label>
                                        <Textarea
                                            id="helper_bio"
                                            name="helper_bio"
                                            value={formData.helper_bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell others about your experience and how you can support them..."
                                            className="h-24"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium text-stone-900">Currently Available</p>
                                            <p className="text-sm text-stone-600">
                                                Toggle your availability to accept new connections.
                                            </p>
                                        </div>
                                        <Switch 
                                            checked={formData.helper_availability}
                                            onCheckedChange={(checked) => handleSwitchChange('helper_availability', checked)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardFooter className="flex justify-end pt-6">
                            <Button 
                                type="submit" 
                                disabled={updateProfileMutation.isPending || isSuccess || isDemoMode} 
                                className="bg-stone-900 hover:bg-stone-800"
                            >
                                {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isSuccess && <CheckCircle className="w-4 h-4 mr-2" />}
                                {isDemoMode ? 'Sign in to Save' : (isSuccess ? 'Saved!' : 'Save Changes')}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
