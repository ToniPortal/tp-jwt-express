//Tout les npm utilisé pour le projet.
const mysql = require('mysql'),
    express = require('express'),
    path = require('path'),
    config = require("./config.json")
jwt = require('jsonwebtoken'),
    dotenv = require('dotenv'),
    port = (process.env.PORT || process.env.ALWAYSDATA_HTTPD_PORT || 8100),
    ip = (process.env.IP || process.env.ALWAYSDATA_HTTPD_IP);

dotenv.config();

app = express();

console.log(`Your port is ${process.env.PORT}`);

app.set('view engine', 'ejs')

app.use('/src', express.static(path.join(__dirname, 'src')))

server = app.listen(port, ip, err => {
    err ?
        console.log("Error in server setup") :
        console.log(`Worker ${process.pid} started\nServeur lancer sur: http://localhost:${port}`);
});

const connection = mysql.createConnection({ //connection bdd
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by'); //Désactive le header x-powered-by


app.get("/", (req, res) => {

    res.render("index");

});

app.get("/login", (req, res) => {

    res.render("login");

});




app.post('/auth', function (req, res) {

    let username = req.body.username;

    console.log("user " + username);

    if (username || username != undefined) {
        connection.query(`SELECT * FROM accounts WHERE username = '${username}'`, function (error, results, fields) {
            if (error) {
                console.log(error);
                return res.redirect("/login");
            }
            if (results.length > 0) {

                    console.log(results[0].id)
                    const token = jwt.sign({
                        id: results[0].id
                    }, process.env.SECRET, { expiresIn: '3 hours' })

                    console.log("Token auth :\n" + token)
                    res.send(token)


            } else {
                console.log("Mauvais Nom d'utlisateur et/ou mauvais mot de passe\n")
                res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br>");
            }
            res.end();
        });
    } else {
        res.send("Veuillez rentrer un Nom d'utlisateur et mot de passe<br>");
        res.end();
    }
});

app.use('/whoami', (req, res, next) => {

const token = req.body

    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Error. Bad token' })
        }
        return next()
    })

})

app.get("/whoami", (req, res) => {

    connection.query(`SELECT username FROM accounts`, function (error, results, fields) {
        if (error) {
            console.log(error);
            return res.redirect("/login");
        }
        if (results.length > 0) {
            //Lorsque ça finctionne
            res.send(results)
        } else {
            console.log("Mauvais Nom d'utlisateur et/ou mauvais mot de passe\n")
            res.send("Mauvais Nom d'utlisateur et/ou mauvais mot de passe<br>");
        }
        res.end();
    });

});



// const secretkey = require('crypto').randomBytes(64).toString('hex');
// console.log(secretkey);