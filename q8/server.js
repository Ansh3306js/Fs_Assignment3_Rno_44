const express = require('express');
const cors = require('cors');
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('./database');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database sync and seed
async function initDB() {
  try {
    await sequelize.sync();
    console.log('Sequelize SQLite Database Connected & Synced.');

    const count = await Student.count();
    if (count === 0) {
      await Student.bulkCreate([
        { rollNo: '101', name: 'Aarav Sharma', email: 'aarav@example.com', course: 'Computer Science', marks: 88, city: 'Delhi' },
        { rollNo: '102', name: 'Ananya Verma', email: 'ananya@example.com', course: 'Information Technology', marks: 92, city: 'Mumbai' },
        { rollNo: '103', name: 'Rohan Gupta', email: 'rohan@example.com', course: 'Mechanical Engg', marks: 76, city: 'Pune' }
      ]);
      console.log('Seeded 3 sample students into SQLite database.');
    }
  } catch (err) {
    console.error('Sequelize DB Sync Error:', err);
  }
}
initDB();

// --- SEQUELIZE CRUD API ENDPOINTS ---

// 1. READ (GET all students with search support)
app.get('/api/students', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { rollNo: { [Op.like]: `%${search}%` } },
          { course: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const students = await Student.findAll({
      where: whereClause,
      order: [['id', 'DESC']]
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// 2. READ (GET single student)
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student details' });
  }
});

// 3. CREATE (POST student)
app.post('/api/students', async (req, res) => {
  try {
    const { rollNo, name, email, course, marks, city } = req.body;
    
    // Check if roll number already exists
    const existing = await Student.findOne({ where: { rollNo } });
    if (existing) {
      return res.status(400).json({ message: 'Roll Number already exists!' });
    }

    const newStudent = await Student.create({
      rollNo,
      name,
      email,
      course,
      marks: parseInt(marks) || 0,
      city
    });

    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error creating student' });
  }
});

// 4. UPDATE (PUT student)
app.put('/api/students/:id', async (req, res) => {
  try {
    const { rollNo, name, email, course, marks, city } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update({
      rollNo,
      name,
      email,
      course,
      marks: parseInt(marks) || 0,
      city
    });

    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error updating student' });
  }
});

// 5. DELETE (DELETE student)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student' });
  }
});

// Serve React SPA Frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Q8 Sequelize Student CRUD App running on http://localhost:${PORT}`);
});
