"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const main_1 = require("../../prisma/generated/main");
require("dotenv/config");
const prisma = new main_1.PrismaClient();
exports.prisma = prisma;
