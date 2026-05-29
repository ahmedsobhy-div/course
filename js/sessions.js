// عنوان الـ API الخاص بالفيديوهات من حسابك على MockAPI
const VIDEOS_API_URL = "https://6a199272489e4715751a24c9.mockapi.io/videos";

// 1. التحقق من الحماية وبيانات الدخول (مأخوذة من الكود الأصلي بتاعك)
const isLoggedIn = localStorage.getItem('isLoggedIn');
const userMonth = localStorage.getItem('userMonth'); // الشهر المدفوع للطالب (مثل: 10, 11, 12, 1...)
const username = localStorage.getItem('username');

if (isLoggedIn !== 'true') {
    alert('عذراً، يجب تسجيل الدخول أولاً للوصول لهذه الصفحة!');
    window.location.href = 'login.html';
}

// 2. ربط عناصر الصفحة بالـ IDs المتطابقة مع الـ HTML
const monthTitle = document.getElementById('monthTitle');
const sessionsList = document.getElementById('sessionsList');
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');

// تحديث اسم الشهر في العنوان الجانبي تلقائياً بناءً على شهر الطالب الحالي
if (monthTitle && userMonth) {
    monthTitle.innerText = `📅 محاضرات الشهر المدفوع (${userMonth})`;
}

// 3. دالة جلب المحاضرات الحية من السيرفر وعرضها في الـ Sidebar
async function loadStudentSessions() {
    if (!sessionsList) return;
    sessionsList.innerHTML = ''; // تفريغ القائمة قبل التحميل لمنع التكرار

    try {
        // جلب البيانات من السيرفر
        const response = await fetch(VIDEOS_API_URL);
        const allVideos = await response.json();

        // فلترة الفيديوهات المرفوعة عشان تظهر فقط الفيديوهات المطابقة لشهر الطالب الحالي
        const activeSessions = allVideos.filter(video => video.month === userMonth);

        // إذا لم يرفع المدرس فيديوهات لهذا الشهر حتى الآن
        if (activeSessions.length === 0) {
            sessionsList.innerHTML = `<li style="padding:15px; color:#e74c3c; font-weight:bold; list-style:none; text-align:center;">⚠️ لا توجد محاضرات مرفوعة لهذا الشهر بعد.</li>`;
            return;
        }

        // طباعة المحاضرات داخل القائمة الجانبية (الـ Sidebar)
        activeSessions.forEach((session, index) => {
            const li = document.createElement('li');
            li.className = 'session-item';
            li.style.padding = "12px 15px";
            li.style.borderBottom = "1px solid #eee";
            li.style.cursor = 'pointer';
            li.style.transition = "all 0.2s ease";
            li.innerText = `${index + 1}. ${session.title}`;

            // حدث الضغط على المحاضرة لتشغيل الفيديو في منطقة العرض
            li.addEventListener('click', () => {
                // إزالة التحديد النشط (active) من أي محاضرة قديمة وتحديده للمحاضرة الحالية
                document.querySelectorAll('.session-item').forEach(item => {
                    item.style.background = "none";
                    item.style.color = "#333";
                });
                li.style.background = "#007bff";
                li.style.color = "#fff";

                // تحديث عنوان الفيديو فوق المشغل
                if (videoTitle) videoTitle.innerText = session.title;

                // حقن مشغل الفيديو المدمج الاحترافي (HTML5 Video Player) لحماية وعرض فيديوهات الرفع المباشر
                if (videoPlayer) {
                    videoPlayer.innerHTML = `
                        <video controls controlsList="nodownload" oncontextmenu="return false;" style="width:100%; max-height:450px; background:#000; border-radius:8px;" autoplay>
                            <source src="${session.url}" type="video/mp4">
                            متصفحك لا يدعم مشغل الفيديوهات المدمج.
                        </video>
                    `;
                }
            });

            // تأثير حركي خفيف عند تمرير الماوس فوق المحاضرة
            li.addEventListener('mouseenter', () => {
                if (li.style.background !== "rgb(0, 123, 255)") {
                    li.style.background = "#f8f9fa";
                }
            });
            li.addEventListener('mouseleave', () => {
                if (li.style.background !== "rgb(0, 123, 255)") {
                    li.style.background = "none";
                }
            });

            sessionsList.appendChild(li);
        });

    } catch (error) {
        console.error("حدث خطأ أثناء جلب الفيديوهات:", error);
        sessionsList.innerHTML = `<li style="padding:15px; color:#e74c3c; list-style:none; text-align:center;">❌ فشل الاتصال بالسيرفر لجلب البيانات.</li>`;
    }
}

// 4. برمجة زر تسجيل الخروج (مأخوذة من الكود الأصلي لتنظيف الـ LocalStorage)
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// تشغيل الدالة تلقائياً بمجرد تحميل الصفحة
loadStudentSessions();