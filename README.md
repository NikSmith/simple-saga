# Saga Pattern for distributed transactions
Implementation of SAGA pattern in JavaScript.

## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.12 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install simple-saga
```


## How to use it
```
var saga = new Saga({});
saga
  .addTask({ id: "createOrder", transaction: fn1, compensation: cp1 })
  .addParallelTasks(
    { id: "bookAuto", transaction: fn2 },
    { id: "buyTicket", transaction: fn3, compensation: cp3 }
  )
  .addTask({ id: "reserveHotel", transaction: fn4, compensation: cp4 });
  
saga.run({ startAt: dateStart, endAt: dateEnd });
```
