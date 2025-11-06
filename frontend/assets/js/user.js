import { request, storage, showToast, ensureAuth } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = ensureAuth();
  if (!user) return;

  const logoutBtn = document.querySelector('#logout-btn');
  const venueGrid = document.querySelector('#venue-grid');
  const bookingList = document.querySelector('#booking-list');
  const bookingForm = document.querySelector('#booking-form');
  const venueSelect = document.querySelector('#booking-venue');
  const nameTag = document.querySelector('#welcome-name');

  nameTag.textContent = user.name;

  logoutBtn?.addEventListener('click', () => {
    storage.clear();
    window.location.href = '/auth.html';
  });

  async function loadVenues() {
    const venues = await request('/venues');
    venueGrid.innerHTML = '';
    venueSelect.innerHTML = '<option value="">选择场地</option>';
    venues.forEach((venue) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="tag">容量 ${venue.capacity} 人</span>
        <img src="${venue.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}" alt="${venue.name}">
        <h3>${venue.name}</h3>
        <p>${venue.location}</p>
        <div class="badge">¥${Number(venue.pricePerHour).toFixed(2)}/小时</div>
        <p>${venue.description || '该场地等待补充描述。'}</p>
      `;
      venueGrid.appendChild(card);

      const option = document.createElement('option');
      option.value = venue.id;
      option.textContent = `${venue.name}（¥${Number(venue.pricePerHour).toFixed(0)}/小时）`;
      venueSelect.appendChild(option);
    });
  }

  async function loadBookings() {
    const bookings = await request('/bookings');
    bookingList.innerHTML = '';
    bookings.forEach((booking) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.venue?.name || ''}</td>
        <td>${new Date(booking.startTime).toLocaleString()}</td>
        <td>${new Date(booking.endTime).toLocaleString()}</td>
        <td>¥${Number(booking.totalAmount).toFixed(2)}</td>
        <td><span class="status-pill ${booking.status}">${booking.status}</span></td>
        <td><span class="status-pill ${booking.paymentStatus}">${booking.paymentStatus}</span></td>
        <td class="actions"></td>
      `;

      const actionsCell = row.querySelector('.actions');
      if (booking.paymentStatus === 'unpaid') {
        const payBtn = document.createElement('button');
        payBtn.className = 'btn btn-primary';
        payBtn.textContent = '立即支付';
        payBtn.addEventListener('click', async () => {
          try {
            await request(`/bookings/${booking.id}/pay`, { method: 'POST' });
            showToast('支付成功，订单已确认', 'success');
            loadBookings();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
        actionsCell.appendChild(payBtn);
      }

      if (booking.status === 'pending' || booking.status === 'confirmed') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = '取消预约';
        cancelBtn.addEventListener('click', async () => {
          try {
            await request(`/bookings/${booking.id}/cancel`, { method: 'POST' });
            showToast('预约已取消', 'success');
            loadBookings();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
        actionsCell.appendChild(cancelBtn);
      }

      bookingList.appendChild(row);
    });
  }

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(bookingForm);
    if (!formData.get('venueId')) {
      showToast('请选择场地', 'error');
      return;
    }
    try {
      await request('/bookings', {
        method: 'POST',
        body: Object.fromEntries(formData)
      });
      showToast('预约已创建，请及时支付', 'success');
      bookingForm.reset();
      loadBookings();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  loadVenues();
  loadBookings();
});
