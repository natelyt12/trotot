import { useState } from 'react';

/* ============================================
   RegisterPage – UI-only registration form
   Auth logic will be connected to backend later
   ============================================ */
export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant', // tenant | landlord
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên.';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại.';
    if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu nhập lại không khớp.';
    if (!form.agree) errs.agree = 'Vui lòng đồng ý với điều khoản sử dụng.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // TODO: Connect to auth API
    navigate('home');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #3c2a1e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(217,119,6,0.4)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em' }}>
              Trọ<span style={{ color: '#f59e0b' }}>Tốt</span>
            </span>
          </button>
          <p style={{ color: '#78716c', fontSize: '0.875rem', marginTop: '0.4rem' }}>Tạo tài khoản miễn phí ngay hôm nay</p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#1c1917', marginBottom: '1.25rem', textAlign: 'center' }}>
            Tạo tài khoản
          </h1>

          {/* Role toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem', background: '#f5f5f4', borderRadius: '0.75rem', padding: '0.25rem' }}>
            {[{ value: 'tenant', label: 'Người thuê', icon: 'user' }, { value: 'landlord', label: 'Chủ nhà', icon: 'home' }].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: opt.value }))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: form.role === opt.value ? '#fff' : 'transparent',
                  color: form.role === opt.value ? '#d97706' : '#78716c',
                  fontWeight: form.role === opt.value ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                  boxShadow: form.role === opt.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">Họ và tên</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" className="input" autoComplete="name" />
              {errors.name && <FormError>{errors.name}</FormError>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="form-label">Số điện thoại</label>
              <input type="tel" id="reg-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="0901 234 567" className="input" autoComplete="tel" />
              {errors.phone && <FormError>{errors.phone}</FormError>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  className="input"
                  style={{ paddingRight: '2.5rem' }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', display: 'flex' }}>
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
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginTop: '0.25rem' }}>
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} style={{ marginTop: '3px', accentColor: '#d97706', width: '15px', height: '15px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.83rem', color: '#57534e', lineHeight: 1.5 }}>
                Tôi đồng ý với{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 600, cursor: 'pointer', fontSize: '0.83rem', padding: 0, fontFamily: 'Inter, sans-serif' }}>Điều khoản sử dụng</button>
                {' '}và{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 600, cursor: 'pointer', fontSize: '0.83rem', padding: 0, fontFamily: 'Inter, sans-serif' }}>Chính sách bảo mật</button>
              </span>
            </label>
            {errors.agree && <FormError>{errors.agree}</FormError>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Tạo tài khoản
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#57534e', marginTop: '1.25rem' }}>
            Đã có tài khoản?{' '}
            <button
              onClick={() => navigate('login')}
              style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', transition: 'color 0.2s' }}
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FormError({ children }) {
  return (
    <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      {children}
    </p>
  );
}
