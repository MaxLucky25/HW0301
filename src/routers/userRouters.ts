import {Request, Response, Router} from "express";
import {authBasicMiddleware} from "../middlewares/authBasicMiddleware";
import {userValidators} from "../validators/userValidators";
import { userService } from "../services/userService";
import { inputCheckErrorsMiddleware } from "../middlewares/inputCheckErrorMiddleware";


export const userRouter = Router();

userRouter.get('/',
    authBasicMiddleware,
    async (req: Request, res: Response) => {
        const result = await userService.getUsers(req.query);
        res.status(200).json(result);
    });

userRouter.post('/',
    authBasicMiddleware,
    userValidators,
    inputCheckErrorsMiddleware,
    async (req: Request, res: Response) => {
        const result = await userService.createUserByAdmin(req.body);
        if (!result) {
            res.status(400);
            return;
        }
        res.status(201).json(result);
        return;
    });

userRouter.delete('/:id',
    authBasicMiddleware,
    async (req: Request, res: Response) => {
        const deleted = await userService.deleteUser(req.params.id);
        deleted ? res.sendStatus(204) : res.sendStatus(404);
    });

