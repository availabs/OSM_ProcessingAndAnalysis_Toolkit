const _ = require('lodash')

module.exports = feature => _(feature.geometry.coordinates)
  .flattenDeep()
  .chunk(2)
  .uniqWith(_.isEqual)
  .value()


