import { hash } from "bcryptjs";
import {
  Role,
  TaskPriority,
  TaskStatus,
} from "../src/generated/prisma/enums.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/lib/prisma.js";

const dayFromToday = (offset: number): Date => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const DEMO_USERS = [
  {
    name: "Alex Admin",
    email: "admin@example.com",
    password: "admin123",
    role: Role.Admin,
    jobTitle: "Operations Director",
    department: "Management",
  },
  {
    name: "Morgan Manager",
    email: "manager@example.com",
    password: "manager123",
    role: Role.Manager,
    jobTitle: "Team Lead",
    department: "Engineering",
  },
  {
    name: "Eli Employee",
    email: "employee@example.com",
    password: "employee123",
    role: Role.Employee,
    jobTitle: "Developer",
    department: "Engineering",
  },
];

async function main() {
  if (env.isProduction) {
    throw new Error(
      "Refusing to seed: NODE_ENV is production. The seed is for development only.",
    );
  }

  if (process.env.ALLOW_SEED !== "true") {
    throw new Error(
      "Refusing to seed: set ALLOW_SEED=true to confirm this is a development database.",
    );
  }

  const idByEmail = new Map<string, string>();

  for (const { password, ...data } of DEMO_USERS) {
    const passwordHash = await hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, passwordHash },
    });
    idByEmail.set(user.email, user.id);
  }

  const adminId = idByEmail.get("admin@example.com")!;
  const managerId = idByEmail.get("manager@example.com")!;
  const employeeId = idByEmail.get("employee@example.com")!;

  if ((await prisma.task.count()) > 0) {
    console.log("Tasks already exist, skipping sample tasks");
    return;
  }

  const sampleTasks = [
    {
      title: "Prepare the weekly report",
      description: "Collect numbers from each team and write the summary.",
      status: TaskStatus.InProgress,
      priority: TaskPriority.High,
      dueDate: dayFromToday(2),
      assigneeId: employeeId,
      authorId: managerId,
      comment: "Started collecting the numbers today.",
    },
    {
      title: "Update the onboarding checklist",
      description: "Add the new laptop and account setup steps.",
      status: TaskStatus.ToDo,
      priority: TaskPriority.Medium,
      dueDate: dayFromToday(7),
      assigneeId: managerId,
      authorId: adminId,
      comment: "Please keep it to one page.",
    },
    {
      title: "Fix the login page layout",
      description: "The form overflows on small phones.",
      status: TaskStatus.ToDo,
      priority: TaskPriority.High,
      dueDate: dayFromToday(-2),
      assigneeId: employeeId,
      authorId: managerId,
      comment: "This one is overdue, please prioritise.",
    },
    {
      title: "Archive last quarter's documents",
      description: "",
      status: TaskStatus.Done,
      priority: TaskPriority.Low,
      dueDate: dayFromToday(-5),
      assigneeId: adminId,
      authorId: adminId,
      comment: "All files moved to the archive folder.",
    },
  ];

  for (const { authorId, comment, ...task } of sampleTasks) {
    await prisma.task.create({
      data: {
        ...task,
        comments: { create: [{ authorId, text: comment }] },
        activity: {
          create: [{ actorId: authorId, message: "created this task" }],
        },
      },
    });
  }

  console.log(
    `Seeded ${DEMO_USERS.length} users and ${sampleTasks.length} tasks`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
