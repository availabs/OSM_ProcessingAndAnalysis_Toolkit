const concaveman = require('concaveman')
const _ = require('lodash')
const turf = require('@turf/turf')

const getCoords = require('./getCoords')

module.exports = function (polygon) {
  const coords = getCoords(polygon)

  const poly = concaveman(coords, 1)

  const concaveHullPoly = _.cloneDeep(polygon)
  concaveHullPoly.geometry.coordinates = [poly]

  const union = turf.union(polygon, concaveHullPoly)

  // concaveHullPoly already a deep copy of polygon,
  //   therefore union is a defensive copy.
  union.properties = concaveHullPoly.properties

  return _.cloneDeep(union)
}
