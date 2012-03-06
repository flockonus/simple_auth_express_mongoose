

exports.pageA = function(req, res){
  res.render('site/pageA', req.viewVars);
};

exports.pageB = function(req, res){
  res.render('site/pageB', req.viewVars);
};

