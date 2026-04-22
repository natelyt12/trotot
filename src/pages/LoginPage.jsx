import { useState } from 'react';
import { supabase } from '../lib/supabase';

/* ============================================
   LoginPage – Connected to Supabase Auth
   ============================================ */
export default function LoginPage({ navigate }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        setLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;

            // Successful login
            navigate('home');
        } catch (err) {
            // Dịch thông báo lỗi sang tiếng Việt
            let friendlyMessage = err.message;
            if (err.message === 'Invalid login credentials') {
                friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
            } else if (err.message === 'Email not confirmed') {
                friendlyMessage = 'Vui lòng xác nhận email trước khi đăng nhập.';
            }
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-linear-to-br from-stone-900 via-stone-800 to-[#3c2a1e]">
            {/* Decorative blobs */}
            <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-[80px] -left-[80px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(217,119,6,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('home')}
                        className="bg-transparent border-none cursor-pointer inline-flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 bg-linear-to-br from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(217,119,6,0.4)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-[1.75rem] text-white tracking-tight font-heading">
                            Trọ<span className="text-amber-500">Tốt</span>
                        </span>
                    </button>
                    <p className="text-stone-500 text-[0.9rem] mt-2 font-sans">
                        Đăng nhập để tiếp tục tìm phòng
                    </p>
                </div>

                {/* Card */}
                {/* Card */}
                <div className="bg-white/95 backdrop-blur-[20px] rounded-[1.25rem] p-8 border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <h1 className="text-[1.4rem] font-bold text-stone-900 mb-6 text-center font-heading">
                        Đăng nhập
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-300 rounded-[0.625rem] py-2.5 px-3.5 mb-4 text-red-600 text-[0.875rem] flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="email" className="form-label">Email</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    className="input pl-10!"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input pl-10! pr-10!"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-stone-400 flex"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="bg-transparent border-none text-amber-600 text-[0.85rem] font-semibold cursor-pointer font-sans transition-colors duration-200 hover:text-amber-700">
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary rounded-md! ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-[0.8rem] text-stone-400 font-medium">hoặc</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    <p className="text-center text-[0.875rem] text-stone-600">
                        Chưa có tài khoản?{' '}
                        <button
                            onClick={() => navigate('register')}
                            className="bg-transparent border-none text-amber-600 font-bold cursor-pointer font-sans text-[0.875rem] transition-colors duration-200 hover:text-amber-700"
                        >
                            Đăng ký ngay
                        </button>
                    </p>

                    {/* Back Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-1.5 bg-transparent border-none text-stone-500 text-[0.875rem] font-semibold cursor-pointer transition-all duration-200 font-sans py-2 px-4 rounded-lg hover:text-stone-900 hover:bg-stone-100"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
