const express = require('express');
const app = express();
const bodyParser=require('body-parser');


const port = process.env.PORT || 5000;

//Loads the handlebars module
const handlebars = require('express-handlebars');
//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');
//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', handlebars({
layoutsDir: __dirname + '/views',
}));
app.use(express.static('views'))
app.use(bodyParser.json());


const routes = require('./routes/index')
app.use('/',routes)


app.listen(port, () => {
console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app 
