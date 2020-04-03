/*
 * MIT License
 *
 * Copyright (c) 2019 Nhan Cao
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
 */
import moment from "moment";
import express, {Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import * as ENV from "./Env";
import * as Controller from "./Controller";
import IResponse from "./Model/IResponse";
import IStrategyReq from "./Model/IStrategyReq";

export async function execute() {

  const log = console.log;
  const config = ENV.get();
  const app = express();
  const port = parseInt(process.env.PORT || '7777');

  //////////////////////////////////////////////////////////////////
  /**
   * Config app
   */
  // Body parser: https://github.com/expressjs/body-parser
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  // CORS on ExpressJS: https://github.com/expressjs/cors
  // app.use(cors());
  // Cookie parser: https://github.com/expressjs/cookie-parser
  app.use(cookieParser());
  // Use gzip compression
  app.use(compression());
  // Config http logging with morgan
  morgan.token('date', (req, res, tz) => moment().utc().utcOffset("+0700").format());
  const morganFormat = '[:date] :method :url :status - :response-time ms :user-agent';
  app.use(morgan(morganFormat));
  //////////////////////////////////////////////////////////////////
  /**
   * Declare controller
   */
  const aboutController: Controller.IAbout = new Controller.About();
  const strategyController: Controller.IStrategy = new Controller.Strategy();

  /**
   * API calls, use Postman for testing
   * This block should declare before default route
   */
  // app.get('/api/about', aboutController.getAbout);
  app.post('/api/strategy', strategyController.getStrategy);
  app.put('/api/strategy', strategyController.cleanStrategy);

  //////////////////////////////////////////////////////////////////
  /**
   * Default routing
   */
  app.get('*', (req: Request, res: Response) => {
    let response: IResponse = {
      code: 200,
      body: 'Fuck you.'
    };
    return res.status(response.code).json(response);
  });

  /**
   * Start listen only on localhost domain
   */
  app.listen(port, 'localhost', () => {
    log('Server %s listening at port %d', config.env, port);
  });
}
