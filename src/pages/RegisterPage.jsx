import { useState } from 'react';
import { supabase } from '../lib/supabase';

/* ============================================
   RegisterPage – Flat design, amber palette
   ============================================ */
export default function RegisterPage({ navigate }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'tenant',
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
        if (!form.name.trim())              errs.name = 'Vui lòng nhập họ tên.';
        if (!form.email.includes('@'))      errs.email = 'Vui lòng nhập email hợp lệ.';
        if (form.password.length < 6)       errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu nhập lại không khớp.';
        if (!form.phone.trim())             errs.phone = 'Vui lòng nhập số điện thoại.';
        else if (!/^\d{10,11}$/.test(form.phone.trim().replace(/\D/g, '')))
            errs.phone = 'Số điện thoại không hợp lệ (10-11 số).';
        if (!form.agree)                    errs.agree = 'Vui lòng đồng ý với điều khoản sử dụng.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        phone: form.phone,
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

    const inputCls = "w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 outline-none focus:border-amber-500 transition-colors duration-200 bg-white";
    const labelCls = "block text-sm font-semibold text-stone-700 mb-1.5";

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-stone-900">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-7">
                    <button
                        onClick={() => navigate('home')}
                        className="bg-transparent border-none cursor-pointer inline-flex flex-col items-center gap-2.5"
                    >
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
                        <span className="flex items-baseline">
                            <span
                                className="font-semibold text-[1.8rem] text-white tracking-tight"
                                style={{ fontFamily: 'var(--font-heading)' }}
                            >
                                Trọ
                            </span>
                            <span
                                className="text-amber-500 text-[2.2rem] font-bold ml-1"
                                style={{ fontFamily: 'var(--font-script)' }}
                            >
                                Tốt
                            </span>
                        </span>
                    </button>
                    <p className="text-stone-400 text-sm mt-1.5">Tạo tài khoản miễn phí ngay hôm nay</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-8 border border-stone-200">
                    <h1
                        className="text-xl font-bold text-stone-900 mb-5 text-center"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Tạo tài khoản
                    </h1>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

                        {errors.server && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
                                {errors.server}
                            </div>
                        )}

                        {/* Role selection */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-stone-200" />
                                <span className="text-xs text-stone-400 font-medium">Tôi là...</span>
                                <div className="flex-1 h-px bg-stone-200" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'tenant',   label: 'Người thuê' },
                                    { id: 'agent',    label: 'Môi giới' },
                                    { id: 'landlord', label: 'Chủ nhà' },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, role: opt.id }))}
                                        className={`py-2 px-1 rounded-full border-2 font-semibold text-xs cursor-pointer transition-colors duration-200 ${
                                            form.role === opt.id
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className={labelCls}>Họ và tên</label>
                            <input
                                type="text" id="name" name="name"
                                value={form.name} onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className={inputCls}
                                autoComplete="name"
                            />
                            {errors.name && <FormError>{errors.name}</FormError>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="reg-email" className={labelCls}>Email</label>
                            <input
                                type="email" id="reg-email" name="email"
                                value={form.email} onChange={handleChange}
                                placeholder="example@gmail.com"
                                className={inputCls}
                                autoComplete="email"
                            />
                            {errors.email && <FormError>{errors.email}</FormError>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className={labelCls}>Số điện thoại</label>
                            <input
                                type="tel" id="phone" name="phone"
                                value={form.phone} onChange={handleChange}
                                placeholder="09xx xxx xxx"
                                className={inputCls}
                                autoComplete="tel"
                            />
                            {errors.phone && <FormError>{errors.phone}</FormError>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="reg-password" className={labelCls}>Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="reg-password" name="password"
                                    value={form.password} onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className={`${inputCls} pr-10`}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-stone-400 hover:text-stone-600 transition-colors"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            <label htmlFor="confirmPassword" className={labelCls}>Xác nhận mật khẩu</label>
                            <input
                                type="password" id="confirmPassword" name="confirmPassword"
                                value={form.confirmPassword} onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                className={inputCls}
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <FormError>{errors.confirmPassword}</FormError>}
                        </div>

                        {/* Terms checkbox */}
                        <label className="flex items-start gap-2 cursor-pointer mt-1">
                            <input
                                type="checkbox" name="agree"
                                checked={form.agree} onChange={handleChange}
                                className="mt-0.5 accent-amber-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-sm text-stone-600 leading-snug">
                                Tôi đồng ý với{' '}
                                <button type="button" className="bg-transparent border-none text-amber-600 font-semibold cursor-pointer text-sm p-0 hover:text-amber-700">Điều khoản sử dụng</button>
                                {' '}và{' '}
                                <button type="button" className="bg-transparent border-none text-amber-600 font-semibold cursor-pointer text-sm p-0 hover:text-amber-700">Chính sách bảo mật</button>
                            </span>
                        </label>
                        {errors.agree && <FormError>{errors.agree}</FormError>}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-full cursor-pointer border-none transition-colors duration-200 mt-1"
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-xs text-stone-400 font-medium">hoặc</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    <p className="text-center text-sm text-stone-600 m-0">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('login')}
                            className="bg-transparent border-none text-amber-600 font-bold cursor-pointer text-sm hover:text-amber-700 transition-colors"
                        >
                            Đăng nhập
                        </button>
                    </p>

                    {/* Back */}
                    <div className="mt-5 flex justify-center">
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2.5 bg-transparent border-none text-stone-500 text-sm font-semibold cursor-pointer py-1.5 pl-1.5 pr-4 !rounded-full hover:text-stone-900 hover:bg-stone-100 transition-colors duration-200 group"
                        >
                            <div className="w-8 h-8 !rounded-full bg-stone-100 flex items-center justify-center text-stone-400 transition-colors group-hover:bg-stone-200 group-hover:text-stone-600">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </div>
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
        <p className="text-red-600 text-xs mt-1 flex items-center gap-1 m-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {children}
        </p>
    );
}
