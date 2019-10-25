const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/static/libs'));
app.use(express.static(__dirname + '/static/game_js'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + 'static/index.html');
})

app.listen(5001,() => console.log('listening on port 5001'));
