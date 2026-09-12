import React, { useState } from 'react';
import { 
  X, Users, Award, Video, Calendar, FileText, Check, 
  Sparkles, Mail, Phone, Clock, Plus, ArrowRight, Shield
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { TeamMember, MeetingSchedule } from '../types';

interface HRTeamModalProps {
  onClose: () => void;
}

export const HRTeamModal: React.FC<HRTeamModalProps> = ({ onClose }) => {
  const { teamMembers, applyForJob, scheduleMeeting, currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<'members' | 'apply' | 'meetings' | 'video'>('members');

  // Job Application Form state
  const [applicantName, setApplicantName] = useState(`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim());
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('+213 ');
  const [applicantRole, setApplicantRole] = useState('مترجم لغات ومراجع أدبي');
  const [applicantExperience, setApplicantExperience] = useState('3-5 سنوات');
  const [applicantCvText, setApplicantCvText] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Meeting schedule state
  const [meetingTitle, setMeetingTitle] = useState('اجتماع مناقشة النشر والتطوير الفصلي');
  const [meetingDate, setMeetingDate] = useState('2026-09-15');
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [meetingScheduledSuccess, setMeetingScheduledSuccess] = useState(false);

  // Video call simulator state
  const [isVideoActive, setIsVideoActive] = useState(false);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantCvText) return;

    applyForJob({
      fullName: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      specialty: applicantRole,
      experienceYears: applicantExperience,
      cvSummary: applicantCvText
    });

    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setApplicantCvText('');
    }, 2500);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMeeting({
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      hostName: `${currentUser.firstName} ${currentUser.lastName}`,
      meetUrl: `https://meet.jit.si/TogetherChange2026_${Math.random().toString(36).substring(7)}`,
      status: 'upcoming'
    });

    setMeetingScheduledSuccess(true);
    setTimeout(() => setMeetingScheduledSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                فريق العمل، الموارد البشرية والتوظيف
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                إدارة الكفاءات، تصنيف السير الذاتية، والاجتماعات المرئية المباشرة
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'members'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            أعضاء الفريق والخبراء ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === 'apply'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>تقديم سيرة ذاتية (CV) والانضمام</span>
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === 'meetings'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>تنسيق الاجتماعات واللقاءات</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === 'video'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>الغرفة المرئية المباشرة</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: TEAM MEMBERS LIST */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex gap-4 items-start shadow-xs"
                >
                  <img
                    src={m.avatar}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                        {m.name}
                      </h4>
                      {m.isTopReviewerReward && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white flex items-center gap-0.5 shrink-0">
                          <Award className="w-3 h-3" />
                          <span>صاحب أفضل مراجعة</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 block mb-1.5">
                      {m.role}
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {m.bio}
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-stone-400">
                      <span>القسم: {m.department || m.roleTitleAr || 'إدارة المحتوى والنشر'}</span>
                      <span>•</span>
                      <span>انضم في: {m.joinedDate || m.joinDate || '2026-01'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CV APPLICATION & CLASSIFICATION */}
          {activeTab === 'apply' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800/60 border border-teal-200 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-teal-900 dark:text-teal-200 mb-1">
                  نظام فرز وتصنيف الكفاءات الذكي
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  نرحب بالباحثين، المترجمين، مصممي الأغلفة، والمدققين اللغويين للانضمام إلى منصة "معا نحو التغيير".
                </p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">الاسم واللقب</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">المجال / التخصص</label>
                    <select
                      value={applicantRole}
                      onChange={(e) => setApplicantRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    >
                      <option value="مترجم لغات ومراجع أدبي">مترجم لغات ومراجع أدبي</option>
                      <option value="مدقق لغوي ومعالجة نصوص">مدقق لغوي ومعالجة نصوص</option>
                      <option value="معلق صوتي وإنتاج كتب صوتية">معلق صوتي وإنتاج كتب صوتية</option>
                      <option value="مصمم أغلفة وهوية بصرية">مصمم أغلفة وهوية بصرية</option>
                      <option value="مطور برمجيات وتقنيات ويب">مطور برمجيات وتقنيات ويب</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">سنوات الخبرة</label>
                    <select
                      value={applicantExperience}
                      onChange={(e) => setApplicantExperience(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    >
                      <option value="مبتدئ (أقل من سنة)">مبتدئ (أقل من سنة)</option>
                      <option value="1-3 سنوات">1-3 سنوات</option>
                      <option value="3-5 سنوات">3-5 سنوات</option>
                      <option value="+5 سنوات (خبير)">+5 سنوات (خبير)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">رقم الهاتف / واتساب</label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">ملخص السيرة الذاتية (CV) وأبرز الإنجازات</label>
                  <textarea
                    value={applicantCvText}
                    onChange={(e) => setApplicantCvText(e.target.value)}
                    placeholder="اكتب نبذة عن مؤهلاتك العلمية، اللغات التي تتقنها، والأعمال السابقة..."
                    rows={4}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>

                {applySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold text-center">
                    تم استلام طلبك وتصنيف السيرة الذاتية بنجاح! سيتواصل معك قسم الموارد البشرية.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  إرسال السيرة الذاتية والانضمام
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MEETING SCHEDULING */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <form onSubmit={handleMeetingSubmit} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-stone-900 dark:text-white">جدولة لقاء رقمي / اجتماع فريق العمل</h4>
                
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">عنوان الاجتماع أو موضوع اللقاء</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">تاريخ الاجتماع</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">التوقيت</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {meetingScheduledSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold text-center">
                    تم إنشاء رابط الاجتماع بنجاح وحفظ الموعد في الأجندة الرقمية!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold cursor-pointer"
                >
                  حفظ وتأكيد الموعد
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: DIRECT VIDEO ROOM */}
          {activeTab === 'video' && (
            <div className="text-center space-y-4">
              <div className="aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-6 border border-slate-800 text-white shadow-2xl">
                {isVideoActive ? (
                  <div className="w-full h-full flex flex-col items-center justify-between py-4">
                    <div className="flex items-center gap-2 bg-rose-600/90 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>البث المباشر نشط ومؤمن 256-bit</span>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-teal-700 flex items-center justify-center text-2xl font-black">
                        LY
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-base">لقمان ياسين أبختي (المؤسس)</h4>
                        <span className="text-xs text-teal-400">صوت وصورة متزامنة بدقة عالية</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVideoActive(false)}
                      className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      إنهاء الاتصال المرئي
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Video className="w-16 h-16 text-teal-400 mx-auto" />
                    <h4 className="font-bold text-base">غرفة التواصل المرئي المشفرة</h4>
                    <p className="text-xs text-stone-400 max-w-md mx-auto">
                      تواصل فوري مع صاحب المنصة وفريق العمل لمناقشة حقوق النشر، التوزيع، والترجمات.
                    </p>
                    <button
                      onClick={() => setIsVideoActive(true)}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                    >
                      بدء جلسة مرئية الآن
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
