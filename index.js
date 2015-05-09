/**

TODO: Input sanitiazation and validation
      Add user authentication checking
      Add flagging routes

*/

/*******************************************************************************

                    SETUP / HELPER FUNCTIONS

*******************************************************************************/

var ERROR_CASTING_VOTE = 'An error occured while trying to cast vote.';
var ERROR_DELETEING_RECORD = 'An error occured while trying to delete your record.';
var ERROR_SAVING_RECORD = 'An error occured while trying to save your record.';
var ERROR_RETRIEVING_RECORDS = 'An error occured while trying to get your records.';

var SqlComment = require('sql_comments');

var getReponseObject = function(){
    return{
        success: true,
        errorMessage: '',
        errorCode: null,
        data: null
    };
}

var handleDbResponse = function(err, errorMessage, res, data){

    var responseObject = getReponseObject();

    if( err ){
        responseObject.success = false;
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

    // see sql_comment docs for settings
    self.sqlComment = new SqlComment(settings, function(err){
        if( err ){ throw(err); }
    });


/*******************************************************************************

                    ROUTES

*******************************************************************************/

    app.delete('/comment/:commentId', function(req, res){
        sqlComment.delete(req.params.commentId, function(req, res){
            handleDbResponse(err, res, ERROR_DELETEING_RECORD)
        });
    });

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
    // do not include deleted comments
    app.get('/comments-formatted-all/:postId', function(req, res){
        sqlComment.getFormattedComments(req.params.postId,
                                        false,
                                        function(err, comments){

            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res, comments);
        });
    });

    // include deleted comments
    app.get('/comments-formatted/:postId', function(req, res){
        sqlComment.getFormattedComments(req.params.postId,
                                        true,
                                        function(err, comments){

            handleDbResponse(err, ERROR_RETRIEVING_RECORDS, res);
        });
    });

    // sqlComment.add(userId, postId, 0, 'This is a comment', callbackB)
    // parentId should be 0 if comment is top level
    app.post('/post/:postId/:parentId', function(req, res, next){
        self.sqlComment.add(req.body.userId,
                            req.params.postId,
                            req.params.parentId,
                            req.body.comment,
                            function(err){

            handleDbResponse(err, ERROR_SAVING_RECORD, res);
        });
    });

    app.post('/comment/vote/:direction/:commentId', function(req, res){
        if( req.params.direction === 'up' ){
            var vote = true;
        } else {
            var vote = false;
        }
        sqlComment.vote(req.body.userId,
                        req.params.commentId,
                        vote,
                        function(err){

            handleDbResponse(err, ERROR_CASTING_VOTE, res);
        });
    });

    return app;
}