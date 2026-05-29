const API_URL = "https://6a199272489e4715751a24c9.mockapi.io/students"; 

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    if (password.length < 6) {
        errorMsg.innerText = "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل!";
        errorMsg.style.display = "block";
        return;
    }

    try {
        // 1. جلب الطلاب للتأكد أن الاسم مش مكرر
        const response = await fetch(API_URL);
        const students = await response.json();

        const userExists = students.some(s => s.username === username);
        if (userExists) {
            errorMsg.innerText = "اسم المستخدم هذا مسجل بالفعل!";
            errorMsg.style.display = "block";
            return;
        }

        // 2. رفع الطالب الجديد للسيرفر
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                month: "5",
                active: false // ينزل غير مفعّل لحين قبول المدرس
            })
        });

        alert('تم إنشاء الحساب في قاعدة البيانات بنجاح! يرجى إبلاغ المدرس لتفعيل حسابك.');
        window.location.href = 'login.html';

    } catch (error) {
        errorMsg.innerText = "حدث خطأ أثناء الاتصال بقاعدة البيانات!";
        errorMsg.style.display = "block";
    }
});