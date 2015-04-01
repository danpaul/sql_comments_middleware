var SqlComment = require('sql_comment')

// Todo: validation (all around)

module.exports = function(app, settings) {

    // see sql_comment docs for settings
    sqlComment = new sqlComment(settings)

// sqlComment.add(userId, postId, 0, 'This is a comment', callbackB)

    // parentId should be 0 if comment is top level
    // 
    app.post('/post/:userId/:postId/:parentId', function(req, res, next){
        sqlComment.add(req.params.userId,
                       req.params.postId,
                       req.params.parentId,
                       req.body.comment
                       function(err){

            if( err ){
                res.send('fail!');
            } else {
                res.send('you rock!');
            }
        })
    })
};