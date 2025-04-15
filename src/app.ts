import express from 'express';
import { blogsRouter } from './routers/blogRouters';
import { postsRouter } from './routers/postRouters';
import { testingRouters } from './routers/testingRouters';
import {userRouter} from "./routers/userRouters";
import {authRouter} from "./routers/authRoutes";
import cors from 'cors';
import {commentRouter} from "./routers/commentRouters";
import cookieParser from "cookie-parser";
import { logRequestMiddleware } from './middlewares/logRequestMiddleware';
import { requestCountMiddleware } from './middlewares/requestCountMiddleware';
import { securityRouter } from './routers/securityRouter';





const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser())
app.use(logRequestMiddleware);
app.use(requestCountMiddleware);

app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/testing', testingRouters);
app.use('/users', userRouter)
app.use('/auth', authRouter);
app.use('/comments', commentRouter);
app.use("/security", securityRouter);

export default app;