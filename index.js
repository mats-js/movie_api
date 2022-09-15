const express = require('express'),
	morgan = require('morgan');

const app = express();

// define array of movie objects that later get handed over in JSON
let topTenMovies = [
	{
		title: 'Batman Begins',
		director: 'Christopher Nolan',
	},
	{
		title: 'The Dark Knight',
		director: 'Christopher Nolan',
	},
	{
		title: 'The Dark Knight Rises',
		director: 'Christopher Nolan',
	},
	{
		title: 'Interstellar',
		director: 'Christopher Nolan',
	},
	{
		title: 'Tenet',
		director: 'Christopher Nolan',
	},
	{
		title: 'Inception',
		director: 'Christopher Nolan',
	},
	{
		title: 'Dunkirk',
		director: 'Christopher Nolan',
	},
	{
		title: 'Memento',
		director: 'Christopher Nolan',
	},
	{
		title: 'The Prestige',
		director: 'Christopher Nolan',
	},
	{
		title: 'Insomnia',
		director: 'Christopher Nolan',
	},
];

app.use(morgan('common'));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
	res.send('Welcome to my Movie API!');
});

app.get('/movies', (req, res) => {
	res.json(topTenMovies);
});

// error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('An error was encountered!');
});

// listen for requests
app.listen(8080, () => {
	console.log('Your app is listening on port 8080.');
});
