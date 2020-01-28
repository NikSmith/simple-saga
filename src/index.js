class Saga {
  constructor(options) {
    this.options = { ...options }
    this.tasks = [];
    this.context = {};
  }
  _runTransaction(task, ctx) {
    const startAt = new Date().getTime();
    return new Promise((resolve, reject) => {
      return task.transaction.call(this.context, ctx).then(res => {
        ctx["$time"][task.id] = new Date().getTime() - startAt;
        ctx[task.id] = res
        return res;
      }).then(resolve).catch(reject);
    });
  }
  _runCompensation(task, ctx) {
    return new Promise((resolve, reject) => {
      return task.compensation.call(this.context, ctx).then(resolve).catch(reject);
    });
  }
  withContext(ctx) {
    this.context = ctx;
    return this;
  }
  addTask(task) {
    const { id, transaction, compensation } = task;
    let ln = this.tasks.length;
    let lastOrder = ln > 0 ? this.tasks[ln-1].order : -1
    this.tasks.push({ id,  transaction, compensation, order: lastOrder+1 });
    return this;
  }
  addParallelTasks(...tasks) {
    let ln = this.tasks.length;
    let lastOrder = ln > 0 ? this.tasks[ln-1].order : -1
    tasks.forEach(task => {
      const { id, transaction, compensation } = task;
      this.tasks.push({ id, transaction, compensation, order: lastOrder+1 });  
    });
    return this;
  }
  async run(data) {
    const startAt = new Date().getTime();
    let order = 0;
    let ln = this.tasks.length;
    let ctx = { $global: data, $time: {} };
    while(ln > 0 && order<=this.tasks[ln-1].order) {
      let tasks = this.tasks.filter(task => task.order === order);
      let results = await Promise.allSettled(tasks.map(task => this._runTransaction(task, ctx, startAt)));
      let error = results.find(result => result.status === 'rejected');
      if (error) {
        tasks = this.tasks.filter(task => task.order <= order && !!task.compensation && !!ctx[task.id]).reverse();    
        let result = await Promise.all(tasks.map(task => this._runCompensation(task, ctx)))
          .then(res => null).catch(err => err);
        let endAt = new Date().getTime();
        return { error: error.reason, compensationError: result, ctx, time: endAt - startAt };
      }
      order++;
    }
    let endAt = new Date().getTime();
    return { error: null, compensationError: null, ctx, time: endAt - startAt };
  }
}
module.exports = Saga;
