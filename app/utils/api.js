const axios = require('axios');

const id = "YOUR_CLIENT_ID";
const secret = "YOUR_SECRET_ID";
const params = `?client_id=${id}&client_secret=${secret}`;

function getProfile (username) {
    return axios.get(`https://api.github.com/users/${username}${params}`)
    .then(user => {
        return user.data;
    });
}
function getRepos (username) {
    return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`)
}
function getStarCount (repos) {
    return repos.data.reduce((count, repo) => {
        return count + repo.stargazers_count
    }, 0)
}
//followers destructured from incoming parameter -> profile -> profile.followers
function calculateScore ({ followers }, repos) {
    let totalStars = getStarCount(repos);
    return (followers * 3) + totalStars;
}
function handleError (error) {
    console.warn(error);
    return null;
}
function getUserData (player) {
    //using Promise is newer instead of axios (new browsers have promise integrated) but old browsers we need to use a polyfill with babel
    return Promise.all([
        getProfile(player),
        getRepos(player)
        //destructuring the data coming in from promise.all (data[0] and data[1] calling them profile and repos)
    ]).then(([profile, repos]) => ({
        //RETURNING OBJECT WITH keys and values
            profile,
            score: calculateScore(profile, repos)
        }))
}
function sortPlayers (players) {
    return players.sort((a,b) => { //every array has sort method
        return b.score - a.score //this is how to find highest # aka winner
    })
}

module.exports = {
    //no need for arrow function or function keyword, these are methods on an object new ES6: song(x) {example}
    battle(players) {
        return Promise.all(players.map(getUserData))
        .then(sortPlayers)
        .catch(handleError)
    },

    fetchPopularRepos(language) {
        var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'+ language + '&sort=stars&order=desc&type=Repositories');

        return axios.get(encodedURI)
        .then(response => {
            return response.data.items;
        })
    }
}
