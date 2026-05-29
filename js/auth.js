const API_URL = "https://6a199272489e4715751a24c9.mockapi.io/students"; 

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    
    // بيانات المدرس الثابتة
    const adminUsername = "admin2026";
    const adminPassword = "masterPass77";

    // 1. تشيك لو اللي بيدخل هو الأدمن
    if (username === adminUsername && password === adminPassword) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', 'admin');
        window.location.href = 'admin.html';
        return;
    }

    try {
        // 2. جلب الطلاب من السيرفر والتشيك على بيانات الطالب
        const response = await fetch(API_URL);
        const students = await response.json();

        const student = students.find(s => s.username === username && s.password === password);

        if (student) {
            // التعديل السحري: فحص الحالة سواء كانت نص أو Boolean
            const isStudentActive = student.active === true || student.active === "true";

            if (!isStudentActive) {
                errorMsg.innerText = "عذراً، حسابك قيد المراجعة! يجب أن يقبلك المدرس أولاً للدخول.";
                errorMsg.style.display = "block";
                return;
            }

            // لو الحساب نشط يدخل على المحاضرات
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('role', 'student');
            localStorage.setItem('username', student.username);
            localStorage.setItem('userMonth', student.month);
            window.location.href = 'sessions.html';
        } else {
            errorMsg.innerText = "اسم المستخدم أو كلمة المرور خاطئة!";
            errorMsg.style.display = "block";
        }
    } catch (error) {
        errorMsg.innerText = "خطأ في الاتصال بالسيرفر السحابي!";
        errorMsg.style.display = "block";
    }
});