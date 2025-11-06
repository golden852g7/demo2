'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await queryInterface.bulkInsert('Users', [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: '系统管理员',
        email: 'admin@example.com',
        phone: '13800000000',
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', { id: '00000000-0000-0000-0000-000000000001' });
  }
};
