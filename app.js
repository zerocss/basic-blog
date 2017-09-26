var express = require("express");
var app = express();
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
var methodOverride = require("method-override");

//APP SETUP---------------------------------------------------------------
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/blog_app");
app.use(methodOverride("_method"));

//MONGOOSE SETUP----------------------------------------------------------
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES
//------------------------------------------------------------------------
//INDEX
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err)
        }
        else {
            res.render("index", {blogs: blogs});
        }
    })
});

//NEW********
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//CREATE*********
app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err){
            res.render("new")
        }
        else {
            res.redirect("/blogs");
        }
    })
})

//SHOW*******
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("shows", {blog: foundBlog});
        }
    })
})

//EDIT*********
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", {blog: foundBlog});
        }
    })
    
})

//UPDATE*********
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

//DESTROY*******
app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    })
})

//LISTEN-------------------------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Blog server started...")
})