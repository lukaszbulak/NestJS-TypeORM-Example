// module.exports = {
//   port: 3306,
//   host: process.env.DATASOURCE_URL,
//   username: process.env.DATASOURCE_USERNAME,
//   password: process.env.DATASOURCE_PASSWORD,
//   database: 'sangwoo',
//   logging: false,
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: false,
//   type: 'mariadb',
// };

module.exports =  {
  name: 'default',
    type: 'sqlite',
  database: ':memory:',
  keepConnectionAlive: true,
  logging: true,
  synchronize: true,
  entities: ['dist/**/*.entity{.ts,.js}']
};