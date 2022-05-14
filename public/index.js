/** 
 * UIController: Handles the user input fields populating them with received data
 * APPController: interacts with the server to receive data to be populated on page by calling UIController functions
**/

const UIController = (function() {
    // object holds references to HTML selectors
    const DOMElements = {
        artistBtnSubmit: '#btn-submit',
        imageDiv: '#image-container',
        widgetDiv: '#widget-container',
        appInfo: '.index-title__info',
        artist: '.artist-info',
        form: '.artist-form',
        genres: '.artist-genres',
        related: '.related-artists',
        spotify: '.spotify-link',
        title: '.index-title',
    }

    // public methods
    return {

        inputField() {  // function to get input fields
            return {
                artist: document.querySelector(DOMElements.artist),
                form: document.querySelector(DOMElements.form),
                genres: document.querySelector(DOMElements.genres),
                image: document.querySelector(DOMElements.imageDiv),
                info: document.querySelector(DOMElements.appInfo),
                related: document.querySelector(DOMElements.related),
                spotify: document.querySelector(DOMElements.spotify),
                submit: document.querySelector(DOMElements.artistBtnSubmit),
                title: document.querySelector(DOMElements.title),
                widget: document.querySelector(DOMElements.widgetDiv),
            }
        },

        artistNotFound(artistName) {
            // (re-)populate .index-title with app name
            this.inputField().title.style.display = 'block';
            this.inputField().title.textContent = 'ArtistSpot';
            // remove previous search results; notify user of unsuccessful search
            this.inputField().info.style.display = 'block';
            this.inputField().info.textContent = `${artistName} not found - looks like you're ahead of the curve.`;
            this.inputField().artist.style.display = 'none';
        },
        
        populateArtistName(artistName) {
            // change .index-title to reference found artist
            this.inputField().title.textContent = `Top 10 Tracks by ${artistName}`;
            // remove app opening page info
            this.inputField().info.style.display = 'none';
        },

        createImage(imgURL) {
            // (re-)populate img in artist info section
            this.inputField().artist.style.display = 'block';
            const img = this.inputField().image;
            img.textContent = '';
            const html =
            `
            <img src="${imgURL}" alt="artist photo" class="artist-img">
            `;
            img.insertAdjacentHTML('beforeend', html);
        },

        createWidget(artistId) {
            // (re-)populate widget in artist info section
            const widget = this.inputField().widget;
            widget.textContent = '';
            const html =
            `
            <iframe src="https://open.spotify.com/embed/artist/${artistId}" class="playlist" width="500" height="400" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            `;
            widget.insertAdjacentHTML('beforeend', html);
        },

        populateGenres(genres) {
            // (re-)populate genres in artist info section
            const targetNode = this.inputField().genres;
            targetNode.textContent = '';
            // convert object array to string object
            let text = genres.toString();
            const html = `<b>#Genres<b>: ${text}`;
            targetNode.insertAdjacentHTML('beforeend', html);
        },

        populateRelatedArtists(relatedData) {
            // (re-)populate related artists in artist info section
            const artists = [];
            const targetNode = this.inputField().related;
            targetNode.textContent = '';
            relatedData.forEach(element => {
                console.log(element.name);
                artists.push(element.name);           
            }); 
            const text = artists.toString();
            const html = `<b>#RelatedArtists</b>: ${text}`;
            targetNode.insertAdjacentHTML('beforeend', html);
        },

        // Spotify Link
        createSpotifyLink() {
            this.inputField().spotify.style.display = 'block';
        },
    }    
})();

const APPController = (function(UICtrl) {

    // get input field object references
    const DOMInputs = UICtrl.inputField();

    // submit button event listener on click
    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();        // prevent page reset

        const artist = document.querySelector('#artist').value ;    // get artist name from browser
        
        // fetch artist data from server
        const api_artist = `/artist/${artist}`;
        const response = await fetch(api_artist);
        const artist_json = await response.json();

        // if first item in array undefined; no artists data available
        if (artist_json[0] === undefined) {
            console.log("Artist not found");
            UICtrl.artistNotFound(artist);
        } else {
            // retrieve and save to var relevant data from artist_json 
            const artist_genres = artist_json[0].genres;
            const artist_id = artist_json[0].id;
            const artist_img_url = artist_json[0].images[0].url;
            const artist_name = artist_json[0].name;

            // fetch related artist data from server
            const api_artist = `/related/${artist_id}`;
            const response = await fetch(api_artist);
            const related_json = await response.json();

            // call UICtrl methods to handle population of data on web page
            UICtrl.populateArtistName(artist_name);
            UICtrl.createImage(artist_img_url);
            UICtrl.createWidget(artist_id);
            UICtrl.populateGenres(artist_genres);
            UICtrl.populateRelatedArtists(related_json);
            UICtrl.createSpotifyLink();
        }       
    });

    return {
        init() {
            console.log('App is starting.');
        }
    }

})(UIController);

APPController.init();


