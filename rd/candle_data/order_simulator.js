/*
 * MIT License
 *
 * Copyright (c) 2018 Nhan Cao
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
const fs = require('fs');
const request = require('request');

const writeStream = fs.createWriteStream('order-results.txt', {flags: 'w'});
const inputFileList = [
  // 'alpari_candles_test.txt',
  // 'cosam_type_1.txt',
  // 'cosam_type_2.txt',
  'cosam_type_3.txt',
  // 'cosam_type_4.txt',
  // 'cosam_type_5.txt',
  // 'cosam_type_6.txt',
  // 'cosam_type_6_1.txt',
  // 'cosam_type_7.txt',
  // 'cosam_type_7_1.txt',
  // 'cosam_type_8.txt',
  // 'cosam_type_8_1.txt',
  // 'cosam_type_8_2.txt',
  // 'cosam_type_8_3.txt',
  // 'cosam_type_8_4.txt',
  // 'cosam_type_8_5.txt',
  // 'cosam_type_8_6.txt',
  // 'alpari_candles_18_09_2019.txt',
  // 'alpari_candles_19_09_2019.txt',
  // 'alpari_candles_20_09_2019.txt',
  // 'alpari_candles_21_09_2019.txt',
  // 'alpari_candles_22_09_2019.txt',
  // 'alpari_candles_23_09_2019.txt',
  // 'alpari_candles_24_09_2019.txt',
  // 'alpari_candles_25_09_2019.txt',
  // 'alpari_candles_26_09_2019.txt',
  // 'alpari_candles_27_09_2019.txt',
  // 'alpari_candles_28_09_2019.txt',
  // 'alpari_candles_29_09_2019.txt',
  // 'alpari_candles_30_09_2019.txt',
  // 'alpari_candles_01_10_2019.txt',
  // 'alpari_candles_02_10_2019.txt',
  // 'alpari_candles_03_10_2019.txt',
  // 'alpari_candles_04_10_2019.txt',
  // 'alpari_candles_05_10_2019.txt',
  // 'alpari_candles_06_10_2019.txt',
  // 'alpari_candles_07_10_2019.txt',
  // 'alpari_candles_08_10_2019.txt',
  // 'alpari_candles_09_10_2019.txt',
  // 'alpari_candles_10_10_2019.txt',
  // 'alpari_candles_11_10_2019.txt',
  // 'alpari_candles_12_10_2019.txt',
  // 'alpari_candles_13_10_2019.txt',
  // 'alpari_candles_14_10_2019.txt',
  // 'alpari_candles_15_10_2019.txt',
  // 'alpari_candles_16_10_2019.txt',
  // 'alpari_candles_17_10_2019.txt',
  // 'alpari_candles_18_10_2019.txt',
  // 'alpari_candles_19_10_2019.txt',
  // 'alpari_candles_20_10_2019.txt',
  // 'alpari_candles_21_10_2019.txt',
];

// @nhancv 9/26/19: LOGGING CONFIG
const empty = () => {
};
const logging = (msg) => {
  console.log(msg);
  writeStream.write(msg + '\n');
};
// @nhancv 10/1/19: Run test on each day
const runEachDayTest = false;
// @nhancv 10/1/19: Enable detail log
const orderStrategyLogging = true;
const orderLog = orderStrategyLogging ? logging : empty;

// @nhancv 9/26/19: Prepare data input
// Return array of [amount, color, time]
const getData = (inputFileList) => {
  logging('Get data from input file.');
  // @nhancv 9/26/19: data item = [amount, color, time] where color is GREEN or RED__
  const data = [];
  inputFileList.forEach(i => {
    logging(`Processing on ${i}`);
    const contents = fs.readFileSync(`data/${i}`, 'utf8').split("\n").filter(line => line.trim().length > 0);
    contents.forEach(line => {
      const lineDataArr = line.split(" ");
      data.push([lineDataArr[1], lineDataArr[2], lineDataArr[0]]);
    });
  });
  logging('Get data completed.');
  return data;
};

// @nhancv 9/26/19: Apply strategy
const runStrategy = async (data) => {
  let balance = 2500;
  let fee = 0.05;
  logging(`Start strategy with balance $${balance}, fee ${fee * 100}%`);

  // @nhancv 9/26/19: Define strategy here

  // const finalBalance = defaultOrder(balance, fee, data);
  const finalBalance = await externalOrder("cosam_order", balance, fee, data);

  ////////////////////////////////////////
  logging(`End of strategy with balance $${finalBalance} => ${finalBalance >= balance ? 'WIN' : 'LOSE'} (${(finalBalance - balance).toFixed(2)})`);
  return finalBalance - balance;

};

// @nhancv 9/26/19: Implement default order
// return balance
const defaultOrder = (balance, fee, data) => {
  logging(`DEFAULT ORDER STARTING`);
  // @nhancv 9/26/19: amount for each order
  // const amountOrders = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 9, 27, 81, 162, 357];
  // const amountOrders = [1, 2, 4];
  const amountOrders = [0, 0, 0, 0, 0, 1, 2, 5, 10, 20, 0, 0, 0, 0, 0, 0, 0];
  logging(`Amount strategy ${amountOrders}`);
  // @nhancv 9/26/19: last order command where [type, amount] which type is 0: buy or 1: sell
  const nextOrder = [0, 0];
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    // @nhancv 9/26/19: Extract amount
    let amountCandle = parseInt(candle[0]);
    // @nhancv 9/26/19: Extract color where 0: green and 1: red
    let color = candle[1] === 'GREEN' ? 0 : 1;
    // @nhancv 9/26/19: Extract time
    let time = candle[2];

    // @nhancv 9/26/19: Check result with lastOrder
    if (nextOrder[1] > 0) {
      let profit = 0;
      if (nextOrder[0] === color) {
        // @nhancv 9/26/19: WIN
        profit = (1 - fee) * nextOrder[1];
      } else {
        // @nhancv 9/26/19: LOSE
        profit = -nextOrder[1];
      }
      if (profit !== 0) {
        balance += profit;
        balance = Number(Number(balance).toFixed(2));
        orderLog(`                => ${profit > 0 ? 'WIN: $' : 'LOSE: -$'}${Math.abs(profit)} -> Balance: $${balance}`);
      }
    }

    // @nhancv 9/26/19: Make new order
    if (i === data.length - 1) {
      // @nhancv 9/26/19: skip at last candle, just for order result
      continue;
    }
    if (amountCandle - 1 < amountOrders.length) {
      let orderAmount = amountOrders [amountCandle - 1];
      if (orderAmount > 0) {
        // Order with opposite current color
        nextOrder [0] = color === 0 ? 1 : 0;
        nextOrder [1] = orderAmount;
      } else if (orderAmount < 0) {
        // Order with same current color
        nextOrder [0] = color;
        nextOrder [1] = -orderAmount;
      } else {
        // @nhancv 9/26/19: Cancel order
        nextOrder [1] = 0;
      }
      // @nhancv 9/26/19: Log order command
      if (nextOrder[1] > balance) {
        nextOrder [1] = 0;
        logging(`${time} GAME OVER....`);
        break;
      } else if (nextOrder [1] > 0) {
        orderLog(`${time} ${nextOrder [0] === 0 ? 'BUY' : 'SELL'} ${nextOrder[1]} at ${amountCandle} ${candle[1]}`)
      }
    } else {
      // @nhancv 9/26/19: Cancel order
      nextOrder [1] = 0;
    }
  }
  logging(`DEFAULT ORDER COMPLETED`);
  return balance;
};

// @nhancv 9/26/19: Implement external order
// return balance
const externalOrder = async (orderId, balance, fee, data) => {
  const accountId = 'order_sim';
  logging(`${orderId.toUpperCase()} STARTING`);
  await externalCleanOrderPromise(orderId, accountId);
  // @nhancv 9/26/19: amount for each order
  const amountOrders = [1, 3, 7, 16, 37, 77, 160, 350, 700];

  logging(`Amount strategy ${amountOrders}`);
  // @nhancv 9/26/19: last order command where [type, amount] which type is 0: buy or 1: sell
  const nextOrder = [0, 0];
  // @nhancv 10/18/19: Prepare empty color list
  const colorList = [];
  for (let i = 0; i < 33; i++) {
    colorList.push(2);
  }
  // @nhancv 10/18/19: Simulate on data
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    // @nhancv 9/26/19: Extract amount
    let amountCandle = parseInt(candle[0]);
    // @nhancv 9/26/19: Extract color where 0: green and 1: red
    let color = candle[1] === 'GREEN' ? 0 : 1;
    colorList.splice(0, 1);
    colorList.push(color);
    // @nhancv 9/26/19: Extract time
    let time = candle[2];

    // @nhancv 9/26/19: Check result with lastOrder
    if (nextOrder[1] > 0) {
      let profit = 0;
      if (nextOrder[0] === color) {
        // @nhancv 9/26/19: WIN
        profit = (1 - fee) * nextOrder[1];
      } else {
        // @nhancv 9/26/19: LOSE
        profit = -nextOrder[1];
      }
      if (profit !== 0) {
        balance += profit;
        balance = Number(Number(balance).toFixed(2));
        orderLog(`                => ${profit > 0 ? 'WIN: $' : 'LOSE: -$'}${Math.abs(profit)} -> Balance: $${balance}`);
      }
    }

    // @nhancv 9/26/19: Make new order
    if (i === data.length - 1) {
      // @nhancv 9/26/19: skip at last candle, just for order result
      continue;
    }
    // await new Promise(resolve => setTimeout(resolve, 67*1000));
    // @nhancv 10/14/19: Strategy test request
    const body = await externalOrderPromise(orderId, accountId, color === 0, amountCandle, colorList, amountOrders);
    nextOrder [0] = body["body"]["buy"] === true ? 0 : 1;
    nextOrder [1] = body["body"]["amount"];
    if (nextOrder[1] > balance) {
      nextOrder [1] = 0;
      logging(`${time} GAME OVER.`);
      break;
    } else if (nextOrder [1] > 0) {
      orderLog(`${time} ${nextOrder [0] === 0 ? 'BUY' : 'SELL'} ${nextOrder[1]} at ${amountCandle} ${candle[1]} ${body["body"]["data"] ? '(' + body["body"]["data"] + ')' : ''}`)
    }
  }
  logging(`${orderId.toUpperCase()} COMPLETED`);
  return balance;
};

// @nhancv 10/18/19: Clear order config cache
const externalCleanOrderPromise = async (orderId, accountId) => {
  const body = {
    strategyId: orderId,
    accountId: accountId,
  };
  return new Promise((resolve, reject) => {
    request.put({
      headers: {'content-type': 'application/json', 'token': 'dtGAu6qL7CD2tMtYMMKxUUzQQ6Emhbtd'},
      url: 'http://localhost:7777/api/strategy',
      body: JSON.stringify(body)
    }, (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(body);
      }
      resolve(JSON.parse(body));
    });
  });
};

// @nhancv 10/18/19: Run external order
const externalOrderPromise = async (orderId, accountId, isGreen, candles, colorList, accountAmounts) => {
  const body = {
    strategyId: orderId,
    isGreen: isGreen,
    candles: candles,
    colorList: colorList,
    accountId: accountId,
    accountAmounts: accountAmounts
  };
  return new Promise((resolve, reject) => {
    request.post({
      headers: {'content-type': 'application/json', 'token': 'dtGAu6qL7CD2tMtYMMKxUUzQQ6Emhbtd'},
      url: 'http://localhost:7777/api/strategy',
      body: JSON.stringify(body)
    }, (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(body);
      }
      resolve(JSON.parse(body));
    });
  });
};

// @nhancv 9/26/19: Start program here
(async () => {
  if (runEachDayTest) {
    let totalOffset = 0;
    for (let i = 0; i < inputFileList.length; i++) {
      let input = inputFileList[i];
      const data = getData([input]);
      const offset = await runStrategy(data);
      totalOffset += offset;
      logging(`--------------------------`);
    }
    logging(`Final ${totalOffset < 0 ? 'LOSE -$' : 'WIN $'}${Math.abs(totalOffset).toFixed(2)}`);
  } else {
    const data = getData(inputFileList);
    await runStrategy(data);
  }

})();

