// عناوين السيرفر الخاصة بيك على MockAPI
const STUDENTS_API_URL = "https://6a199272489e4715751a24c9.mockapi.io/students";
const VIDEOS_API_URL = "https://6a199272489e4715751a24c9.mockapi.io/videos";

// بيانات الربط مع Cloudinary (مجهزة وشغالة فوراً)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmodg7exj/video/upload";
const CLOUDINARY_UPLOAD_PRESET = "mudarres_preset";

// تأمين الصفحة
const isLoggedIn = localStorage.getItem('isLoggedIn');
const role = localStorage.getItem('role');

if (!isLoggedIn || role !== 'admin') {
    alert('غير مسموح بالدخول لغير المسؤول!');
    window.location.href = 'login.html';
}

// ================= 1) إدارة الطلاب =================

async function renderStudents() {
    const tbody = document.getElementById('studentsBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    try {
        const response = await fetch(STUDENTS_API_URL);
        const students = await response.json();

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">لا يوجد طلاب مسجلين حتى الآن</td></tr>';
            return;
        }

        students.forEach(student => {
            const tr = document.createElement('tr');
            const isStudentActive = student.active === true || student.active === "true";
            
            let activationBtn = `
                <button onclick="window.toggleActivation('${student.id}', ${isStudentActive})" style="background-color: ${isStudentActive ? '#f39c12' : '#2ecc71'}; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                    ${isStudentActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                </button>
            `;

            tr.innerHTML = `
                <td>${student.username || student.name}</td>
                <td>${student.password || '123456'}</td>
                <td>
                    <select onchange="window.changeMonth('${student.id}', this.value)" style="padding:5px; font-weight:bold;">
                        <option value="10" ${student.month === '10' ? 'selected' : ''}>شهر 10</option>
                        <option value="11" ${student.month === '11' ? 'selected' : ''}>شهر 11</option>
                        <option value="12" ${student.month === '12' ? 'selected' : ''}>شهر 12</option>
                        <option value="1" ${student.month === '1' ? 'selected' : ''}>شهر 1</option>
                        <option value="2" ${student.month === '2' ? 'selected' : ''}>شهر 2</option>
                        <option value="3" ${student.month === '3' ? 'selected' : ''}>شهر 3</option>
                        <option value="4" ${student.month === '4' ? 'selected' : ''}>شهر 4</option>
                        <option value="5" ${student.month === '5' ? 'selected' : ''}>شهر 5</option>
                        <option value="6" ${student.month === '6' ? 'selected' : ''}>شهر 6</option>
                        <option value="7" ${student.month === '7' ? 'selected' : ''}>شهر 7</option>
                    </select>
                </td>
                <td>
                    <span style="color: ${isStudentActive ? '#2ecc71' : '#e74c3c'}; font-weight:bold;">
                        ${isStudentActive ? 'مقبول / نشط' : 'بانتظار القبول'}
                    </span>
                </td>
                <td>
                    ${activationBtn}
                    <button onclick="window.deleteStudent('${student.id}')" style="background-color:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">حذف 🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
    }
}

window.changeMonth = async function(id, newMonth) {
    try {
        await fetch(`${STUDENTS_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: newMonth })
        });
        renderStudents();
    } catch (error) {
        console.error("خطأ في تعديل الشهر:", error);
    }
};

