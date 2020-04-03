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

// https://github.com/BrainJS/brain.js#for-training-with-rnntimestep-lstmtimestep-and-grutimestep
const fs = require('fs');
const brain = require('brain.js');
const net = new brain.recurrent.LSTMTimeStep();
// array of color, 0: Green and 1: Red
const colorArray = fs.readFileSync('prediction-data.txt', 'utf8').split(" ").filter(line => line.trim().length > 0).map(s => parseInt(s));

function saveNetwork(net) {
  fs.writeFile("network.json", JSON.stringify(net.toJSON()), function (err) {
    if (err)
      return console.log(err);

    console.log("The network was saved!");
  });
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') { // no such file or directory. File really does not exist
      console.log("File does not exist.");
      return false;
    }
    console.log("Exception fs.statSync (" + path + "): " + e);
    return false;
  }
}

function loadNetwork() {
  if (fileExists('network.json')) {
    console.log('Load network from json');
    let obj = JSON.parse(fs.readFileSync('network.json', 'utf8'));
    net.fromJSON(obj);
  } else {
    console.log('Training.....');
    const trainingData = colorArray.slice(0, colorArray.length / 2);
    net.train([
      trainingData
    ]);
    saveNetwork(net);
  }
}

// loadNetwork();

console.log('Training completed');
const testData = colorArray.slice(colorArray.length / 2, colorArray.length - 1);
const segment = 20;
console.log(`Prediction....`);
let successWin = 0;
testData.forEach((c, i) => {
  net.train([
    colorArray.slice(Math.max(colorArray.length / 2 + i - segment, 0), colorArray.length / 2 + i)
  ]);
  const predictInput = colorArray.slice(Math.max(colorArray.length / 2 + i - 10, 0), colorArray.length / 2 + i);
  const output = net.run(predictInput) < 0.5 ? 0 : 1;
  if (output === c) successWin++;
  console.log(`Out: ${output} => Next color: ${output === 0 ? 'GREEN' : 'RED__'} | ${output === c ? 'Matched' : 'None-Matched'} | ${successWin}/${testData.length}`);
});
console.log(`Predict completed ${successWin}/${testData.length} = ${successWin / testData.length * 100}%`);
