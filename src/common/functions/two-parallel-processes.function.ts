import { sleep } from './sleep.function';

export async function twoParallelProcesses<T>(
  processFn: (push: (item: T) => number) => Promise<void>,
  handlerFn: (item: T) => Promise<void>,
) {
  const pool: T[] = [];
  let isFinish = false;

  async function fistParallelProcess() {
    const pushFn = (item: T) => pool.push(item);
    await processFn(pushFn);

    isFinish = true;
  }

  async function secondParallelProcess() {
    while (!isFinish || !!pool.length) {
      const element = pool.shift();

      if (element === undefined) {
        await sleep(10);
        continue;
      }

      await handlerFn(element);
    }
  }

  await Promise.all([fistParallelProcess(), secondParallelProcess()]);
}
