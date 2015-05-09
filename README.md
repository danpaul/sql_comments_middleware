## In Development

## About
A light wrapper/middleware for [sql_comments](https://github.com/danpaul/sql_comments)

## Example
Excerpt from Express app:

```
app.use(require('cookie-parser')(config.cookieSecret)); 
app.use(session({
    secret: 'super secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// see http://knexjs.org/ for documentation
var dbCreds = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sql_comment',
        port:  8889
    }
}

// installing knex and mysql is required
var knex = require('knex')(dbCreds);

// see https://github.com/danpaul/sql_comments/blob/master/settings.js
var options = {
    'knex': knex
};

var sqlCommentsMiddleware = require('sql_comments_middleware')(options);

app.use('/discussion', sqlCommentsMiddleware);
```

## API/Routes
See ./index.js