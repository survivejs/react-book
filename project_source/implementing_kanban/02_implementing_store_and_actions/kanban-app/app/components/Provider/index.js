if(process.env.NODE_ENV === 'production') {
  module.exports = require('./Provider.prod');
}
else {
  module.exports = require('./Provider.dev');
}