import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware';
import { RunCodeUseCase } from '../../application/use-cases/compiler/runCodeUseCase';
import { ListLanguagesUseCase } from '../../application/use-cases/compiler/listLanguagesUseCase';
import { CompilerController} from '../controllers/compiler/compiler.controller';
import { Judge0Service } from '../../infrastructure/external/services/judge0Service';

const router=express.Router()
router.use(authenticateToken)

const judge0Service=new Judge0Service()
const runCodeUseCase=new RunCodeUseCase(judge0Service)
const listLanguagesUseCase=new ListLanguagesUseCase(judge0Service)
const compilerController=new CompilerController(runCodeUseCase,listLanguagesUseCase)

router.post('/run',(req,res)=>compilerController.runCode(req,res))
router.get('/languages',(req,res)=>compilerController.listLanguages(req,res))

export default router