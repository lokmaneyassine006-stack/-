import React, { useState } from 'react';
import { 
  X, User, Mail, Calendar, Lock, Sparkles, Check, 
  ShieldCheck, ArrowRight, Key
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, resetPassword, currentUser, switchUserRole } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [password, setPassword] = useState('');

  // Forgot Password / Reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'بيانات الدخول غير صحيحة');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!firstName || !lastName || !email) {
      setErrorMsg('يرجى ملء كافة الحقول');
      return;
    }

    const res = register({
      firstName,
      lastName,
      email,
      birthDate,
      password: password || '123456'
    });

    if (!res.success) {
      setErrorMsg(res.error || 'فشل التسجيل');
    } else {
      onClose();
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);
    if (!resetEmail || !resetNewPassword) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور الجديدة');
      return;
    }
    const res = resetPassword(resetEmail, resetNewPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'فشلت عملية إعادة التعيين');
    } else {
      setResetSuccessMsg(res.message);
      setLoginEmail(resetEmail);
      setLoginPassword(resetNewPassword);
      setTimeout(() => {
        setMode('login');
        setResetSuccessMsg(null);
      }, 2500);
    }
  };

  const handleQuickOwnerSession = () => {
    switchUserRole('owner');
    onClose();
  };

  const handleQuickSaadSession = () => {
    switchUserRole('saad_bouacha');
    onClose();
  };

  const handleQuickUserSession = () => {
    switchUserRole('regular_user');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white">
                {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء حساب جديد' : 'إعادة تعيين كلمة المرور'}
              </h3>
              <span className="text-[11px] text-stone-400">
                منصة معا نحو التغيير
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Switcher & Form */}
        <div className="p-6 space-y-4">
          
          {/* Quick Session Switchers */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-950/20 rounded-2xl border border-amber-500/20 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
              ⚡ تبديل الجلسات المباشرة السريعة:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleQuickOwnerSession}
                className="py-1.5 px-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black cursor-pointer shadow-xs text-center truncate"
                title="جلسة المالك: لقمان أبختي"
              >
                👑 لقمان (المالك)
              </button>
              <button
                type="button"
                onClick={handleQuickSaadSession}
                className="py-1.5 px-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black cursor-pointer shadow-xs text-center truncate"
                title="جلسة VIP: سعد بوعشة"
              >
                ⭐ سعد بوعشة (VIP)
              </button>
              <button
                type="button"
                onClick={handleQuickUserSession}
                className="py-1.5 px-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-100 text-stone-700 dark:text-stone-200 text-[10px] font-bold border border-stone-200 dark:border-slate-700 cursor-pointer shadow-xs text-center truncate"
              >
                👤 قارئ عام
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-stone-200 dark:border-slate-800">
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-stone-400'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-stone-400'
              }`}
            >
              إنشاء حساب
            </button>
            <button
              onClick={() => { setMode('forgot_password'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'forgot_password'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-stone-400'
              }`}
            >
              إعادة تعيين المرور
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {resetSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
              {resetSuccessMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">كلمة المرور</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setResetEmail(loginEmail); }}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-bold cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                دخول الحساب
              </button>
            </form>
          ) : mode === 'forgot_password' ? (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
                أدخل البريد الإلكتروني وكلمة المرور الجديدة لإعادة تعيين كلمة المرور فوراً.
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">البريد الإلكتروني المسجل</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                تأكيد وتعيين كلمة المرور
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-bold cursor-pointer text-center"
              >
                العودة إلى تسجيل الدخول
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">الاسم</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">اللقب</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                إنشاء وتأكيد الحساب
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
