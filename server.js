
/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
* Name:Kulpreet Singh Student  ID:160902235  Date: 26 July 2024
*
*  Online (vercel) Link: https://vercel.com/kulpreet-singhs-projects-8cdb233e/assignment5
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var exphbs = require('express-handlebars');
var path = require("path");
const { initialize } = require("./modules/collegeData");
var collegeData = require("./modules/collegeData");

var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.static(__dirname + "/public/"));

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Setup Handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

// Set Handlebars as the template engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware function to set the activeRoute property in app.locals
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Route to get and render students
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    }
});

// Route to get and render courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("courses", { courses: data });
        })
        .catch(err => {
            res.render("courses", { message: "no results" });
        });
});

// Route to render the home page
app.get("/", (req, res) => {
    res.render('home');
});

// Route to render the about page
app.get("/about", (req, res) => {
    res.render('about');
});

// Route to render the HTML demo page
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// Route to render the add student form
app.get("/students/add", (req, res) => {
    res.render('addStudent');
});

// Route to handle the form submission for adding a student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to add student");
        });
});

// Route to get and render a course by ID
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => {
            res.render("course", { course: data });
        })
        .catch(err => {
            res.status(404).send("Course not found");
        });
});

// Route to get and render a student by student number
app.get("/student/:studentNum", (req, res) => {
    collegeData.getStudentByNum(req.params.studentNum)
        .then(data => {
            res.render("student", { student: data });
        })
        .catch(err => {
            res.status(404).send("Student not found");
        });
});

// Route to handle the form submission for updating a student
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

// 404 Error handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Initialize and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on port: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("Unable to start server: " + err);
    });

module.exports = app;
