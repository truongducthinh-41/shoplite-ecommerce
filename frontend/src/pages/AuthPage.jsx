import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  HelpCircle, 
  Check, 
  X,
  Phone, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  LogIn
} from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  
  const [mode, setMode] = useState(initialMode); // 'signup' | 'login'
  const [step, setStep] = useState(1); // 1: Verify phone | 2: Create password | 3: Done
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  
  const { login, register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Helper formatting for phone: (+84) 987 270 635
  const formatPhoneDisplay = (p) => {
    if (!p) return '(+84) 987 270 635';
    let cleaned = p.replace(/\D/g, '');
    if (cleaned.startsWith('84')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    if (cleaned.length >= 9) {
      return `(+84) ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return `(+84) ${cleaned}`;
  };

  // Tiêu chí kiểm tra mật khẩu theo yêu cầu của đồ án:
  // 1. Tối thiểu 6 ký tự
  // 2. Chứa ít nhất một chữ số (0-9)
  // 3. Chứa ít nhất một ký tự đặc biệt (!@#$...)
  // 4. (Tiêu chí bổ sung): Chứa chữ cái (A-Z, a-z)
  const hasMinLen = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  const criteriaMetCount = [hasMinLen, hasNumber, hasSpecialChar, hasLetter].filter(Boolean).length;
  const isPasswordValid = hasMinLen && hasNumber && hasSpecialChar && hasLetter;

  // Kiểm tra xác nhận mật khẩu có khớp hay không
  const isConfirmEntered = confirmPassword.length > 0;
  const isPasswordMatching = isConfirmEntered && password === confirmPassword;
  const isPasswordMismatch = isConfirmEntered && password !== confirmPassword;

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Step 3 redirect countdown timer (Auto-redirects to home in 4 seconds)
  useEffect(() => {
    let timer;
    if (mode === 'signup' && step === 3) {
      if (redirectCountdown > 0) {
        timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      } else {
        navigate('/');
      }
    }
    return () => clearTimeout(timer);
  }, [mode, step, redirectCountdown, navigate]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số).');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      setOtpSent(true);
      setResendCountdown(60);
      // Auto-fill test OTP for easy testing & grading demo
      if (res.otp) {
        setOtp(res.otp);
      }
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 1: Verify OTP and advance to Step 2
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.trim().length === 0) {
      setError('Vui lòng nhập mã xác thực OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Mã xác thực không hợp lệ. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Complete Registration and advance to Step 3
  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!hasMinLen) {
      setError('Mật khẩu phải chứa tối thiểu 6 ký tự.');
      return;
    }

    if (!hasNumber) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ số (0-9).');
      return;
    }

    if (!hasSpecialChar) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...).');
      return;
    }

    if (!hasLetter) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ cái (a-z, A-Z).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const finalEmail = email.trim() || `${cleanPhone}@shoplite.local`;

      await register({
        name: name.trim(),
        email: finalEmail,
        phone: cleanPhone,
        password,
      });

      // Advance to Step 3 (Done) matching the image!
      setStep(3);
      setRedirectCountdown(4);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginIdentifier, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] py-6 sm:py-10 flex flex-col items-center justify-start">
      
      {/* Shopee-style Header Card */}
      <div className="w-full max-w-4xl bg-white text-slate-800 rounded-3xl shadow-xl shadow-black/20 border border-slate-200/80 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-6 sm:px-10 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#EE4D2D]">ShopLite</span>
            </div>
            <span className="text-xl sm:text-2xl font-medium text-slate-700 pl-3 border-l border-slate-300">
              {mode === 'signup' ? 'Đăng ký' : 'Đăng nhập'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => alert('Trung tâm trợ giúp ShopLite: Hỗ trợ 24/7 qua hotline 1900-1234 hoặc email support@shoplite.vn')}
              className="text-sm font-medium text-[#EE4D2D] hover:underline flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" /> Bạn cần giúp đỡ?
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIGN UP FLOW (3 STEPS) */}
        {/* ========================================================================= */}
        {mode === 'signup' ? (
          <div className="p-6 sm:p-10 bg-slate-50/60 min-h-[580px] flex flex-col items-center">
            
            {/* 3-Step Shopee Progress Stepper */}
            <div className="w-full max-w-xl mx-auto mb-10 pt-2">
              <div className="flex items-center justify-between relative">
                
                {/* Step 1: Verify phone no. */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                    step >= 1 
                      ? 'bg-[#22c55e] text-white ring-4 ring-emerald-100' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                  </div>
                  <span className={`text-xs mt-2.5 font-medium whitespace-nowrap ${
                    step >= 1 ? 'text-[#22c55e] font-semibold' : 'text-slate-400'
                  }`}>
                    Xác minh số ĐT
                  </span>
                </div>

                {/* Arrow Connector 1 -> 2 */}
                <div className="flex-1 flex items-center justify-center px-2">
                  <div className={`h-[2px] w-full transition-colors ${step >= 2 ? 'bg-[#22c55e]' : 'bg-slate-200'}`} />
                  <div className={`-ml-1 text-xs transition-colors ${step >= 2 ? 'text-[#22c55e]' : 'text-slate-300'}`}>
                    ▶
                  </div>
                </div>

                {/* Step 2: Create password */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                    step >= 2 
                      ? 'bg-[#22c55e] text-white ring-4 ring-emerald-100' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                  </div>
                  <span className={`text-xs mt-2.5 font-medium whitespace-nowrap ${
                    step >= 2 ? 'text-[#22c55e] font-semibold' : 'text-slate-400'
                  }`}>
                    Tạo mật khẩu
                  </span>
                </div>

                {/* Arrow Connector 2 -> 3 */}
                <div className="flex-1 flex items-center justify-center px-2">
                  <div className={`h-[2px] w-full transition-colors ${step >= 3 ? 'bg-[#22c55e]' : 'bg-slate-200'}`} />
                  <div className={`-ml-1 text-xs transition-colors ${step >= 3 ? 'text-[#22c55e]' : 'text-slate-300'}`}>
                    ▶
                  </div>
                </div>

                {/* Step 3: Done */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                    step === 3 
                      ? 'bg-[#22c55e] text-white ring-4 ring-emerald-100' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className={`text-xs mt-2.5 font-medium whitespace-nowrap ${
                    step === 3 ? 'text-[#22c55e] font-semibold' : 'text-slate-400'
                  }`}>
                    Hoàn tất
                  </span>
                </div>

              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="w-full max-w-md bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-sm border border-red-200 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* STEP 1: VERIFY PHONE NUMBER */}
            {step === 1 && (
              <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-2xl shadow-md border border-slate-200/80">
                <h3 className="text-xl font-bold text-slate-800 text-center mb-1">
                  Xác minh số điện thoại
                </h3>
                <p className="text-sm text-slate-500 text-center mb-6">
                  Vui lòng nhập số điện thoại của bạn để nhận mã xác minh OTP
                </p>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5 tracking-wider">
                        Số điện thoại
                      </label>
                      <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#EE4D2D] focus-within:border-[#EE4D2D] transition-all">
                        <div className="bg-slate-100 px-3.5 py-3 border-r border-slate-300 text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                          <span>🇻🇳</span>
                          <span>+84</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="987 270 635"
                          className="flex-1 px-4 py-3 text-slate-900 bg-white outline-none text-sm font-medium"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        Ví dụ: 0987270635 hoặc 987270635
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !phone}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>Tiếp theo <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                      Mã xác thực OTP đã được gửi đến số <strong className="text-slate-900">{formatPhoneDisplay(phone)}</strong>.
                      <div className="mt-1 font-semibold text-emerald-700">
                        🔑 Mã kiểm thử đồ án: <span className="underline font-mono text-sm tracking-widest">123456</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider">
                          Mã xác thực OTP
                        </label>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setError(''); }}
                          className="text-xs text-[#EE4D2D] hover:underline font-medium"
                        >
                          Đổi số khác
                        </button>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Nhập 6 số (123456)"
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-mono text-base tracking-widest text-center focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Chưa nhận được mã?</span>
                      {resendCountdown > 0 ? (
                        <span className="text-slate-400 font-medium">Gửi lại sau {resendCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[#EE4D2D] font-bold hover:underline"
                        >
                          Gửi lại mã OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !otp}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        'Xác nhận & Tiếp tục'
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <span className="text-xs text-slate-500">Bạn đã có tài khoản? </span>
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-xs font-bold text-[#EE4D2D] hover:underline"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CREATE PASSWORD & ACCOUNT INFO */}
            {step === 2 && (
              <div className="w-full max-w-lg bg-white p-7 sm:p-9 rounded-2xl shadow-md border border-slate-200/80">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Thiết lập mật khẩu & Tài khoản
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã xác thực: {formatPhoneDisplay(phone)}
                  </div>
                </div>

                <form onSubmit={handleCompleteRegister} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email <span className="text-slate-400 font-normal">(Tuỳ chọn để nhận hoá đơn)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Input & Criteria Checklist */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự, có số & ký tự đặc biệt"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-slate-900 text-sm outline-none transition-all ${
                          password.length === 0
                            ? 'border-slate-300 focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]'
                            : isPasswordValid
                            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/20'
                            : 'border-amber-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-amber-50/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength & Criteria Checklist */}
                    {password.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 mt-2">
                        {/* Strength Header */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Độ an toàn mật khẩu:</span>
                          <span className={
                            criteriaMetCount <= 1 ? 'text-red-500' :
                            criteriaMetCount <= 3 ? 'text-amber-600' :
                            'text-emerald-600'
                          }>
                            {criteriaMetCount <= 1 ? 'Yếu' : criteriaMetCount <= 3 ? 'Trung bình' : 'Rất mạnh (Đạt chuẩn)'}
                          </span>
                        </div>

                        {/* Strength Bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((stepIdx) => (
                            <div
                              key={stepIdx}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                criteriaMetCount >= stepIdx
                                  ? criteriaMetCount <= 1 
                                    ? 'bg-red-500' 
                                    : criteriaMetCount <= 3 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                                  : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>

                        {/* 4 Criteria Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                          {/* Criterion 1: Length >= 6 */}
                          <div className={`flex items-center gap-1.5 transition-colors ${hasMinLen ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                            {hasMinLen ? (
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 flex-shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-flex items-center justify-center text-[8px] text-slate-400">•</span>
                            )}
                            <span>Tối thiểu 6 ký tự</span>
                          </div>

                          {/* Criterion 2: Contains Number */}
                          <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                            {hasNumber ? (
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 flex-shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-flex items-center justify-center text-[8px] text-slate-400">•</span>
                            )}
                            <span>Chứa ít nhất 1 số (0-9)</span>
                          </div>

                          {/* Criterion 3: Contains Special Character */}
                          <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                            {hasSpecialChar ? (
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 flex-shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-flex items-center justify-center text-[8px] text-slate-400">•</span>
                            )}
                            <span>Ký tự đặc biệt (!@#$...)</span>
                          </div>

                          {/* Criterion 4: Contains Letter (Tiêu chí 4) */}
                          <div className={`flex items-center gap-1.5 transition-colors ${hasLetter ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                            {hasLetter ? (
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 flex-shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-flex items-center justify-center text-[8px] text-slate-400">•</span>
                            )}
                            <span>Chứa chữ cái (A-Z, a-z)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input & Real-time Matching Check */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại chính xác mật khẩu"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-slate-900 text-sm outline-none transition-all ${
                          !isConfirmEntered
                            ? 'border-slate-300 focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]'
                            : isPasswordMatching
                            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/20'
                            : 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Real-time Match Feedback */}
                    {isConfirmEntered && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
                        {isPasswordMatching ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-4 h-4 stroke-[3]" /> Mật khẩu hoàn toàn trùng khớp
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <X className="w-4 h-4 stroke-[3]" /> Mật khẩu xác nhận chưa trùng khớp
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading || !isPasswordValid || !isPasswordMatching}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        'Đăng ký tài khoản'
                      )}
                    </button>
                    {(!isPasswordValid || !isPasswordMatching) && confirmPassword.length > 0 && (
                      <p className="text-[11px] text-slate-400 text-center mt-2">
                        * Vui lòng đáp ứng đầy đủ tiêu chí bảo mật và xác nhận mật khẩu để kích hoạt đăng ký
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: DONE / SIGN UP SUCCESSFUL! (MATCHES USER IMAGE DIRECTLY) */}
            {step === 3 && (
              <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200/80 text-center animate-fade-in my-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Sign up successful!
                </h2>

                {/* Big Green Circle Checkmark Icon */}
                <div className="w-20 h-20 rounded-full border-[3px] border-[#22c55e] flex items-center justify-center mx-auto mb-6 text-[#22c55e]">
                  <Check className="w-12 h-12 stroke-[3]" />
                </div>

                {/* Description matching exact text in user screenshot */}
                <p className="text-sm text-slate-600 mb-3 px-2 leading-relaxed">
                  You have successfully created a ShopLite account with the number{' '}
                  <span className="text-[#EE4D2D] font-bold">
                    {formatPhoneDisplay(phone)}
                  </span>
                </p>

                {/* Countdown subtext */}
                <p className="text-xs text-slate-400 mb-8">
                  You will be redirected to ShopLite in <span className="font-bold text-slate-700">{redirectCountdown}</span> seconds.
                </p>

                {/* Back to Shopee/ShopLite Primary Action Button */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] shadow-lg shadow-orange-500/25 transition-all transform active:scale-[0.99]"
                >
                  Back to ShopLite
                </button>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================================= */
          /* SIGN IN FORM */
          /* ========================================================================= */
          <div className="p-6 sm:p-10 bg-slate-50/60 min-h-[500px] flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-2xl shadow-md border border-slate-200/80">
              <h3 className="text-xl font-bold text-slate-800 text-center mb-1">
                Đăng nhập ShopLite
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Sử dụng Email hoặc Số điện thoại để đăng nhập
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-5 text-sm border border-red-200 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email hoặc Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="admin@shoplite.local hoặc 0987270635"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                    <a href="#help" onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ Admin để khôi phục mật khẩu.'); }} className="text-xs text-[#EE4D2D] hover:underline">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <><LogIn className="w-4 h-4" /> Đăng nhập</>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Sample Credentials */}
              <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <div className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  ⚡ Tài khoản mẫu thử nghiệm (Password: <code className="text-[#EE4D2D]">password123</code>):
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setLoginIdentifier('admin@shoplite.local'); setLoginPassword('password123'); }}
                    className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-purple-700"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginIdentifier('john_doe@gmail.com'); setLoginPassword('password123'); }}
                    className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-emerald-700"
                  >
                    👤 Người dùng (User)
                  </button>
                </div>
              </div>

              {/* Switch to Register */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">Bạn mới biết đến ShopLite? </span>
                <button
                  onClick={() => { setMode('signup'); setStep(1); setError(''); }}
                  className="text-xs font-bold text-[#EE4D2D] hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
