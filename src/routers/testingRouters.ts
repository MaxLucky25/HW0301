import { Router } from 'express';
import {
    blogCollection,
    commentCollection,
    postCollection, requestLogsCollection,
    revokedTokensCollection, sessionsCollection,
    userCollection
} from "../db/mongo-db";


export const testingRouters = Router();

testingRouters.delete('/all-data', async (req, res) => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
    await userCollection.deleteMany({});
    await commentCollection.deleteMany({});
    await revokedTokensCollection.deleteMany({});
    await requestLogsCollection.deleteMany({});
    await sessionsCollection.deleteMany({});
    res.sendStatus(204);
});

