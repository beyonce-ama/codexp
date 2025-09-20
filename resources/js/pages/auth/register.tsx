import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Users, Star, Code,ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, FormEventHandler } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'participant', // Hidden role field
    });

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
            <Head title="CODEXP AI: A Gamified Competitive Coding Web-Based Platform, Using AI-Generated Challenges and Real-Time Performance Analytics" />

            {/* Background & Grid */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#0f1a3f] to-[#03121f]" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-bounce" />
            </div>

            {/* Floating Dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(18)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-50 animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>
           {/* Home Button */}
            <div className="absolute top-6 left-6 z-10">
            <button
                type="button"
                onClick={() => window.location.href = route('home')}
                className="flex items-center space-x-2 text-cyan-300 hover:text-white hover:scale-105 transition-all text-sm font-semibold"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
            </button>
            </div>
            {/* Register Form */}
            <div className={`w-full max-w-md z-10 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <form onSubmit={submit} className="bg-[#0e0e1c]/90 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 space-y-6">
                    
                    {/* Title */}
                    <div className="text-center mb-4">
                        <div className="flex items-center justify-center mb-3">
                            <Code className="w-6 h-6 text-cyan-400 mr-2" />
                            <h1 className="text-xl font-bold text-white tracking-wide">PLAYER REGISTRATION</h1>
                        </div>
                        <p className="text-sm text-gray-400">Create your coding account and join the arena</p>
                    </div>

                    {/* Hidden Role */}
                    <input type="hidden" name="role" value="participant" />

                    {/* Name */}
                    <div>
                        <label className="block text-cyan-300 font-semibold text-sm mb-2 tracking-wide">USER NAME</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Jane Doe"
                            className="w-full bg-[#f8f9fa] text-gray-900 border-2 border-transparent rounded-xl px-4 py-3 focus:border-cyan-500 transition-all duration-300"
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-cyan-300 font-semibold text-sm mb-2 tracking-wide">EMAIL ADDRESS</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="you@email.com"
                                className="w-full bg-[#f8f9fa] text-gray-900 border-2 border-transparent rounded-xl px-4 py-3 focus:border-cyan-500 transition-all duration-300"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Star className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-cyan-300 font-semibold text-sm tracking-wide mb-2 block">PASSWORD</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Enter your password"
                                className="w-full bg-[#f8f9fa] text-gray-900 border-2 border-transparent rounded-xl px-4 py-3 focus:border-cyan-500 transition-all duration-300 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-cyan-500 transition"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-cyan-300 font-semibold text-sm tracking-wide mb-2 block">CONFIRM PASSWORD</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Repeat your password"
                                className="w-full bg-[#f8f9fa] text-gray-900 border-2 border-transparent rounded-xl px-4 py-3 focus:border-cyan-500 transition-all duration-300 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-cyan-500 transition"
                            >
                                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/40"
                    >
                        {processing ? 'CREATING...' : 'CREATE ACCOUNT'}
                    </button>

                    <div className="border-t border-gray-700/60 pt-6 text-center">
                        <p className="text-sm text-gray-400 mb-4">Already have an account?</p>
                        <button
                            type="button"
                            onClick={() => window.location.href = route('login')}
                            className="w-full bg-black/60 hover:bg-black/80 text-cyan-300 font-bold py-3 rounded-xl border border-gray-700 hover:border-cyan-500/60 transition flex items-center justify-center space-x-2"
                        >
                            <Users className="w-5 h-5" />
                            <span>LOGIN</span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-500">
                    <p>CODEXP AI | GAMIFIED CODING PLATFORM v2.0</p>
                    <p className="mt-1">© 2025 All rights reserved</p>
                </div>
            </div>
        </div>
    );
}
