var express = require('express');
var router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const passport = require('passport');

function isAuthenticated(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.isAuthenticated())
        return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/login');
}

function isNotAuthenticated(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (!(req.isAuthenticated())){
        return next();
    }

    // IF A USER IS LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isAdmin(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.username === 'admin') {
        return next();
    }

    // IF A USER IS NOT ADMIN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isAdminOrSelf(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.username === 'admin' || req.user.id.toString() === req.params.id ) {
        return next();
    }

    // IF A USER IS NOT ADMIN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}


/* GET home page. */
router.get('/', isAuthenticated, function(req, res, next) {
    res.redirect('/clients');
});

/// CLIENT ROUTES ///

// GET request for creating a Client. NOTE This must come before routes that display Client (uses id).
router.get('/clients/new', isAuthenticated, isAdmin, function(req, res){
    res.render('clients/new', {
        req: req,
        title: 'Create client',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Client.
router.post('/clients', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('dob', 'Empty dob').not().isEmpty(),
    body('gender', 'Empty gender').not().isEmpty(),
    body('city', 'Empty city').not().isEmpty(),
    body('state', 'Empty state').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('city', 'City must be between 5-45 characters.').isLength({min:5, max:45}),
    body('state', 'State must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('dob', 'Invalid DOB').isISO8601(),
    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/clients/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        console.log(req.body);
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('dob').trim().escape();
        sanitizeBody('gender').trim().escape();
        sanitizeBody('city').trim().escape();
        sanitizeBody('state').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const dob = req.body.dob;
        const gender = req.body.gender;
        const city = req.body.city;
        const state = req.body.state;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('INSERT INTO client (firstName, lastName, dob, gender, city, state, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [firstname, lastname, dob, gender, city, state, email, phone], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Client created.');
            res.redirect('/clients');
        });
    }
});

// DELETE request to delete Client.
router.delete('/clients/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM client WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Client deleted.');
        res.redirect('/clients');
    });
});

// GET request to update Client.
router.get('/clients/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT firstName, lastName, dob, gender, city, state, email, phone FROM client WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        results[0].dob = JSON.stringify(results[0].dob).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('clients/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit client',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Client.
router.put('/clients/:id', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('dob', 'Empty dob').not().isEmpty(),
    body('gender', 'Empty gender').not().isEmpty(),
    body('city', 'Empty city').not().isEmpty(),
    body('state', 'Empty state').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('city', 'City must be between 5-45 characters.').isLength({min:5, max:45}),
    body('state', 'State must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('dob', 'Invalid DOB').isISO8601(),
    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('dob').trim().escape();
        sanitizeBody('gender').trim().escape();
        sanitizeBody('city').trim().escape();
        sanitizeBody('state').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const dob = req.body.dob;
        const gender = req.body.gender;
        const city = req.body.city;
        const state = req.body.state;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('UPDATE client SET firstName = ?, lastName = ?, dob = ?, gender = ?, city = ?, state = ?, email = ?, phone = ? WHERE id = ?', [firstname, lastname, dob, gender, city, state, email, phone, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Client edited.');
            res.redirect('/clients');
        });
    }
});

// GET request for list of all Client items.
router.get('/clients', isAuthenticated, function(req, res){
    console.log(req.route.path);
    connection.query('SELECT * FROM `client`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('clients/index', {
            req: req,
            clients: results,
            title: 'Clients',
            alert: req.flash('alert'),
        });
    });
});

/// EMPLOYEE ROUTES ///

// GET request for creating a Employee. NOTE This must come before routes that display Employee (uses id).
router.get('/employees/new', isAuthenticated, isAdmin, function(req, res){
    res.render('employees/new', {
        req: req,
        title: 'Create employee',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Employee.
router.post('/employees', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('position', 'Empty dob').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/employees/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('position').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const position = req.body.position;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('INSERT INTO employee (firstName, lastName, position, email, phone) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, position, email, phone], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Employee created.');
            res.redirect('/employees');
        });
    }
});

// DELETE request to delete Employee.
router.delete('/employees/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM employee WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Employee deleted.');
        res.redirect('/employees');
    });
});

// GET request to update Employee.
router.get('/employees/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT firstName, lastName, position, email, phone FROM employee WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        // results[0].dob = JSON.stringify(results[0].dob).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('employees/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit employee',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Employee.
router.put('/employees/:id', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('position', 'Empty dob').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('position').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const position = req.body.position;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('UPDATE employee SET firstName = ?, lastName = ?, position = ?, email = ?, phone = ? WHERE id = ?', [firstname, lastname, position, email, phone, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Employee edited.');
            res.redirect('/employees');
        });
    }
});

// GET request for list of all Employee items.
router.get('/employees', isAuthenticated, function(req, res){
    console.log(req.route.path);
    connection.query('SELECT * FROM `employee`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('employees/index', {
            req: req,
            employees: results,
            title: 'Employees',
            alert: req.flash('alert')
        });
    });
});

