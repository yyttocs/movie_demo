var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
var _ = require('underscore')
var Movie = require('./models/movie')
var User = require('./models/user')
var port = process.env.PORT || 3000
var app = express()
var bodyParser = require('body-parser')
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/imooc')
var cookieParser = require('cookie-parser')
var session = require('express-session')


app.set('views', './views/pages')
app.set('view engine', 'jade')
app.use(bodyParser.urlencoded({extended:true}))  //将post的内容初始化为对象
app.use(cookieParser())  //session依赖cookie中间件
app.use(session({
	secret: 'imooc',
	resave: false,
	saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public'))) //静态文件配置的目录
app.locals.moment = require('moment')
app.listen(port)

console.log('imooc started on port ' + port)

//index page
app.get('/', function(req, res) {
	console.log('user in session:')
	console.log(req.session.user)
	Movie.fetch(function(err, movies) {
		if (err) {
			console.log(err)
		}
	  res.render('index', {
	  	title: 'imooc 首页',
	  	movies: movies
	  })
	})
})

// app.post('/user/signup/:userid', function(req, res){
// 	//以传递路由的方式获取
// 	var _userid = req.params.userid
// 	// /user/signup/1111?uerid=1112 一同哟URL提交的query参数串的方式获取
// 	// var _userid = req.query.userid
// 	// 表单提交post或者异步的ajax post 一个data 在body里面 
// 	// var _userid = req.body.userid
// 	// req.param('user')  不知道是哪个
// 	// /user/signup/1111?uerid=1112 
// 	// ｛userid: 1113｝  这样拿到的值  ？？ 优先级 是路由中变量 要是没有 就body 在没有就query
// })
//signup
app.post('/user/signup', function(req, res){
	var _user = req.body.user  //req.param('user')
	// console.log(_user)

	User.findOne({name: _user.name}, function(err, user){
		if(err){
			console.log(err)
		}
		if(user){
			console.log('User already exist')
			return res.redirect('/')
		}
		else{
			var user = new User(_user)
			user.save(function(err, user){
			if(err){
				console.log(err)
			}
			console.log(user)
			res.redirect('/admin/userlist')
			//console.log(user)
			})
		}
	})
})

//signin  用户登录
app.post('/user/signin', function(req, res){
	var _user = req.body.user
	var name = _user.name
	var password = _user.password

	User.findOne({name: name}, function(err, user){
		if(err){
			console.log(err)
		}

		if(!user){
			console.log('user dont exist')
			return res.redirect('/')
		}
		user.comparePassword(password, function(err, isMatch){
			if(err){
				console.log(err)
			}
			if(isMatch){
				req.session.user = user
				console.log('password is matched')
				return res.redirect('/')
			}
			else{
				console.log('password is not matched')
			}
		})
	})
})
//detail page
app.get('/movie/:id', function(req, res) {
	var id = req.params.id

	Movie.findById(id, function(err, movie) {
	  res.render('detail', {
	  	title: 'imooc ' + movie.title,
	  	movie: movie
 		})
  })
})

//admin page
app.get('/admin/movie', function(req, res) {
	res.render('admin', {
		title: 'imooc 后台录入页',
		movie: {
			title: '',
			doctor: '',
			country: '',
			year: '',
			poster: '',
			flash: '',
			summary: '',
			language: ''
		}
	})
})

// admin update movie
app.get('/admin/update/:id', function(req, res) {
	var id = req.params.id

	if (id) {
		Movie.findById(id, function(err, movie){
			res.render('admin', {
				title: 'imooc 后台更新页',
				movie: movie 
			})
		})
	}
})

// admin post movie
app.post('/admin/movie/new', function(req, res) {
	var id = req.body.movie._id
	var movieObj = req.body.movie
	var _movie

	if(id !== 'undefined') {  //对其更新
		Movie.findById(id, function(err, movie) {
			if (err) {
				console.log(err)
			}

			_movie = _.extend(movie, movieObj)   //underscore
			_movie.save(function(err, movie) {
				if (err) {
					console.log(err)
				}

				res.redirect('/movie/' + movie._id)  //重定向
			})
    })
	}
	else {
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		})

		_movie.save(function(err, movie) {
			if (err) {
				console.log(err)
			}

			res.redirect('/movie/' + movie._id)
		})
	}
})


//list page
app.get('/admin/list', function(req, res) {
	Movie.fetch(function(err, movies) {
		if (err) {
			console.log(err)
		}

	  res.render('list', {
	  	title: 'imooc 列表页',
	  	movies: movies
	  })
	})
})

//userlist page
app.get('/admin/userlist', function(req, res) {
	User.fetch(function(err, users) {
		if (err) {
			console.log(err)
		}

	  res.render('userlist', {
	  	title: 'imooc 用户列表页',
	  	users: users
	  })
	})
})
//list delete movie
app.delete('/admin/list', function(req, res) {
	var id = req.query.id

	if (id) {
		Movie.remove({_id: id}, function(err, movie) {
			if (err) {
				console.log(err)
			}
			else {
				res.json({success: 1})
			}
		})
	}
})









