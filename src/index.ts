
import express, {Request, Response} from 'express';
import { prisma } from './database';

async function routes(){
    const app = express();
    app.use(express.json())
    
    
    async function searchUser(title: string) {
      const query = await prisma.task.findFirst({
        where: {
          title: title,
        },
      });
    
      return query;
    }

    app.post('/newTask', async (req: Request, res: Response) => {
    
        const {title , desc} = req.body;

        const verifyIfExistsTask = await prisma.task.findFirst({
            where: {
              title,
            },
          })
        
          if(verifyIfExistsTask){
            return res.status(400).json({error:"Essa tarefa ja existe!"})
          }

        const newTask = await prisma.task.create({
            data:{
                title,
                desc,
            }
        })
        return res.json(newTask)
    })

    app.get('/tasks', async (req:Request, res: Response) => {

      const allTasks = await prisma.task.findMany()

      return res.json(allTasks)
    })

    app.get('/delTask', async (req: Request, res: Response,) => {

      const {title} = req.body;
      const userToDelete = await searchUser(title);

      if(userToDelete === null){
        return res.status(400).json({error:"Essa tarefa não existe!"})
      }

       const delTask = await prisma.task.delete({
         where:{
           id:userToDelete?.id
          },  
        })
      
     return res.json("Tarefa Excluída")
    })

    app.post("/upTask", async (req:Request, res:Response) => {
      const {title} = req.body;
      const userToChange = await searchUser(title);

      if(userToChange === null){
        return res.status(400).json({error:"Essa tarefa não existe!"})
      }
     
        const updateTask = await prisma.task.update({
          where:{
            id:userToChange?.id
          },
          data:{
            isDone:userToChange?.isDone === false ?  true : false
          }
        })
      
      return res.json(updateTask)
    })


    await app.listen(3333, () => console.log("Server is running"));
}

routes()