import { request, storage, showToast, ensureAuth } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = ensureAuth('admin');
  if (!user) return;

  const logoutBtn = document.querySelector('#logout-btn');
  const venueTableBody = document.querySelector('#admin-venues');
  const bookingTableBody = document.querySelector('#admin-bookings');
  const venueForm = document.querySelector('#admin-venue-form');
  const venueModalTitle = document.querySelector('#venue-form-title');
  const hiddenVenueId = document.querySelector('#venue-id');

  logoutBtn?.addEventListener('click', () => {
    storage.clear();
    window.location.href = '/auth.html';
  });

  async function loadVenues() {
    const venues = await request('/venues');
    venueTableBody.innerHTML = '';
    venues.forEach((venue) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${venue.name}</td>
        <td>${venue.location}</td>
        <td>${venue.capacity}</td>
        <td>¥${Number(venue.pricePerHour).toFixed(2)}</td>
        <td><span class="badge">${venue.status}</span></td>
        <td>
          <button class="btn btn-outline" data-action="edit">编辑</button>
          <button class="btn btn-outline" data-action="delete">删除</button>
        </td>
      `;

      row.querySelector('[data-action="edit"]').addEventListener('click', () => {
        venueModalTitle.textContent = '编辑场地';
        hiddenVenueId.value = venue.id;
        venueForm.name.value = venue.name;
        venueForm.location.value = venue.location;
        venueForm.capacity.value = venue.capacity;
        venueForm.pricePerHour.value = venue.pricePerHour;
        venueForm.status.value = venue.status;
        venueForm.description.value = venue.description || '';
        venueForm.imageUrl.value = venue.imageUrl || '';
        venueForm.scrollIntoView({ behavior: 'smooth' });
      });

      row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm('确认删除该场地？')) return;
        try {
          await request(`/venues/${venue.id}`, { method: 'DELETE' });
          showToast('场地已删除', 'success');
          loadVenues();
        } catch (error) {
          showToast(error.message, 'error');
        }
      });

      venueTableBody.appendChild(row);
    });
  }

  async function loadBookings() {
    const bookings = await request('/bookings');
    bookingTableBody.innerHTML = '';
    bookings.forEach((booking) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.user?.name || ''}</td>
        <td>${booking.venue?.name || ''}</td>
        <td>${new Date(booking.startTime).toLocaleString()}</td>
        <td>${new Date(booking.endTime).toLocaleString()}</td>
        <td>¥${Number(booking.totalAmount).toFixed(2)}</td>
        <td><span class="status-pill ${booking.status}">${booking.status}</span></td>
        <td><span class="status-pill ${booking.paymentStatus}">${booking.paymentStatus}</span></td>
        <td class="actions"></td>
      `;

      const actionsCell = row.querySelector('.actions');
      if (booking.status === 'confirmed') {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-primary';
        completeBtn.textContent = '标记完成';
        completeBtn.addEventListener('click', async () => {
          try {
            await request(`/bookings/${booking.id}/complete`, { method: 'POST' });
            showToast('订单已完成', 'success');
            loadBookings();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
        actionsCell.appendChild(completeBtn);
      }

      if (booking.status === 'pending' || booking.status === 'confirmed') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = '取消订单';
        cancelBtn.addEventListener('click', async () => {
          if (!confirm('确认取消该订单？')) return;
          try {
            await request(`/bookings/${booking.id}/cancel`, { method: 'POST' });
            showToast('订单已取消', 'success');
            loadBookings();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
        actionsCell.appendChild(cancelBtn);
      }

      bookingTableBody.appendChild(row);
    });
  }

  venueForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(venueForm);
    const payload = Object.fromEntries(formData);
    const venueId = hiddenVenueId.value;
    delete payload.id;

    try {
      if (venueId) {
        await request(`/venues/${venueId}`, { method: 'PUT', body: payload });
        showToast('场地信息已更新', 'success');
      } else {
        await request('/venues', { method: 'POST', body: payload });
        showToast('新场地已创建', 'success');
      }
      venueForm.reset();
      hiddenVenueId.value = '';
      venueModalTitle.textContent = '新增场地';
      loadVenues();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.querySelector('#reset-venue-form')?.addEventListener('click', () => {
    venueForm.reset();
    hiddenVenueId.value = '';
    venueModalTitle.textContent = '新增场地';
  });

  loadVenues();
  loadBookings();
});
