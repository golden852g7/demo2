import { request, storage, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  const forgotForm = document.querySelector('#forgot-form');
  const resetForm = document.querySelector('#reset-form');
  const tabs = document.querySelectorAll('[data-tab]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.form-section').forEach((section) => {
        section.classList.toggle('hidden', section.id !== target);
      });
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: Object.fromEntries(formData)
      });
      storage.setToken(data.token);
      storage.setUser(data.user);
      showToast('登录成功，欢迎回来', 'success');
      window.location.href = data.user.role === 'admin' ? '/admin.html' : '/index.html';
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: Object.fromEntries(formData)
      });
      storage.setToken(data.token);
      storage.setUser(data.user);
      showToast('注册成功，已自动登录', 'success');
      window.location.href = '/index.html';
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  forgotForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(forgotForm);
    try {
      const data = await request('/auth/forgot-password', {
        method: 'POST',
        body: Object.fromEntries(formData)
      });
      showToast(`重置令牌：${data.resetToken}`, 'success');
      document.querySelector('[data-tab="reset"]').click();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  resetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(resetForm);
    try {
      await request('/auth/reset-password', {
        method: 'POST',
        body: Object.fromEntries(formData)
      });
      showToast('密码重置成功，请重新登录', 'success');
      document.querySelector('[data-tab="login"]').click();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
});
