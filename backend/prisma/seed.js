import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const transacciones = [
    // Ingresos
    { concepto: 'Sueldo mensual', monto: 2500, tipo: 'ingreso' },
    { concepto: 'Proyecto freelance', monto: 600, tipo: 'ingreso' },
    { concepto: 'Venta de ropa usada', monto: 120, tipo: 'ingreso' },
    { concepto: 'Alquiler de habitación', monto: 800, tipo: 'ingreso' },
    { concepto: 'Dividendo de acciones', monto: 150, tipo: 'ingreso' },

    // Gastos
    { concepto: 'Supermercado', monto: 300, tipo: 'gasto' },
    { concepto: 'Gasolina', monto: 80, tipo: 'gasto' },
    { concepto: 'Servicio de internet', monto: 50, tipo: 'gasto' },
    { concepto: 'Netflix', monto: 15, tipo: 'gasto' },
    { concepto: 'Pago de alquiler', monto: 1200, tipo: 'gasto' },
    { concepto: 'Consulta médica', monto: 100, tipo: 'gasto' },
    { concepto: 'Libro de programación', monto: 45, tipo: 'gasto' },
    { concepto: 'Zapatos nuevos', monto: 70, tipo: 'gasto' },
  ];

  for (const transaccion of transacciones) {
    await prisma.transaction.create({ data: transaccion });
  }

  console.log('Datos de ejemplo insertados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
