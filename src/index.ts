import express, { Request, Response } from "express";
import { prisma } from "./database";

async function routes() {
  const cors = require("cors");
  const app = express();
  app.use(cors());
  app.use(express.json());

  const corsOptions = {
    origin: "*",
  };

  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );

    next();
  });

  async function searchUser(title: string) {
    const query = await prisma.task.findFirst({
      where: {
        title: title,
      },
    });

    return query;
  }

  app.post(
    "/newTask",
    cors(corsOptions),
    async (req: Request, res: Response) => {
      const { title, desc } = req.body;

      const verifyIfExistsTask = await prisma.task.findFirst({
        where: {
          title,
        },
      });

      if (verifyIfExistsTask) {
        return res.json("Essa tarefa ja existe!");
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          desc,
        },
      });
      return res.json(newTask);
    }
  );

  app.get("/tasks", cors(corsOptions), async (req: Request, res: Response) => {
    const allTasks = await prisma.task.findMany();

    return res.json(allTasks);
  });

  app.post(
    "/delTask",
    cors(corsOptions),
    async (req: Request, res: Response) => {
      const { title } = req.body;
      const userToDelete = await searchUser(title);

      if (userToDelete === null) {
        return res.status(400).json({ error: "Essa tarefa não existe!" });
      }

      const delTask = await prisma.task.delete({
        where: {
          id: userToDelete?.id,
        },
      });

      return res.json("Tarefa Excluída");
    }
  );

  app.post(
    "/upTask",
    cors(corsOptions),
    async (req: Request, res: Response) => {
      const { title } = req.body;
      const userToChange = await searchUser(title);

      if (userToChange === null) {
        return res.status(400).json({ error: "Essa tarefa não existe!" });
      }

      const updateTask = await prisma.task.update({
        where: {
          id: userToChange?.id,
        },
        data: {
          isDone: userToChange?.isDone === false ? true : false,
        },
      });

      return res.json(updateTask);
    }
  );

  await app.listen(3333, function () {
    console.log("CORS-enabled web server listening on port 3333");
  });
}

routes();
