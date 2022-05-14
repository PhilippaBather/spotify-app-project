// pull in dependencies
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');

// create app by calling express library
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening at port 3000'));

app.use(express.static('public'));

// add to server ability to parse any incoming data as json 
app.use(express.json({ limit: '1mb'}));

app.get('/artist/:artist', async (request, response) => {
    const artist = request.params.artist;
    const access_token = await getToken();
    const artist_data = await getArtist(access_token, artist);
    response.json(artist_data);
});

app.get('/related/:id', async (request, response) => {
    const id = request.params.id;
    const access_token = await getToken();
    const related_data = await getRelatedArtists(access_token, id);
    response.json(related_data);
})

// get Spotify Token
const getToken = async() => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET; 

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials'
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data.access_token;
    } catch (err) {
        return {Error: err.stack};
    }
};

const getArtist = async(token, artist) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, {
                method: 'GET',
                headers: { 'Authorization' : 'Bearer ' + token}
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            return data.artists.items;
        } catch (err) {
            return {Error: err.stack};
        }
};

const getRelatedArtists = async (token, artistId) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data.artists;        
    } catch (err) {
        return {Error: err.stack};
    }
};

