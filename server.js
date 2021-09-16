/*———————————————————————————————————————*/
/* SECTION: Variables	                 */
/*———————————————————————————————————————*/

const express = require("express");
const app     = express();
const server  = require("http").Server(app);
const port    = 3000;
const io      = require('socket.io')(server);

// NOTE: Password Encryption
const bcrypt = require('bcrypt');

const fs = require('fs');

/*———————————————————————————————————————*/
/* SECTION: IO's & Sockets               */
/*———————————————————————————————————————*/

// Serve the static website files.
app.use(express.static("public"));

// Starts the server.
server.listen(port, function () {
	console.log("Server is running on "+ port +" port");
});

// Server
io.on('connection', function(socket){
	console.log("user connected");

	socket.on('new-user', username => {
		socket.emit('user-list', users); // Sends a full list of current users to the client when they join. (Minus their own.)
		socket.broadcast.emit('user-connected', username);
		console.log(username);
	});

	socket.on('send-chat-message', message => {
		socket.broadcast.emit('chat-message', {message: message, name: users[socket.id]});

		fs.appendFile('message.txt', users[socket.id] + ": "+ message + "\n", function (err) {
			if (err) throw err;
			console.log('Saved!');
		});
	});

	// NOTE: Account Login
	socket.on("login", function(username, password) {
		/*
		TODO: Go through every account.

		TODO: Verify that entered account matches a saved username.

		TODO: Verify the entered password matches the saved password.

		TODO: If name does not exist, display: "Username or password is incorrect."
		
		TODO: If password is entered incorrectly, display: "Username or password is incorrect."
		*/
		fs.readFile('./accounts.json', 'utf-8', (err, jsonString) => {
			if (err) {
				console.log(err);
			} else {
				try {
					const data = JSON.parse(jsonString);
					console.log(data);

					if (data[username] && data[username].password === password) {
						socket.broadcast.emit("login-successful");
						console.log("login-successful");
					} else {
						socket.broadcast.emit("login-unsuccessful");
						console.log("login-unsuccessful");
					}

				} catch (err) {
					console.log("Error parsing JSON: ", err)
				}
			}
		});
	});

	// NOTE: Account Register
	socket.on("register", async (username, password) => {
		const hashedPassword = await bcrypt.hash(password, 10);

		fs.readFile('./accounts.json', 'utf-8', (err, jsonString) => {
			if (err) {
				console.log(err);
			} else {
				try {
					const data = JSON.parse(jsonString);
					console.log(data);
					data[username] = {username: username, password: hashedPassword};

					fs.writeFile('./accounts.json', JSON.stringify(data, null, 2), err => {
						if (err) {
							console.log(err)
						} else {
							console.log('File successfully written!');
						}
					});

				} catch (err) {
					console.log("Error parsing JSON: ", err);
				}
			}
		});


	});
});