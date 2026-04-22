import { useState } from 'react';
import { supabase } from '../lib/supabase';

/* ============================================
   RegisterPage – Connected to Supabase Auth
   ============================================ */
export default function RegisterPage({ navigate }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'tenant', // tenant | landlord
        agree: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên.';
        if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Vui lòng nhập email hợp lệ.';
        if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu nhập lại không khớp.';
        if (!form.agree) errs.agree = 'Vui lòng đồng ý với điều khoản sử dụng.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        role: form.role,
                    },
                },
            });

            if (error) throw error;

            alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản (nếu có).');
            navigate('login');
        } catch (err) {
            setErrors({ server: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-linear-to-br from-stone-900 via-stone-800 to-[#3c2a1e]">
            <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative w-full max-w-[460px]">
                {/* Logo */}
                <div className="text-center mb-7">
                    <button onClick={() => navigate('home')} className="bg-transparent border-none cursor-pointer inline-flex flex-col items-center gap-2.5">
                        <div className="w-[52px] h-[52px] bg-linear-to-br from-amber-600 to-amber-500 rounded-[14px] flex items-center justify-center shadow-[0_4px_20px_rgba(217,119,6,0.4)]">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-[1.6rem] text-white tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
                            Trọ<span className="text-amber-500">Tốt</span>
                        </span>
                    </button>
                    <p className="text-stone-500 text-[0.875rem] mt-1.5">Tạo tài khoản miễn phí ngay hôm nay</p>
                </div>

                {/* Card */}
                <div className="bg-white/95 backdrop-blur-[20px] rounded-[1.25rem] p-8 border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <h1 className="text-[1.3rem] font-bold text-stone-900 mb-5 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        Tạo tài khoản
                    </h1>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
                        {errors.server && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[0.875rem] border border-red-100">
                                {errors.server}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="mb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-stone-200" />
                                <span className="text-[0.8rem] text-stone-400 font-medium">Tôi là...</span>
                                <div className="flex-1 h-px bg-stone-200" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'tenant', label: 'Người thuê' },
                                    { id: 'agent', label: 'Môi giới' },
                                    { id: 'landlord', label: 'Chủ nhà' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, role: option.id }))}
                                        className={`py-2.5 px-1 rounded-md border-2 font-semibold text-[0.8rem] cursor-pointer transition-all duration-200 font-sans ${form.role === option.id ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-stone-200 bg-white text-stone-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="form-label">Họ và tên</label>
                            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" className="input" autoComplete="name" />
                            {errors.name && <FormError>{errors.name}</FormError>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="reg-email" className="form-label">Email</label>
                            <input type="email" id="reg-email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" className="input" autoComplete="email" />
                            {errors.email && <FormError>{errors.email}</FormError>}
                        </div>


                        {/* Password */}
                        <div>
                            <label htmlFor="reg-password" className="form-label">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="reg-password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="input pr-10!"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-stone-400 flex">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <FormError>{errors.password}</FormError>}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" className="input" autoComplete="new-password" />
                            {errors.confirmPassword && <FormError>{errors.confirmPassword}</FormError>}
                        </div>

                        {/* Agree */}
                        <label className="flex items-start gap-2 cursor-pointer mt-1">
                            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-[3px] accent-amber-600 w-[15px] h-[15px] shrink-0" />
                            <span className="text-[0.83rem] text-stone-600 leading-snug">
                                Tôi đồng ý với{' '}
                                <button type="button" className="bg-transparent border-none text-amber-600 font-semibold cursor-pointer text-[0.83rem] p-0 font-sans hover:text-amber-700">Điều khoản sử dụng</button>
                                {' '}và{' '}
                                <button type="button" className="bg-transparent border-none text-amber-600 font-semibold cursor-pointer text-[0.83rem] p-0 font-sans hover:text-amber-700">Chính sách bảo mật</button>
                            </span>
                        </label>
                        {errors.agree && <FormError>{errors.agree}</FormError>}

                        <button
                            type="submit"
                            className={`btn-primary w-full justify-center rounded-md! py-3 text-[0.95rem] mt-1 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                        </button>

                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-[0.8rem] text-stone-400 font-medium">hoặc</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    <p className="text-center text-[0.875rem] text-stone-600">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('login')}
                            className="bg-transparent border-none text-amber-600 font-bold cursor-pointer font-sans text-[0.875rem] transition-colors duration-200 hover:text-amber-700"
                        >
                            Đăng nhập
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

function FormError({ children }) {
    return (
        <p className="text-red-600 text-[0.78rem] mt-1 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {children}
        </p>
    );
}
