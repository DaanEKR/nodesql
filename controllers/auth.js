const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  })

exports.login = async (req, res) => {
    try {
        const {email, password } = req.body;
    if(!email || !password){
        return res.status(400).render('login', {
            message: 'Missing email or password'
        })
    }
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results)
        if (!results || !(await bcrypt.compare(password, results[0].password))) {
            res.status(401).render('login', {
                message: 'Email or password is incorect'
            })
        } else {
            const id = results[0].id;
            const token = jwt.sign({ id: id}, process.env.jwt_secret, {
                expiresIn: process.env.jwt_secret
            });
            console.log(token)

            const cookieOptions = {
                exprires: new Date(
                    Date.now() + process.env.jwt_cookie_expires *24*60*60*1000
                ),
                httpOnly: true
            }
            res.cookie('jwt', token, cookieOptions);
            res.status(200).redirect("/");
        }
    })

    } catch(error){
        console.log(error)
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
        }

        if(results.length > 0){
            return res.render('register', {
                message: 'Email is already in use'
            });
        } else if (password !== passwordConfirm){
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
            if(error){
                console.log(error)
            } else {
                return res.render('register', {
                    message: 'User registered'
                });
            }
        })
    });
}