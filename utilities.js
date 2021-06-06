exports.notAuthorized = function(){
    ret = {
        statusCode: 400,
        message: "You are not authorized to perform this operation"
    };
    return ret;
}

exports.alreadyAssociated = function(){
    ret = {
        statusCode: 400,
        message: "You are already associated with an organization"
    }
    return ret;
}

exports.getPageParams = function(req){
    var page = req.query.page || 1;
    var limit = req.query.perPage || 20;
    var offset = (parseInt(page)-1)*parseInt(limit);
    var pageParams = {
        page: page,
        limit: limit,
        offset: offset
    };
    return pageParams;
}


exports.makeid = function(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() *  charactersLength)));
   }
   return result.join('');
}
