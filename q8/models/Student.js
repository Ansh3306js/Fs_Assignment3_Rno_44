const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  city: {
    type: DataTypes.STRING
  }
});

module.exports = Student;
