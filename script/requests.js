window.addEventListener("DOMContentLoaded",async ()=>{
    var client_id = 'Piano Bounty';
    var redirect_uri = 'http://thisispianobounty.000webhostaspp.com';

    var app = express();

    app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
        }));
    });

    //let res = await fetch("https://api.spotify.com");
    //console.log(res);
});

