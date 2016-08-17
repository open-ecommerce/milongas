![Yii2, Phundament, dropin, Less and Gulp ](hero.png)

#Project Based in Yii2 and Phundament4 with Gulp as assets generation tool

## Dropin
Application to manage drop in sessions for grass roots organizations.

### You can see a demo at: [dropin.open-ecommerce.org](http://dropin.open-ecommerce.org/)

### Latests [releses notes](relese-notes.md)

## Some technical features
- Simplify configuration file by [Phundamental 4](https://github.com/phundament/app)
- Dashboard theme based in [AdminLTE 2](http://almsaeedstudio.com/AdminLTE) for backend with extra plugins for chars.
- User Managment with RDAC to use roles and permisions.
- Gulp for fonts, less, images and more

## Some functional features
- Role based implementation
- Quick clients filter and services asignment
- Clients and Lawyer listing

# Installation
## Prerequisites
Before you start, make sure you have installed [composer](https://getcomposer.org/) and [Node.js](http://nodejs.org/).
If you are on Debian or Ubuntu you might also want to install the [libnotify-bin](https://packages.debian.org/jessie/libnotify-bin) package, which is used by Gulp to inform you about its status.

### Gulp
install gulp globally if you haven't done so before

```
npm install -g gulp-cli
```
### Browsersync
install browsersync globally if you haven't done so before

```
npm install -g browser-sync
```
## Composer
```
composer global require "fxp/composer-asset-plugin:~1.1.1"
composer update
```

## Post-installation

initialize the application, choose "development"
```
./init
```

### Post-installation
Install the node modules by running this command at the project root directory:
```
npm install
```
After a successful install, build the project using:
```
gulp build
```

To launch a browser window and watch the project for changes:
~~~
gulp
~~~

To build optimized for production (minification, etc) specify the `production` flag:

~~~
gulp build --production
~~~
and/or
~~~
gulp --production
~~~


### dev enviourment notes:
```
etc/apache2/sites-available configuration
<VirtualHost *:80>
    ServerName helptext.dev
    DocumentRoot "/var/www/helptext/htdocs/web"
    ServerAlias www.helptext.dev
    <Directory /var/www/helptext/htdocs/web>
            Options +FollowSymlinks
            AllowOverride All
            Order allow,deny
            allow from all
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/helptext.log
</VirtualHost>
```

## you will have this
ln -s ../local/.env .env



you will need swiftmailer in order to work the email
```
sudo apt-get update
sudo apt-get install libphp-swiftmailer
```

###In Production with a shared hosting
- Probably you want have the chance to create your own apache configuration file but you can add this to the .htaccess fiel in the web folder

```

AddType application/x-httpd-php55 .php

allow from all

IndexIgnore */*

RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

RewriteRule . index.php

```

- If the hosting has a proper security some php functions like exec will be ban.
You don't need them to yii2 run or even create the assets folder, but you want be able to complie less on the go thats why we replace the less compilation and we run gulp before we go to staging or production.

###Troubleshooting on deploying

##env PROD
#First of all if there are errors then change .env to dev and set debug mode to see errors

#Error "An internal server error occurred."
- the app is running check db credentials in .env

#Error seeing images
- have you run gulp localy?
- delete the assets in production to force to regenerate

# Trouble shooting with gulp

```
Error: Cannot find module 'browser-sync'
    at Function.Module._resolveFilename (module.js:325:15)
    at Function.Module._load (module.js:276:25)
    at Module.require (module.js:353:17)
    at require (internal/module.js:12:17)
    at Object.<anonymous> (gulpfile.babel.js:5:1)
    at Module._compile (module.js:409:26)
    at loader (/var/www/drop-in/htdocs/node_modules/babel-register/lib/node.js:148:5)

npm install browser-sync --save-dev
```