window.toggleActivation = async function(id, currentStatus) {
    try {
        await fetch(`${STUDENTS_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !currentStatus })
        });
        renderStudents();
    } catch (error) {
        console.error("خطأ في تغيير الحالة:", error);
    }
};

window.deleteStudent = async function(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) {
        try {
            await fetch(`${STUDENTS_API_URL}/${id}`, { method: 'DELETE' });
            renderStudents();
        } catch (error) {
            console.error("خطأ في الحذف:", error);
        }
    }
};


// ================= 2) الرفع المباشر للفيديوهات وإدارتها =================

const uploadVideoForm = document.getElementById('uploadVideoForm');
const videoSubmitBtn = document.getElementById('videoSubmitBtn');
const videosTableBody = document.getElementById('videosTableBody');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

async function renderVideos() {
    if(!videosTableBody) return;
    videosTableBody.innerHTML = '';

    try {
        const response = await fetch(VIDEOS_API_URL);
        const videos = await response.json();

        if(videos.length === 0) {
            videosTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">لا توجد فيديوهات مرفوعة حالياً</td></tr>';
            return;
        }

        videos.forEach(video => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${video.title}</strong></td>
                <td><span style="background:#17a2b8; color:#fff; padding:3px 8px; border-radius:12px; font-size:13px;">شهر ${video.month}</span></td>
                <td><a href="${video.url}" target="_blank" style="color:#007bff; text-decoration:none;">عرض الفيديو 🔗</a></td>
                <td><button onclick="window.deleteVideo('${video.id}')" class="btn-danger">حذف 🗑️</button></td>
            `;
            videosTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("خطأ في جلب الفيديوهات:", error);
    }
}

if(uploadVideoForm) {
    uploadVideoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('videoFile');
        const file = fileInput.files[0];
        
        if(!file) {
            alert("برجاء اختيار ملف فيديو أولاً!");
            return;
        }

        // قفل الزرار وتشغيل شريط التحميل
        videoSubmitBtn.disabled = true;
        videoSubmitBtn.innerText = "جاري رفع الملف للسحابة... ⏳";
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";

        // تجهيز البيانات لإرسالها لـ Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // استخدام XMLHttpRequest لمتابعة نسبة الرفع بدقة (% كام)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', CLOUDINARY_URL, true);

        // تحديث شريط النسبة المئوية أثناء الرفع
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressText.innerText = `جاري الرفع للسحابة: ${percentComplete}%`;
            }
        };

        xhr.onload = async function() {
            if (xhr.status === 200) {
                const cloudinaryData = JSON.parse(xhr.responseText);
                const generatedVideoUrl = cloudinaryData.secure_url; // اللينك المباشر السري اللي طلع للفيديو!

                progressText.innerText = "تم الرفع بنجاح! جاري الحفظ في قاعدة البيانات... 💾";

                // خطوة الحفظ في MockAPI
                const videoData = {
                    title: document.getElementById('videoTitle').value,
                    url: generatedVideoUrl,
                    month: document.getElementById('videoMonth').value
                };

                try {
                    const response = await fetch(VIDEOS_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(videoData)
                    });

                    if(response.ok) {
                        alert("عاش يا دكتور! الفيديو ارفع واتحفظ في قاعدة البيانات والشهور بنجاح! 🎉");
                        uploadVideoForm.reset();
                        renderVideos();
                    } else {
                        alert("حدثت مشكلة أثناء الحفظ في قاعدة البيانات.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("فشل الاتصال بـ MockAPI.");
                }
            } else {
                alert("فشل رفع الملف إلى السيرفر السحابي. تأكد من حجم الملف والاتصال بالإنترنت.");
            }
            
            // إعادة تعيين أزرار الفورم
            videoSubmitBtn.disabled = false;
            videoSubmitBtn.innerText = "بدء رفع الفيديو الآن 🚀";
            progressContainer.style.display = "none";
        };

        xhr.onerror = function() {
            alert("حدث خطأ في الاتصال بالسيرفر السحابي.");
            videoSubmitBtn.disabled = false;
            videoSubmitBtn.innerText = "بدء رفع الفيديو الآن 🚀";
            progressContainer.style.display = "none";
        };

        // إرسال الملف فعلياً
        xhr.send(formData);
    });
}

window.deleteVideo = async function(id) {
    if(confirm("هل أنت متأكد من حذف هذا الفيديو نهائياً؟")) {
        try {
            await fetch(`${VIDEOS_API_URL}/${id}`, { method: 'DELETE' });
            renderVideos();
        } catch (error) {
            console.error("خطأ في حذف الفيديو:", error);
        }
    }
};

renderStudents();
renderVideos();