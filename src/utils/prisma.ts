import { PrismaClient } from "../../prisma/generated/main"
import "dotenv/config";
const prisma = new PrismaClient()

export { prisma }