# NStrategy market

Binary trading with custom-specific strategies. Noti to telegram

## Install
```
npm install
```

## Update .env
- Copy `.env_sample` to `.env`
- Correct value in `.env`

## Dev
```
npm start
```

## Build release for prod and staging
```
npm run build
```

## Deploy to integration [HEROKU]

### Getting started with Heroku
```
heroku login
heroku create <app name>
git add .
git commit -m 'deploy to heroku'
git push heroku master

Test at: <app name>.herokuapp.com
Log view: heroku logs -t
``` 
