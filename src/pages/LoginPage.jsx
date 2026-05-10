import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.jsx';

/* ============================================
   LoginPage – Flat design, amber palette
   ============================================ */
export default function LoginPage({ navigate }) {
    const [view, setView] = useState('login'); // 'login' or 'forgot-password'
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
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });
            if (authError) throw authError;
            navigate('home');
        } catch (err) {
            let msg = err.message;
            if (msg === 'Invalid login credentials')
                msg = 'Email hoặc mật khẩu không chính xác.';
            else if (msg === 'Email not confirmed')
                msg = 'Vui lòng xác thực tài khoản trước khi đăng nhập.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-stone-900 font-quicksand">

            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-out]">
                    <button
                        onClick={() => navigate('home')}
                        className="bg-transparent border-none cursor-pointer inline-flex flex-col items-center gap-3"
                    >
                        <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain rounded-lg" />
                        <span className="flex items-baseline">
                            <span
                                className="font-semibold text-[2rem] text-white tracking-tight"
                                style={{ fontFamily: 'var(--font-heading)' }}
                            >
                                Trọ
                            </span>
                            <span
                                className="text-amber-500 text-[2.5rem] font-bold ml-1"
                                style={{ fontFamily: 'var(--font-script)' }}
                            >
                                Tốt
                            </span>
                        </span>
                    </button>
                    <p className="text-stone-400 text-sm mt-2">
                        {view === 'login' ? 'Đăng nhập để tiếp tục tìm phòng' : 'Khôi phục quyền truy cập tài khoản'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-8 border border-stone-200 shadow-xl shadow-black/20">
                    <h1
                        className="text-xl font-bold text-stone-900 mb-6 text-center"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        {view === 'login' ? 'Đăng nhập' : 'Quên mật khẩu'}
                    </h1>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg py-2.5 px-3 mb-4 text-red-600 text-sm flex items-center gap-2 animate-[shake_0.4s_ease-in-out]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {view === 'login' ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="example@gmail.com"
                                        className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 outline-none focus:border-amber-500 transition-colors duration-200 bg-white"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 outline-none focus:border-amber-500 transition-colors duration-200 bg-white"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-stone-400 hover:text-stone-600 transition-colors"
                                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {showPassword
                                                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password trigger */}
                            <div className="flex justify-end -mt-1">
                                <button
                                    type="button"
                                    onClick={() => { setView('forgot-password'); setError(''); }}
                                    className="bg-transparent border-none text-amber-600 text-sm font-semibold cursor-pointer hover:text-amber-700 transition-colors"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            {/* Submit Login */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-full cursor-pointer border-none transition-colors duration-200 mt-2"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                    ) : (
                        <ForgotPasswordForm 
                            initialEmail={form.email} 
                            onBack={() => setView('login')} 
                        />
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-stone-100" />
                        <span className="text-xs text-stone-400 font-medium uppercase tracking-widest">hoặc</span>
                        <div className="flex-1 h-px bg-stone-100" />
                    </div>

                    <p className="text-center text-sm text-stone-600 m-0">
                        Chưa có tài khoản?{' '}
                        <button
                            onClick={() => navigate('register')}
                            className="bg-transparent border-none text-amber-600 font-bold cursor-pointer text-sm hover:text-amber-700 transition-colors"
                        >
                            Đăng ký ngay
                        </button>
                    </p>

                    {/* Back button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2.5 bg-transparent border-none text-stone-400 text-xs font-bold cursor-pointer py-1.5 px-4 rounded-full hover:text-stone-900 hover:bg-stone-50 transition-all group"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
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
