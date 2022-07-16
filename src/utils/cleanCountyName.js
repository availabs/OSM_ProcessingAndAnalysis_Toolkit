const cleanCountyName = countyName =>
  countyName
    .replace(/[^a-z ]/i, '')
    .replace(/ +/, '_')
    .toLowerCase()

module.exports = cleanCountyName
