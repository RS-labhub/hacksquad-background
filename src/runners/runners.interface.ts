import {Queue} from "bullmq";
import {connection} from "../services/runner/runner.service";

export interface QueueInterface<T> {
  name(): string;
  numWorkers(): number;
  handle(arg: T): Promise<void>;
}

const queueList: any = {};

export abstract class CronAbstract<T>{
  abstract name(): string;
  abstract handle(): void;
  abstract schedule(): string;
  pushQueue(data: T) {
    queueList[this.name()] = queueList[this.name()] || new Queue(this.name(), {
      connection
    });
    queueList[this.name()].add('', data)
  }
}