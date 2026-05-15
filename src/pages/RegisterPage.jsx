import { useState } from 'react';
import { supabase } from '../lib/supabase';
import VerificationForm from '../components/auth/VerificationForm.jsx';
import { useModal } from '../context/ModalContext';

/* ============================================
   RegisterPage – Flat design, amber palette
   ============================================ */
export default function RegisterPage({ navigate, initialData }) {
    const { showModal } = useModal();
    const [step, setStep] = useState(1); // 1: Info, 2: Verification
    const [showRoleSelector, setShowRoleSelector] = useState(!!initialData?.role && initialData.role !== 'tenant');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: initialData?.role || 'tenant',
        agree: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        let { name, value, type, checked } = e.target;
        if (name === 'phone' && type !== 'checkbox') {
            // Chỉ giữ lại số
            value = value.replace(/\D/g, '');
        }
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        // Tên người dùng: chữ cái, dấu cách, số. Chấp nhận tiếng Việt.
        const nameRegex = /^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+$/;
        if (!form.name.trim()) {
            errs.name = 'Vui lòng nhập tên người dùng.';
        } else if (form.name.trim().length > 30) {
            errs.name = 'Tên người dùng không được vượt quá 30 ký tự.';
        } else if (!nameRegex.test(form.name)) {
            errs.name = 'Tên chỉ bao gồm chữ cái, số và khoảng trắng.';
        }

        if (!form.email.includes('@')) errs.email = 'Vui lòng nhập email hợp lệ.';

        // Mật khẩu: ít nhất 6 ký tự, 1 hoa, 1 số
        const pwdRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (form.password.length < 6) {
            errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
        } else if (!pwdRegex.test(form.password)) {
            errs.password = 'Mật khẩu phải có ít nhất 1 chữ cái viết hoa và 1 chữ số.';
        }

        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu nhập lại không khớp.';

        // Số điện thoại: 10 số, bắt đầu bằng 0, không chứa chữ
        const phoneClean = form.phone.trim().replace(/\D/g, '');
        const phoneRegex = /^0\d{9}$/;
        if (!form.phone.trim()) {
            errs.phone = 'Vui lòng nhập số điện thoại.';
        } else if (/\D/.test(form.phone.trim())) {
            errs.phone = 'Số điện thoại chỉ được chứa chữ số.';
        } else if (!phoneRegex.test(phoneClean)) {
            errs.phone = 'Số điện thoại Việt Nam không hợp lệ (10 số, bắt đầu bằng 0).';
        }

        if (!form.agree) errs.agree = 'Vui lòng đồng ý với điều khoản sử dụng.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        // Nếu là môi giới/Bên cho thuê và đang ở bước 1 -> chuyển sang bước xác thực
        if (form.role !== 'tenant' && step === 1) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            // 1. Kiểm tra Tên người dùng đã tồn tại chưa
            const { data: existingName } = await supabase
                .from('profiles')
                .select('id')
                .eq('full_name', form.name.trim())
                .maybeSingle();

            if (existingName) {
                showModal({
                    title: 'Tên người dùng đã tồn tại',
                    message: 'Tên người dùng này đã được người khác sử dụng. Vui lòng chọn một tên khác.',
                    type: 'warning'
                });
                setLoading(false);
                return;
            }

            // 2. Kiểm tra Số điện thoại đã tồn tại chưa
            const { data: existingPhone } = await supabase
                .from('profiles')
                .select('id')
                .eq('phone', form.phone.trim())
                .maybeSingle();

            if (existingPhone) {
                showModal({
                    title: 'Số điện thoại đã tồn tại',
                    message: 'Số điện thoại này đã được liên kết với một tài khoản khác. Vui lòng sử dụng số khác hoặc Đăng nhập.',
                    type: 'warning'
                });
                setLoading(false);
                return;
            }

            // 3. Tiến hành đăng ký
            const { error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name.trim(),
                        phone: form.phone.trim(),
                        role: form.role,
                    },
                },
            });

            if (error) {
                if (error.message.includes('User already registered')) {
                    showModal({
                        title: 'Email đã tồn tại',
                        message: 'Địa chỉ email này đã được sử dụng. Bạn có muốn chuyển sang trang Đăng nhập không?',
                        type: 'info',
                        confirmText: 'Đăng nhập ngay',
                        cancelText: 'Hủy',
                        onConfirm: () => navigate('login')
                    });
                } else {
                    throw error;
                }
                setLoading(false);
                return;
            }

            // Đăng ký thành công
            showModal({
                title: 'Đăng ký thành công!',
                message: 'Chào mừng bạn đến với Trọ Tốt. Tài khoản của bạn đã sẵn sàng.',
                type: 'success',
                onConfirm: () => navigate('home')
            });
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
                        {step === 1 ? 'Tạo tài khoản' : 'Xác minh danh tính'}
                    </h1>

                    {step === 1 ? (
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

                            {errors.server && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
                                    {errors.server}
                                </div>
                            )}

                            {/* Role Selection Toggle or Selector */}
                            {!showRoleSelector ? (
                                <div className="mb-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRoleSelector(true);
                                            setForm(prev => ({ ...prev, role: 'agent' }));
                                        }}
                                        className="w-full py-2.5 px-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-stone-500 text-xs font-bold hover:bg-stone-100 hover:border-stone-400 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-stone-400 group-hover:text-amber-500 transition-colors">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        Tôi là môi giới / bên cho thuê
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Chọn vai trò</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowRoleSelector(false);
                                                setForm(prev => ({ ...prev, role: 'tenant' }));
                                            }}
                                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-transparent border-none cursor-pointer"
                                        >
                                            Hủy bỏ
                                        </button>
                                    </div>
                                    <div className="bg-stone-100 p-1 rounded-xl flex gap-1 mb-2">
                                        {[
                                            { id: 'agent', label: 'Môi giới' },
                                            { id: 'landlord', label: 'Bên cho thuê' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setForm(prev => ({ ...prev, role: opt.id }))}
                                                className={`flex-1 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all duration-200 border-none ${form.role === opt.id
                                                    ? 'bg-white text-amber-600 shadow-sm'
                                                    : 'bg-transparent text-stone-500 hover:text-stone-700'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Verification Notice for elevated roles */}
                                    {form.role !== 'tenant' && (
                                        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                                            <div className="mt-0.5 text-amber-500 shrink-0">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                            </div>
                                            <p className="text-[11px] text-amber-800 leading-relaxed m-0 font-medium">
                                                Vai trò <span className="font-bold uppercase">{form.role === 'agent' ? 'Môi giới' : 'Bên cho thuê'}</span> yêu cầu xác minh danh tính (KYC) trước khi có thể đăng tin.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className={labelCls}>Tên người dùng</label>
                                <input
                                    type="text" id="name" name="name"
                                    value={form.name} onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    className={inputCls}
                                    autoComplete="name"
                                    maxLength={30}
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
                                {form.role === 'tenant' ? (loading ? 'Đang xử lý...' : 'Tạo tài khoản') : 'Tiếp tục xác thực'}
                            </button>
                        </form>
                    ) : (
                        <VerificationForm 
                            role={form.role} 
                            loading={loading} 
                            onBack={() => setStep(1)} 
                            onSubmit={handleSubmit} 
                        />
                    )}

                    {/* Divider (Only show in step 1) */}
                    {step === 1 && (
                        <>
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
                        </>
                    )}

                    {/* Back */}
                    <div className="mt-5 flex justify-center">
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2.5 bg-transparent border-none text-stone-500 text-sm font-semibold cursor-pointer py-1.5 pl-1.5 pr-4 rounded-full! hover:text-stone-900 hover:bg-stone-100 transition-colors duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-full! bg-stone-100 flex items-center justify-center text-stone-400 transition-colors group-hover:bg-stone-200 group-hover:text-stone-600">
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
