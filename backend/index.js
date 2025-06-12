// index.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import prisma from './prisma/client.js';
import morgan from 'morgan';
import helmet from 'helmet';



const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

 // Seguridad básica
app.use(helmet());

// Controla el número de peticiones
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Demasiadas solicitudes desde esta IP, intenta más tarde.",
}));

// Logs
app.use(morgan('dev'));


app.use(express.json());

// Obtener todas las transacciones
app.get('/api/transactions_old', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { fecha: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// Obtener con búsqueda y paginación
app.get('/api/transactions', async (req, res) => {
  const { q = '', page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { concepto: { contains: q, mode: 'insensitive' } },
      skip: +skip,
      take: +limit,
      orderBy: { fecha: 'desc' },
    }),
    prisma.transaction.count({ where: { concepto: { contains: q, mode: 'insensitive' } } }),
  ]);

  res.json({ transactions, total });
});

// Crear una nueva transacción
app.post('/api/transactions', async (req, res) => {
  const { concepto, monto, tipo } = req.body;

  if (!concepto || !monto || !tipo) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        concepto,
        monto: parseFloat(monto),
        tipo,
      },
    });
    res.json(transaction);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// Editar
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { concepto, monto } = req.body;
  const updated = await prisma.transaction.update({
    where: { id: +id },
    data: { concepto, monto },
  });
  res.json(updated);
});

// Eliminar
app.delete('/api/transactions/:id', async (req, res) => {
  const deleted = await prisma.transaction.delete({ where: { id: +req.params.id } });
  res.json(deleted);
});

// Ruta de resumen (opcional)
app.get('/api/summary', async (req, res) => {
  try {
    const incomes = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'income' },
    });

    const expenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense' },
    });

    res.json({
      totalIncome: incomes._sum.amount || 0,
      totalExpense: expenses._sum.amount || 0,
      balance: (incomes._sum.amount || 0) - (expenses._sum.amount || 0),
    });
  } catch (error) {
    console.error('Error al calcular resumen:', error);
    res.status(500).json({ error: 'Error al calcular resumen' });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Finance Lite Backend</h1>
    <p>Servidor corriendo correctamente en puerto 4000.</p>
    <p><a href="/api/transactions">Ver transacciones</a></p>
  `);
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

/// 👇 Aquí agregas esto:
process.on('SIGINT', async () => {
  console.log('Desconectando de la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});


