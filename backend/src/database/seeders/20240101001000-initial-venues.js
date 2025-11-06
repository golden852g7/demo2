'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Venues', [
      {
        id: '10000000-0000-0000-0000-000000000001',
        name: '星辰创意空间',
        location: '上海市浦东新区世博大道 200 号',
        capacity: 80,
        pricePerHour: 899.00,
        description: '适合举办工作坊、发布会、团队团建，配备高清投影与专业音响。',
        imageUrl: 'https://images.example.com/venue1.jpg',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        name: '林间度假营地',
        location: '杭州市西湖区灵隐路 88 号',
        capacity: 120,
        pricePerHour: 1299.00,
        description: '户外拓展、烧烤派对的不二之选，提供多功能草坪与篝火区。',
        imageUrl: 'https://images.example.com/venue2.jpg',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Venues', {
      id: [
        '10000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002'
      ]
    });
  }
};
