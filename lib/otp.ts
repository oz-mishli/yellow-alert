import { prisma } from "./prisma";

const OTP_TTL_MINUTES = 5;

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(phone: string): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await prisma.otpToken.create({ data: { phone, code, expiresAt } });
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return false;

  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });
  await prisma.subscriber.upsert({
    where: { phone },
    update: { verified: true },
    create: { phone, verified: true },
  });

  return true;
}
