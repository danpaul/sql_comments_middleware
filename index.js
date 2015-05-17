/**

TODO: Input sanitiazation and validation
      Add user authentication checking
      Add flagging routes

*/

/*******************************************************************************

                    SETUP / HELPER FUNCTIONS

*******************************************************************************/

var FAILURE_USER_NOT_LOGGED_IN = 'You must login or register.'

var ERROR_CASTING_VOTE = 'An error occured while trying to cast vote.';
var ERROR_DELETEING_RECORD = 'An error occured while trying to delete your record.';
var ERROR_SAVING_RECORD = 'An error occured while trying to save your record.';
var ERROR_RETRIEVING_RECORDS = 'An error occured while trying to get your records.';
var ERROR_SERVER = 'A server error occured. You may want to try again.';

var STATUS_ERROR = 'error';
var STATUS_FAILURE = 'failure';

var SqlComment = require('sql_comment');

var getReponseObject = function(){
    return{
        status: 'success',
        errorMessage: '',
        errorCode: null,
        data: null
    };
}

var getGenericErrorResponse = function(){
    var response = getReponseObject();
    response.status = STATUS_ERROR;
    response.errorMessage = ERROR_SERVER;
    return response;
}

var handleDbResponse = function(err, errorMessage, res, data){

    var responseObject = getReponseObject();

    if( err ){
        responseObject.status = 'error';
        responseObject.errorMessage = errorMessage;
        res.json(responseObject);
    } else {
        if(data){
            responseObject.data = data;
        }
        res.json(responseObject);
    }
}

/*******************************************************************************

                    MODULE

*******************************************************************************/

module.exports = function(settings){

    var self = this;
    var app = require('express')();

    // can be overwritten
    // should pass back (null, [true/false])
    self.checkUser = function(req, callback){
        if( req && req.session && req.session.isLoggedIn ){
            callback(null, true);
        } else {
            callback(null, false);
        }
    },

    self.isAuthenticated = function(req, res, next){
        var self = this;
        self.checkUser(req, function(err, isLoggedIn, user){
            var responseObject = getReponseObject();
            if( err ){
                console.log(err);
                res.json(getGenericErrorResponse());
                return;
            }
            if( !isLoggedIn ){
                responseObject.status = STATUS_FAILURE;
                responseObject.errorMessage = FAILURE_USER_NOT_LOGGED_IN;
                res.json(responseObject);
                return;
            }
            next();
        });
    },

    self.getUser = function(req, callback){
        callback(null, {id: req.session.userId});
    },

    // see sql_comment docs for settings
    self.sqlComment = new SqlComment(settings, function(err){
        if( err ){ throw(err); }
    });


/*******************************************************************************

                    ROUTES

*******************************************************************************/

    /** may add this back
        app.delete('/comment/:commentId',
                   self.isAuthenticated,
                   function(req, res){
            sqlComment.delete(req.params.commentId, function(req, res){
                handleDbResponse(err, res, ERROR_DELETEING_RECORD)
            });
        });
    */

    // passes back only non-deleted comments for post
    app.get('/comments/:postId', function(req, res){
        sqlComment.getComments(req.params.postId, false, function(err, comments){
            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res, comments);
        });
    });

    // passes back all comments for post
    app.get('/comments-all/:postId', function(req, res){
        sqlComment.getComments(req.params.postId, true, function(err, comments){
            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res, comments);
        });
    });

    // sqlComment.getFormattedComments(postId, true, function(err, comments){
    // include deleted comments
    app.get('/comments-formatted-all/:postId', function(req, res){
        sqlComment.getFormattedComments(req.params.postId,
                                        true,
                                        function(err, comments){

            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res, comments);
        });
    });

    // do not include deleted comments
    app.get('/comments-formatted/:postId', function(req, res){
        sqlComment.getFormattedComments(req.params.postId,
                                        false,
                                        function(err, comments){

            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res, comments);
        });
    });

    app.post('/comment/vote/:direction/:commentId',
             self.isAuthenticated,
             function(req, res){

        if( req.params.direction === 'up' ){
            var vote = true;
        } else {
            var vote = false;
        }

        self.getUser(req, function(err, user){
            if( err ){
                console.log(err);
                res.json(getGenericErrorResponse());
                return;
            }
            sqlComment.vote(user.id,
                            req.params.commentId,
                            vote,
                            function(err){

                handleDbResponse(err, ERROR_CASTING_VOTE, res);
            });
        })
    });

    // sqlComment.add(userId, postId, 0, 'This is a comment', callbackB)
    // parentId should be 0 if comment is top level
    app.post('/comment/:postId/:parentId',
             self.isAuthenticated,
             function(req, res, next){

        self.getUser(req, function(err, user){
            if( err ){
                console.log(err);
                res.json(getGenericErrorResponse());
                return;
            }

            self.sqlComment.add(user.id,
                                req.params.postId,
                                req.params.parentId,
                                req.body.comment,
                                function(err){

                handleDbResponse(err, ERROR_SAVING_RECORD, res);
            });
        });
    });

    // sqlComment.add(userId, postId, 0, 'This is a comment', callbackB)
    // parentId should be 0 if comment is top level
    app.post('/flag/:commentId',
             self.isAuthenticated,
             function(req, res, next){

        self.getUser(req, function(err, user){
            if( err ){
                console.log(err);
                res.json(getGenericErrorResponse());
                return;
            }

            self.sqlComment.flagUser(user.id,
                                     req.params.commentId,
                                     function(err){

                handleDbResponse(err, ERROR_SAVING_RECORD, res);    
            });
        });
    });

    return app;
}