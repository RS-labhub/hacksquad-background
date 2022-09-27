import {CronAbstract, QueueInterface} from "../../runners/runners.interface";
import schedule from "node-schedule";
import { parseExpression } from "cron-parser";
import { green } from "cli-color";
import moment from "moment";
import {QueueEvents, Worker} from 'bullmq';
import IORedis from 'ioredis';

export const connection = new IORedis({
    reconnectOnError(err) {
        return true;
    },
    maxRetriesPerRequest: null
});

export const CronService = (cron: CronAbstract<any>[]) => {
    return cron.map((s) => {
        const scheduleTime = s.schedule();
        s.handle();

        console.log(
            green(
                `[CRON] ${s.name().toUpperCase()}: Next Run ${moment(
                    parseExpression(scheduleTime).next().toDate()
                ).format("DD/MM/YYYY HH:mm")}`
            )
        );
        schedule.scheduleJob(s.schedule(), s.handle);
    });
};

export const QueueService = (queue: QueueInterface<any>[]) => {
    return queue.map((s) => {
        console.log(
            green(
                `[QUEUE] Listening to queue ${s.name()}`
            )
        );

        const queueEvents = new QueueEvents(s.name());
        queueEvents.on('completed', ({ jobId }) => {
            console.log(`processed ${s.name()} ${jobId}`);
        });
        new Worker(s.name(), async job => {
            await s.handle(job.data);
        }, {
            concurrency: s.numWorkers(),
            autorun: true,
            connection
        });
    });
};

