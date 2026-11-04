import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Bell,
  FileText,
  CreditCard,
  MapPin,
  Lock,
  Shield,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Default tab is 'profile' or from query param
  const activeTab = searchParams.get('tab') || 'profile';

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setMessage('');
    setError('');
  };

  // Profile Form States
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState(''); // 'Male' | 'Female' | 'Other'
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Cards State: Pre-loaded with 1 default VISA card as specifically requested
  const [cards, setCards] = useState([
    {
      id: 1,
      brand: 'VISA',
      number: '•••• •••• •••• 8868',
      holder: user?.name ? user.name.toUpperCase() : 'NGUYEN VAN A',
      expiry: '12/28',
      isDefault: true,
      bank: 'Vietcombank'
    }
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');

  // Bank Accounts State: Empty initially
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('Vietcombank');
  const [newBankAccountNumber, setNewBankAccountNumber] = useState('');
  const [newBankAccountHolder, setNewBankAccountHolder] = useState('');

  // Addresses State: Empty initially
  const [addresses, setAddresses] = useState([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressName, setNewAddressName] = useState('');
  const [newAddressPhone, setNewAddressPhone] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [newAddressDefault, setNewAddressDefault] = useState(true);

  // Orders State (My Purchase)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals for editing Email & Phone
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [modalInput, setModalInput] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Initialize data from current user
    setUsername(user.username || (user.email ? user.email.split('@')[0] : '_dnu6ta3lw'));
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setGender(user.gender || '');
    if (user.avatar_url) setAvatarPreview(user.avatar_url);

    if (user.date_of_birth) {
      const parts = user.date_of_birth.split('-');
      if (parts.length === 3) {
        setBirthYear(parts[0]);
        setBirthMonth(parts[1]);
        setBirthDay(parts[2]);
      }
    }
  }, [user, navigate]);

  // Fetch orders for 'purchase' tab
  useEffect(() => {
    if (activeTab === 'purchase') {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const data = await apiFetch('/orders/myorders');
          setOrders(data || []);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const dob = (birthYear && birthMonth && birthDay)
        ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
        : null;

      await updateProfile({
        name,
        gender,
        date_of_birth: dob,
        avatar_url: avatarPreview || user.avatar_url,
      });

      setMessage('Hồ sơ của bạn đã được cập nhật thành công!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Avatar Upload Simulation
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Dung lượng file tối đa là 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Card
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExpiry) {
      alert('Vui lòng điền đầy đủ thông tin thẻ.');
      return;
    }
    const cleanNum = newCardNumber.replace(/\D/g, '');
    const last4 = cleanNum.slice(-4) || '1234';
    const brand = cleanNum.startsWith('4') ? 'VISA' : cleanNum.startsWith('5') ? 'Mastercard' : 'JCB';

    const newCard = {
      id: Date.now(),
      brand,
      number: `•••• •••• •••• ${last4}`,
      holder: newCardHolder.toUpperCase(),
      expiry: newCardExpiry,
      isDefault: cards.length === 0,
      bank: 'Ngân hàng phát hành'
    };
    setCards([...cards, newCard]);
    setShowAddCardModal(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvv('');
  };

  // Handle Add Bank Account
  const handleAddBank = (e) => {
    e.preventDefault();
    if (!newBankAccountNumber || !newBankAccountHolder) {
      alert('Vui lòng nhập số tài khoản và tên chủ tài khoản.');
      return;
    }
    const newBank = {
      id: Date.now(),
      bankName: newBankName,
      accountNumber: newBankAccountNumber,
      holderName: newBankAccountHolder.toUpperCase()
    };
    setBankAccounts([...bankAccounts, newBank]);
    setShowAddBankModal(false);
    setNewBankAccountNumber('');
    setNewBankAccountHolder('');
  };

  // Handle Add Address
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressName || !newAddressPhone || !newAddressDetail) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ cụ thể.');
      return;
    }
    const newAddr = {
      id: Date.now(),
      fullName: newAddressName,
      phone: newAddressPhone,
      city: newAddressCity || 'TP. Hồ Chí Minh',
      detail: newAddressDetail,
      isDefault: newAddressDefault || addresses.length === 0
    };
    if (newAddr.isDefault) {
      setAddresses(addresses.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses([...addresses, newAddr]);
    }
    setShowAddAddressModal(false);
    setNewAddressName('');
    setNewAddressPhone('');
    setNewAddressCity('');
    setNewAddressDetail('');
  };

  // Handle Change Password
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9).');
      return;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...).');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  // Masking helpers matching Shopee: *********35, th***@gmail.com
  const maskPhone = (p) => {
    if (!p) return '';
    const clean = p.replace(/\D/g, '');
    if (clean.length < 4) return clean;
    return '*********' + clean.slice(-2);
  };

  const maskEmail = (em) => {
    if (!em) return '';
    const parts = em.split('@');
    if (parts.length < 2) return em;
    const namePart = parts[0];
    const maskedName = namePart.length <= 2 ? namePart + '***' : namePart.slice(0, 2) + '***';
    return `${maskedName}@${parts[1]}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-2 sm:px-4 text-slate-800">

      {/* Container with Shopee Gray/White layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* ========================================================================= */}
        {/* SIDEBAR NAVIGATION (Matching user screenshot 2) */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-60 flex-shrink-0 bg-transparent">

          {/* Top User Header */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-slate-900 truncate">
                {username}
              </h3>
              <button
                onClick={() => setTab('profile')}
                className="text-xs text-slate-500 hover:text-[#EE4D2D] flex items-center gap-1 mt-0.5"
              >
                <Edit2 className="w-3 h-3" /> Edit Profile
              </button>
            </div>
          </div>

          {/* 3 Middle Sections as requested */}
          <nav className="mt-5 space-y-4 text-sm font-medium">

            {/* 1. Notifications */}
            <div>
              <button
                onClick={() => setTab('notifications')}
                className={`w-full flex items-center gap-2.5 py-2 px-1 text-left transition-colors ${activeTab === 'notifications'
                    ? 'text-[#EE4D2D] font-bold'
                    : 'text-slate-700 hover:text-[#EE4D2D]'
                  }`}
              >
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-[#EE4D2D]' : 'text-[#EE4D2D]/80'}`} />
                <span>Notifications</span>
              </button>
            </div>

            {/* 2. My Account (With 7 sub-items) */}
            <div>
              <button
                onClick={() => setTab('profile')}
                className={`w-full flex items-center gap-2.5 py-1.5 px-1 text-left transition-colors ${['profile', 'banks', 'addresses', 'password', 'noti_settings', 'privacy', 'personal_info'].includes(activeTab)
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                <User className="w-4 h-4 text-blue-500" />
                <span>My Account</span>
              </button>

              {/* Sub-items list (Indented) */}
              <div className="pl-7 mt-1.5 space-y-2 text-xs">

                <button
                  onClick={() => setTab('profile')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'profile' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Profile
                </button>

                <button
                  onClick={() => setTab('banks')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'banks' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Banks & Cards
                </button>

                <button
                  onClick={() => setTab('addresses')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'addresses' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Addresses
                </button>

                <button
                  onClick={() => setTab('password')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'password' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Change Password
                </button>

                <button
                  onClick={() => setTab('noti_settings')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'noti_settings' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Notification Settings
                </button>

                <button
                  onClick={() => setTab('privacy')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'privacy' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Privacy Settings
                </button>

                <button
                  onClick={() => setTab('personal_info')}
                  className={`block w-full text-left py-1 transition-colors ${activeTab === 'personal_info' ? 'text-[#EE4D2D] font-bold' : 'text-slate-600 hover:text-[#EE4D2D]'
                    }`}
                >
                  Personal Information
                </button>

              </div>
            </div>

            {/* 3. My Purchase */}
            <div>
              <button
                onClick={() => setTab('purchase')}
                className={`w-full flex items-center gap-2.5 py-2 px-1 text-left transition-colors ${activeTab === 'purchase'
                    ? 'text-[#EE4D2D] font-bold'
                    : 'text-slate-700 hover:text-[#EE4D2D]'
                  }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>My Purchase</span>
              </button>
            </div>

          </nav>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN CONTENT AREA */}
        {/* ========================================================================= */}
        <main className="flex-1 w-full bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-8 min-h-[580px]">

          {/* Notification Alert Banners */}
          {message && (
            <div className="mb-6 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: MY PROFILE (Matches user screenshot 3) */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div>
              {/* Header */}
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-800">My Profile</h2>
                <p className="text-xs text-slate-500 mt-1">Manage and protect your account</p>
              </div>

              {/* Body: 2 Columns */}
              <div className="pt-6 flex flex-col-reverse md:flex-row gap-8">

                {/* Left Form */}
                <form onSubmit={handleSaveProfile} className="flex-1 space-y-6 text-sm">

                  {/* Username */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm">
                      Username
                    </label>
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        value={username}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-600 text-xs sm:text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Username can only be changed once.
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm">
                      Name
                    </label>
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên của bạn"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs sm:text-sm focus:border-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm">
                      Email
                    </label>
                    <div className="flex-1 max-w-md flex items-center gap-3">
                      {email ? (
                        <>
                          <span className="text-slate-800 text-xs sm:text-sm">{maskEmail(email)}</span>
                          <button
                            type="button"
                            onClick={() => { setModalInput(email); setShowEditEmailModal(true); }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Change
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setModalInput(''); setShowEditEmailModal(true); }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm">
                      Phone Number
                    </label>
                    <div className="flex-1 max-w-md flex items-center gap-3">
                      {phone ? (
                        <>
                          <span className="text-slate-800 text-xs sm:text-sm">{maskPhone(phone)}</span>
                          <button
                            type="button"
                            onClick={() => { setModalInput(phone); setShowEditPhoneModal(true); }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Change
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setModalInput(''); setShowEditPhoneModal(true); }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm flex items-center justify-end gap-1">
                      Gender <span className="text-slate-400 text-xs">ⓘ</span>
                    </label>
                    <div className="flex-1 max-w-md flex items-center gap-6 text-xs sm:text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={gender === 'Male'}
                          onChange={() => setGender('Male')}
                          className="text-[#EE4D2D] focus:ring-[#EE4D2D]"
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={gender === 'Female'}
                          onChange={() => setGender('Female')}
                          className="text-[#EE4D2D] focus:ring-[#EE4D2D]"
                        />
                        <span>Female</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Other"
                          checked={gender === 'Other'}
                          onChange={() => setGender('Other')}
                          className="text-[#EE4D2D] focus:ring-[#EE4D2D]"
                        />
                        <span>Other</span>
                      </label>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="sm:w-32 text-right text-slate-500 text-xs sm:text-sm flex items-center justify-end gap-1">
                      Date of birth <span className="text-slate-400 text-xs">ⓘ</span>
                    </label>
                    <div className="flex-1 max-w-md grid grid-cols-3 gap-2">
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="px-2.5 py-2 border border-slate-300 rounded text-xs sm:text-sm text-slate-700 outline-none bg-white"
                      >
                        <option value="">Date</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="px-2.5 py-2 border border-slate-300 rounded text-xs sm:text-sm text-slate-700 outline-none bg-white"
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={String(m)}>{m}</option>
                        ))}
                      </select>

                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="px-2.5 py-2 border border-slate-300 rounded text-xs sm:text-sm text-slate-700 outline-none bg-white"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 80 }, (_, i) => 2026 - i).map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="sm:pl-38 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-2.5 bg-[#EE4D2D] hover:bg-[#d73211] text-white text-sm font-medium rounded shadow-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                </form>

                {/* Right Column: Avatar Upload */}
                <div className="md:w-64 flex flex-col items-center justify-start border-b md:border-b-0 md:border-l border-slate-100 pb-6 md:pb-0 md:pl-8">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden mb-4">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-14 h-14 text-slate-300" />
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs rounded transition-colors shadow-sm"
                  >
                    Select Image
                  </button>

                  <div className="text-[11px] text-slate-400 text-center mt-3 space-y-0.5">
                    <p>File size: maximum 1 MB</p>
                    <p>File extension: .JPEG, .PNG</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: BANKS & CARDS (Matches user screenshot 4 + pre-set card) */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'banks' && (
            <div className="space-y-10">

              {/* Section 1: Credit / Debit Card */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-normal text-slate-800">Credit / Debit Card</h3>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="px-4 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white text-xs font-medium rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Card
                  </button>
                </div>

                <div className="py-6">
                  {cards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cards.map((c) => (
                        <div
                          key={c.id}
                          className="relative p-5 rounded-xl border border-slate-200 bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md overflow-hidden"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{c.bank || 'Bank'}</span>
                            <span className="font-black italic text-base tracking-widest text-amber-400">{c.brand}</span>
                          </div>
                          <p className="font-mono text-base tracking-widest mb-4">{c.number}</p>
                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Card Holder</p>
                              <p className="font-semibold">{c.holder}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                              <p className="font-semibold">{c.expiry}</p>
                            </div>
                          </div>
                          {c.isDefault && (
                            <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 bg-[#EE4D2D] text-white rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      You don't have cards yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: My Bank Accounts */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-normal text-slate-800">My Bank Accounts</h3>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="px-4 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white text-xs font-medium rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Bank Account
                  </button>
                </div>

                <div className="py-8">
                  {bankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bankAccounts.map((b) => (
                        <div key={b.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{b.bankName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{b.accountNumber}</p>
                            <p className="text-[11px] text-slate-400 uppercase mt-1">{b.holderName}</p>
                          </div>
                          <button
                            onClick={() => setBankAccounts(bankAccounts.filter(x => x.id !== b.id))}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      You don't have bank accounts yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: ADDRESSES (Matches user screenshot 5) */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-normal text-slate-800">My Addresses</h3>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-4 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white text-xs font-medium rounded flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              <div className="py-12">
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((a) => (
                      <div key={a.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{a.fullName}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-500">{a.phone}</span>
                            {a.isDefault && (
                              <span className="text-[10px] bg-red-50 text-[#EE4D2D] border border-[#EE4D2D]/30 px-1.5 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-2">{a.detail}, {a.city}</p>
                        </div>
                        <button
                          onClick={() => setAddresses(addresses.filter(x => x.id !== a.id))}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Exact Shopee Empty State Illustration */
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-24 h-24 mb-4 flex items-center justify-center opacity-40">
                      <svg viewBox="0 0 100 100" className="w-20 h-20 text-slate-400 stroke-current fill-none stroke-[2]">
                        <rect x="25" y="45" width="50" height="35" rx="3" />
                        <line x1="25" y1="58" x2="75" y2="58" strokeDasharray="3 3" />
                        <line x1="48" y1="45" x2="48" y2="80" strokeDasharray="3 3" />
                        <path d="M50 15 C40 15 32 23 32 33 C32 46 50 62 50 62 C50 62 68 46 68 33 C68 23 60 15 50 15 Z" fill="white" />
                        <circle cx="50" cy="32" r="5" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400">You don't have addresses yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: CHANGE PASSWORD */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'password' && (
            <div>
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-800">Change Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  For your account's security, please do not share your password with anyone else.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="pt-8 max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu hiện tại *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded text-sm outline-none focus:border-[#EE4D2D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự, có số và ký tự đặc biệt"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded text-sm outline-none focus:border-[#EE4D2D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
                      <div className={newPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}>
                        ✓ Tối thiểu 6 ký tự
                      </div>
                      <div className={/\d/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}>
                        ✓ Chứa ít nhất 1 số (0-9)
                      </div>
                      <div className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}>
                        ✓ Chứa ký tự đặc biệt (!@#$...)
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-[#EE4D2D]"
                  />
                  {confirmNewPassword && (
                    <p className={`text-xs mt-1 font-semibold ${newPassword === confirmNewPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                      {newPassword === confirmNewPassword ? '✓ Mật khẩu khớp' : '✕ Mật khẩu chưa khớp'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !newPassword || newPassword !== confirmNewPassword}
                    className="px-6 py-2.5 bg-[#EE4D2D] hover:bg-[#d73211] text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: NOTIFICATION SETTINGS */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'noti_settings' && (
            <div>
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-800">Notification Settings</h2>
                <p className="text-xs text-slate-500 mt-1">Quản lý cách ShopLite gửi thông báo cho bạn</p>
              </div>

              <div className="pt-6 divide-y divide-slate-100 text-sm">
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Email Notifications</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Nhận thông báo đơn hàng và ưu đãi qua email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#EE4D2D] rounded" />
                </div>
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">SMS Notifications</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Nhận mã bảo mật OTP và cập nhật giao vận qua tin nhắn</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#EE4D2D] rounded" />
                </div>
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">In-App Notifications</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Thông báo tức thời trên chuông thông báo ứng dụng</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#EE4D2D] rounded" />
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 6: PRIVACY SETTINGS */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'privacy' && (
            <div>
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-800">Privacy Settings</h2>
                <p className="text-xs text-slate-500 mt-1">Thiết lập quyền riêng tư dữ liệu cá nhân</p>
              </div>

              <div className="pt-6 space-y-6 text-sm">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Chế độ tài khoản riêng tư</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ẩn danh sách sản phẩm yêu thích và lịch sử mua sắm đối với người dùng khác.
                  </p>
                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input type="checkbox" className="w-4 h-4 text-[#EE4D2D] rounded" />
                      <span>Kích hoạt chế độ riêng tư</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                  <h4 className="font-semibold text-red-700 text-xs sm:text-sm">Yêu cầu xóa tài khoản</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Khi xóa tài khoản, tất cả lịch sử mua sắm và thông tin sẽ bị xóa vĩnh viễn theo chính sách Shopee.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Yêu cầu xóa tài khoản đã được ghi nhận. Vui lòng kiểm tra email xác nhận.')}
                    className="mt-3 px-3 py-1.5 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50 transition-colors"
                  >
                    Yêu cầu xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 7: PERSONAL INFORMATION */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'personal_info' && (
            <div>
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-800">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-1">Thông tin pháp lý & Định danh cá nhân</p>
              </div>

              <div className="pt-6 space-y-4 text-xs sm:text-sm">
                <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800">Định danh căn cước (CCCD / Citizen ID)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Xác thực danh tính để kích hoạt ví điện tử & thanh toán an toàn</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
                    Chưa xác minh
                  </span>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800">Ngày tham gia ShopLite</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '01/01/2026'}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Active</span>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800">Tải về dữ liệu cá nhân</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Xuất file báo cáo lịch sử đơn hàng và dữ liệu tài khoản</p>
                  </div>
                  <button
                    onClick={() => alert('Dữ liệu cá nhân đã được tổng hợp và chuẩn bị gửi về email của bạn.')}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất dữ liệu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 8: NOTIFICATIONS */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'notifications' && (
            <div>
              <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-slate-800">Notifications</h2>
                  <p className="text-xs text-slate-500 mt-1">Cập nhật đơn hàng & thông báo từ ShopLite</p>
                </div>
                <button
                  onClick={() => alert('Đã đánh dấu tất cả thông báo là đã đọc')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="pt-4 divide-y divide-slate-100">
                <div className="py-3 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EE4D2D] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">Chào mừng bạn đến với ShopLite AI!</p>
                    <p className="text-xs text-slate-500 mt-0.5">Khám phá hàng ngàn sản phẩm chính hãng với công nghệ gợi ý mua sắm thông minh.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hôm nay</span>
                  </div>
                </div>

                <div className="py-3 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">Đăng ký tài khoản thành công</p>
                    <p className="text-xs text-slate-500 mt-0.5">Số điện thoại của bạn đã được liên kết và kích hoạt bảo mật 2 lớp.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Vừa xong</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 9: MY PURCHASE */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'purchase' && (
            <div>
              {/* Order Status Tabs matching Shopee */}
              <div className="flex border-b border-slate-200 overflow-x-auto text-xs sm:text-sm scrollbar-none">
                {['All', 'To Pay', 'To Ship', 'To Receive', 'Completed', 'Cancelled', 'Return Refund'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPurchaseFilter(filter)}
                    className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${purchaseFilter === filter
                        ? 'border-[#EE4D2D] text-[#EE4D2D] font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Order List */}
              <div className="pt-6">
                {ordersLoading ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#EE4D2D] border-t-transparent mx-auto mb-2" />
                    Đang tải đơn mua...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders
                      .filter(o => purchaseFilter === 'All' || o.status === purchaseFilter)
                      .map((o) => (
                        <div key={o.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
                            <span className="font-semibold text-slate-700">Đơn hàng #{o.id}</span>
                            <span className="text-[#EE4D2D] font-bold uppercase">{o.status || 'Completed'}</span>
                          </div>
                          <div className="py-3 text-xs text-slate-600">
                            <p>Ngày đặt: {new Date(o.order_date).toLocaleString()}</p>
                            <p className="mt-1">Địa chỉ giao: {o.shipping_address || 'Địa chỉ mặc định'}</p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Thành tiền:</span>
                            <span className="text-base font-bold text-[#EE4D2D]">
                              ${parseFloat(o.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    Chưa có đơn hàng nào trong mục này.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW CARD */}
      {/* ========================================================================= */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Add Credit / Debit Card</h3>
              <button onClick={() => setShowAddCardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="pt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number *</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name on Card *</label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN VAN A"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D] uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date (MM/YY) *</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CVV *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={newCardCvv}
                    onChange={(e) => setNewCardCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                  />
                </div>
              </div>
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white font-medium rounded shadow-sm"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD BANK ACCOUNT */}
      {/* ========================================================================= */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Add Bank Account</h3>
              <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBank} className="pt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name *</label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none bg-white"
                >
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="MB Bank">MB Bank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VietinBank">VietinBank</option>
                  <option value="ACB">ACB</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="0123456789"
                  value={newBankAccountNumber}
                  onChange={(e) => setNewBankAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN VAN A"
                  value={newBankAccountHolder}
                  onChange={(e) => setNewBankAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D] uppercase"
                />
              </div>
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white font-medium rounded shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ADDRESS */}
      {/* ========================================================================= */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Add New Address</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="pt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={newAddressName}
                  onChange={(e) => setNewAddressName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0987270635"
                  value={newAddressPhone}
                  onChange={(e) => setNewAddressPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Province *</label>
                <input
                  type="text"
                  required
                  placeholder="TP. Hồ Chí Minh"
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address, Building, House No. *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1"
                  value={newAddressDetail}
                  onChange={(e) => setNewAddressDetail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newAddressDefault}
                    onChange={(e) => setNewAddressDefault(e.target.checked)}
                    className="w-4 h-4 text-[#EE4D2D] rounded"
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white font-medium rounded shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT EMAIL */}
      {/* ========================================================================= */}
      {showEditEmailModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-3">Update Email</h3>
            <input
              type="email"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder="new_email@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-[#EE4D2D]"
            />
            <div className="pt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowEditEmailModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail(modalInput);
                  setShowEditEmailModal(false);
                }}
                className="px-4 py-1.5 bg-[#EE4D2D] text-white text-xs rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PHONE */}
      {/* ========================================================================= */}
      {showEditPhoneModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-3">Update Phone Number</h3>
            <input
              type="tel"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder="0987270635"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-[#EE4D2D]"
            />
            <div className="pt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowEditPhoneModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhone(modalInput);
                  setShowEditPhoneModal(false);
                }}
                className="px-4 py-1.5 bg-[#EE4D2D] text-white text-xs rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
