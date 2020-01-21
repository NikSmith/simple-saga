const Saga = require("../src");
var globalContext = {logger: console.log}
var fn1 = function (ctx) {  
  return new Promise(resolve => {
    setTimeout(() => resolve('fn result 1'), 1000);
  });
}

var fn2 = function (ctx) {
  return Promise.resolve('fn2 resolve');
}

var fn3 = function (ctx) {
  return Promise.resolve('fn2 resolve');
}

var fn4 = function (ctx) {
  throw new Error('Error fn4')
}

var cp1 = function (ctx) {
  this.logger('Start compensation 1');
  return Promise.reject('cp1');
}

var cp3 = function(ctx) {
  this.logger('Start compensation 3');
  return Promise.resolve('cp3');
}

var cp4 = function(ctx) {
  this.logger('Start compensation 4');
  return Promise.resolve('cp4');
}

var saga = new Saga({});
saga.addTask({
  id: "t1",
  transaction: fn1,
  compensation: cp1
}).addParallelTasks(
  {
    id: "t2",
    transaction: fn2
  },
  {
    id: "t3",
    transaction: fn3,
    compensation: cp3
  }
)
.addTask({
  id: "t4",
  transaction: fn4,
  compensation: cp4
})
.withContext(globalContext);

const main = async () => {
  let result = await saga.run({userId: 123});
  console.log('Result: ', result);
}

main();