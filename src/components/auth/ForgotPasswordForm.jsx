import { useState } from 'react';

/**
 * ForgotPasswordForm - Mock component for password recovery
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to login view
 * @param {string} props.initialEmail - Initial email from login form
 */
export default function ForgotPasswordForm({ onBack, initialEmail }) {
    const [email, setEmail] = useState(initialEmail || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setError('Vui lòng nhập email.');
            return;
        }

        setLoading(true);
        setError('');
        
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            setSuccess('Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn.');
        }, 1500);
    };

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
            {success ? (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-[bounce_0.5s_ease-out]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <p className="text-sm text-stone-700 font-normal leading-relaxed">
                        {success}
                    </p>
                    <button
                        onClick={onBack}
                        className="mt-2 text-amber-600 font-medium text-sm hover:text-amber-700 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <p className="text-sm text-stone-500 leading-relaxed text-center m-0 px-2">
                        Nhập email bạn đã dùng đăng ký. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu vào đó.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg py-2.5 px-3 text-red-600 text-xs flex items-center gap-2 animate-[shake_0.4s_ease-in-out]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                            Email khôi phục
                        </label>
                        <input
                            type="email"
                            id="forgot-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 outline-none focus:border-amber-500 transition-colors duration-200 bg-white"
                            autoComplete="email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium py-3 rounded-full cursor-pointer border-none transition-colors shadow-lg shadow-amber-200"
                    >
                        {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu khôi phục'}
                    </button>

                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full bg-transparent text-stone-500 text-sm font-medium py-1 cursor-pointer border-none hover:text-stone-900 transition-colors"
                    >
                        ← Quay lại đăng nhập
                    </button>
                </form>
            )}
        </div>
    );
}
