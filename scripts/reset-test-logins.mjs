import { PrismaClient, ProfileType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const confirm = process.env.CONFIRM_RESET_TEST_LOGINS;
const password = process.env.RESET_LOGIN_PASSWORD;

if (process.env.NODE_ENV === 'production' && confirm !== 'reset test logins') {
  throw new Error('Refusing production login reset without CONFIRM_RESET_TEST_LOGINS="reset test logins".');
}

if (!password || password.length < 12) {
  throw new Error('RESET_LOGIN_PASSWORD must be at least 12 characters.');
}

const users = [
  { email: 'admin@ihype.org', username: 'admin', name: 'iHYPE Admin', role: Role.ADMIN },
  { email: 'artist@ihype.org', username: 'artist', name: 'Nova Pulse', role: Role.ARTIST },
  { email: 'venue@ihype.org', username: 'venue', name: 'Venue Owner', role: Role.VENUE },
  { email: 'promoter@ihype.org', username: 'promoter', name: 'DJ Echo', role: Role.DJ },
  { email: 'fan@ihype.org', username: 'fan', name: 'Night Owl', role: Role.FAN }
];

const profiles = [
  { username: 'artist', slug: 'artist', hexId: '0xreset000000000000000000000000000001', type: ProfileType.ARTIST, name: 'Nova Pulse' },
  { username: 'venue', slug: 'venue', hexId: '0xreset000000000000000000000000000002', type: ProfileType.VENUE, name: 'Venue Owner' },
  { username: 'promoter', slug: 'promoter', hexId: '0xreset000000000000000000000000000003', type: ProfileType.DJ, name: 'DJ Echo' },
  { username: 'fan', slug: 'fan', hexId: '0xreset000000000000000000000000000004', type: ProfileType.LISTENER, name: 'Night Owl' }
];

async function upsertTestUsersIfEmpty() {
  const existingCount = await prisma.user.count();
  if (existingCount > 0) return existingCount;

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: user,
      create: {
        ...user,
        isThirteenOrOlder: true,
        emailVerified: new Date()
      }
    });
  }

  for (const profile of profiles) {
    const owner = await prisma.user.findUniqueOrThrow({ where: { username: profile.username } });
    await prisma.profile.upsert({
      where: { slug: profile.slug },
      update: {
        ownerId: owner.id,
        name: profile.name,
        type: profile.type,
        genres: ['Test'],
        genre: 'Test',
        verified: true,
        isVerified: true
      },
      create: {
        slug: profile.slug,
        hexId: profile.hexId,
        ownerId: owner.id,
        name: profile.name,
        type: profile.type,
        headline: 'Test account',
        genres: ['Test'],
        genre: 'Test',
        verified: true,
        isVerified: true
      }
    });
  }

  return 0;
}

async function main() {
  const beforeCount = await upsertTestUsersIfEmpty();
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.mfaChallenge.deleteMany(),
    prisma.passwordResetCode.deleteMany(),
    prisma.magicLinkToken.deleteMany(),
    prisma.passkey.deleteMany(),
    prisma.user.updateMany({
      data: {
        passwordHash,
        emailVerified: now,
        mfaSecret: null,
        mfaEnabledAt: null,
        mfaBackupCodes: null,
        emailBounced: false
      }
    })
  ]);

  const afterUsers = await prisma.user.findMany({
    orderBy: { username: 'asc' },
    select: { username: true, email: true, role: true }
  });

  console.log(`Reset login state for ${afterUsers.length} users. Initial user count was ${beforeCount}.`);
  console.log(afterUsers.map((user) => `${user.username} <${user.email ?? 'no-email'}> ${user.role}`).join('\n'));
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
