const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	uuid = require('uuid'),
	morgan = require('morgan');

app.use(bodyParser.json());
app.use(morgan('common'));

// define arrays of user and movie objects that later get handed over in JSON
let users = [
	{
		id: 1,
		name: 'Kim',
		favoriteMovies: [],
	},
	{
		id: 2,
		name: 'Joe',
		favoriteMovies: 'The Fountain',
	},
];

let movies = [
	{
		Title: 'The Fountain',
		Description: 'Description 1',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 1',
			Bio: 'Bio Director 1',
			Birth: 1969,
		},
	},
	{
		Title: 'Title 2',
		Description: 'Description 2',
		Genre: {
			Name: 'Action',
			Description: 'Description Genre Action',
		},
		Director: {
			Name: 'Director 2',
			Bio: 'Bio Director 2',
			Birth: 1972,
		},
	},
	{
		Title: 'Title 3',
		Description: 'Description 3',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 3',
			Bio: 'Bio Director 3',
			Birth: 1980,
		},
	},
	{
		Title: 'Title 4',
		Description: 'Description 4',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 4',
			Bio: 'Bio Director 4',
			Birth: 1981,
		},
	},
	{
		Title: 'Title 5',
		Description: 'Description 5',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 5',
			Bio: 'Bio Director 5',
			Birth: 1982,
		},
	},
];

// CREATE new user
app.post('/users', (req, res) => {
	const newUser = req.body;

	if (newUser.name) {
		newUser.id = uuid.v4();
		users.push(newUser);
		res.status(201).json(newUser);
	} else {
		res.status(400).send('New user requires name');
	}
});

// UPDATE user
app.put('/users/:id', (req, res) => {
	const { id } = req.params;
	const updatedUser = req.body;

	let user = users.find((user) => user.id == id);

	if (user) {
		user.name = updatedUser.name;
		res.status(200).json(user);
	} else {
		res.status(400).send('User not found');
	}
});

// CREATE favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;

	let user = users.find((user) => user.id == id);

	if (user) {
		user.favoriteMovies.push(movieTitle);
		res.status(200).send(
			`${movieTitle} has been added to user ${id}'s array`
		);
	} else {
		res.status(400).send('User not found');
	}
});

// DELETE favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;

	let user = users.find((user) => user.id == id);

	if (user) {
		user.favoriteMovies = user.favoriteMovies.filter(
			(title) => title !== movieTitle
		);
		res.status(200).send(
			`${movieTitle} has been removed from user ${id}'s array`
		);
	} else {
		res.status(400).send('User not found');
	}
});

// DELETE user
app.delete('/users/:id', (req, res) => {
	const { id } = req.params;

	let user = users.find((user) => user.id == id);

	if (user) {
		users = users.filter((user) => user.id != id);
		res.status(200).send(`User ${id} has been removed from the database`);
	} else {
		res.status(400).send('User not found');
	}
});

// READ all movies
app.get('/movies', (req, res) => {
	res.status(200).json(movies);
});

// READ one movie by title
app.get('/movies/:title', (req, res) => {
	const { title } = req.params;
	const movie = movies.find((movie) => movie.Title === title);

	if (movie) {
		res.status(200).json(movie);
	} else {
		res.status(404).send('Movie not in database');
	}
});

// READ genre by name
app.get('/movies/genre/:genreName', (req, res) => {
	const { genreName } = req.params;
	const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

	if (genre) {
		res.status(200).json(genre);
	} else {
		res.status(404).send('Genre not in database');
	}
});

// READ director by name
app.get('/movies/directors/:directorName', (req, res) => {
	const { directorName } = req.params;
	const director = movies.find(
		(movie) => movie.Director.Name === directorName
	).Director;

	if (director) {
		res.status(200).json(director);
	} else {
		res.status(404).send('Director not in database');
	}
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
