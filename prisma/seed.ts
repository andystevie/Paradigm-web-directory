import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  extension?: string;
  phoneNumber?: string;
  did?: string;
  location: string;
  team: string;
  title?: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  avatarUrl?: string;
  region?: string;
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'employees.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const employees: EmployeeData[] = JSON.parse(raw);

  console.log(`Found ${employees.length} employees to seed...`);

  // Clear existing employees
  const deleted = await prisma.employee.deleteMany();
  console.log(`Cleared ${deleted.count} existing employees`);

  // Bulk insert
  const result = await prisma.employee.createMany({
    data: employees.map((emp) => ({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email || null,
      extension: emp.extension || null,
      phoneNumber: emp.phoneNumber || null,
      did: emp.did || null,
      location: emp.location,
      team: emp.team,
      title: emp.title || null,
      jobTitle: emp.jobTitle || null,
      department: emp.department || null,
      photoUrl: emp.photoUrl || null,
      avatarUrl: emp.avatarUrl || null,
      region: emp.region || null,
    })),
  });

  console.log(`Seeded ${result.count} employees successfully!`);

  // Verify by region
  const regions = await prisma.employee.groupBy({
    by: ['region'],
    _count: true,
  });
  console.log('\nEmployees by region:');
  regions.forEach((r) => console.log(`  ${r.region || 'Unknown'}: ${r._count}`));
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
