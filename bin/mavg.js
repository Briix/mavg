#!/usr/bin/env node

var program = require('commander')
var request = require('request')
var Table = require('cli-table')

var version = '1.0.0'
var API_BASE = 'http://www.omdbapi.com/?'

program
  .version(version)
  .option('-t, --title <title>', 'Specify title to get ratings for')
  .option('-y, --year <year>', 'Specify year title is from')
  .parse(process.argv)

var urlOptions = {
  t: program.title || undefined,
  y: program.year || undefined,
  tomatoes: true
}

var table = new Table({
  head: ['IMDB', 'Rotten Tomatoes', 'Avg']
})

if (program.title) {
  request(API_BASE + processUrlOptions(urlOptions), omdbCallback)
} else {
  process.stderr.write('A title must be specified. See --help for more information')
}

function omdbCallback (err, resp, body) {
  if (err) return process.stderr.write('Oh noes, errors', err)
  if (resp.statusCode !== 200) return process.stderr.write('OMDB didn\'t return status code 200, please try again later')

  var ratings = JSON.parse(body)
  formatRatings(ratings)
}

function formatRatings (ratings) {
  var imdbRating = parseFloat(ratings.imdbRating)
  var tomatoRating = parseFloat(ratings.tomatoRating)

  table.push([imdbRating, tomatoRating, (imdbRating + tomatoRating) / 2])

  var formattedOutput = addMovieTitle(ratings.Title, ratings.Year, table.toString())
  process.stdout.write(formattedOutput)
}

function addMovieTitle (title, year, table) {
  return `
 Movie: ${title} \n
 Year: ${year} \n
${table}
  `
}

function processUrlOptions (obj) {
  var objKeys = Object.keys(obj)
  var objLength = objKeys.length
  var optionString = ''

  for (var i = 0; i < objLength; i++) {
    if (obj[objKeys[i]]) optionString += `${objKeys[i]}=${obj[objKeys[i]]}`

    if (i !== objLength - 1) {
      optionString += '&'
    }
  }

  return optionString
}