/// ORDERS ROUTES ///

// GET request for creating a Order. NOTE This must come before routes that display Order (uses id).
router.get('/orders/new', isAuthenticated, isAdmin, function(req, res){
    res.render('orders/new', {
        req: req,
        title: 'Create order',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Order.
router.post('/orders', isAuthenticated, isAdmin, [
    // validation
    body('amount', 'Empty amount').not().isEmpty(),
    body('date', 'Empty date').not().isEmpty(),
    body('description', 'Empty description').not().isEmpty(),

    body('description', 'Description must be between 5-45 characters.').isLength({min:5, max:45}),

    body('date', 'Invalid date').isISO8601(),

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/orders/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('amount').trim().escape();
        sanitizeBody('date').trim().escape();
        sanitizeBody('description').trim().escape();
        const amount = req.body.amount;
        const date = req.body.date;
        const description = req.body.description;
        console.log(amount,date,description);
        connection.query('INSERT INTO orders (amount, date, description) VALUES (?, ?, ?)', [amount, date, description], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Order created.');
            res.redirect('/orders');
        });
    }
});

// DELETE request to delete Order.
router.delete('/orders/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM orders WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Order deleted.');
        res.redirect('/orders');
    });
});

// GET request to update Order.
router.get('/orders/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT amount, date, description FROM orders WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        results[0].date = JSON.stringify(results[0].date).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('orders/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit order',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Order.
router.put('/orders/:id', isAuthenticated, isAdmin, [
    // validation
    body('amount', 'Empty amount').not().isEmpty(),
    body('date', 'Empty date').not().isEmpty(),
    body('description', 'Empty description').not().isEmpty(),

    body('description', 'Description must be between 5-45 characters.').isLength({min:5, max:45}),

    body('date', 'Invalid date').isISO8601(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('amount').trim().escape();
        sanitizeBody('date').trim().escape();
        sanitizeBody('description').trim().escape();
        const amount = req.body.amount;
        const date = req.body.date;
        const description = req.body.description;
        connection.query('UPDATE orders SET amount = ?, date = ?, description = ? WHERE id = ?', [amount, date, description, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Order edited.');
            res.redirect('/orders');
        });
    }
});

// GET request for list of all Order items.
router.get('/orders', isAuthenticated, function(req, res){
    connection.query('SELECT * FROM `orders`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('orders/index', {
            req: req,
            orders: results,
            title: 'Orders',
            alert: req.flash('alert')
        });
    });
});


/// USERS ROUTES ///

// GET request for creating a User. NOTE This must come before routes that display User (uses id).
router.get('/users/new', isAuthenticated, isAdmin, function(req, res){
    res.render('users/new', {
        req: req,
        title: 'Create user',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating User.
router.post('/users', isAuthenticated, isAdmin, [
    // validation
    body('username', 'Empty username').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('password', 'Empty password').not().isEmpty(),

    body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
    body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),

    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
        'a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/users/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('username').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('password').trim().escape();
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        connection.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, password], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'User created.');
            res.redirect('/users');
        });
    }
});


// DELETE request to delete User.
router.delete('/users/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'User deleted.');
        res.redirect('/users');
    });
});

// GET request to update User.
router.get('/users/:id/edit', isAuthenticated, isAdminOrSelf, function(req, res){
    connection.query('SELECT username, email, password FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        // results[0].date = JSON.stringify(results[0].date).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);
        res.render('users/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit user',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update User.
router.put('/users/:id', isAuthenticated, isAdminOrSelf, [
    // validation
    body('username', 'Empty username').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('password', 'Empty password').not().isEmpty(),

    body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
    body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),

    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
        'a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('username').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('password').trim().escape();
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        connection.query('UPDATE user SET username = ?, email = ?, password = ? WHERE id = ?', [username, email, password, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'User edited.');
            res.redirect(req._parsedOriginalUrl.pathname);
        });
    }
});

// GET request for one User.
router.get('/users/:id', isAuthenticated, isAdminOrSelf, function(req, res){
    connection.query('SELECT username, email, password FROM `user` WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/show', {
            req: req,
            user: results,
            title: req.user.username,
            alert: req.flash('alert')
        });
    });
});

// GET request for list of all User items.
router.get('/users', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT * FROM `user`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/index', {
            req: req,
            users: results,
            title: 'Users',
            alert: req.flash('alert')
        });
    });
});

/// LOGIN ROUTES ///

router.get('/login', isNotAuthenticated, function(req, res) {
    res.render('login', { errors: req.flash('errors') });
});

router.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})
);

router.get('/logout', isAuthenticated, function(req, res){
    req.logout();
    res.redirect('/login');
});

/// ERROR ROUTES ///

router.get('/403', function(req, res){
    res.render('403');
});

module.exports = router;
