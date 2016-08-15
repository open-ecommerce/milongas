<?php

use \Dotenv as Dotenv;

Dotenv::load(__DIR__.'/..');
Dotenv::required('YII_DEBUG',['0','1','true']);
Dotenv::required('YII_ENV',['dev','prod','test']);
Dotenv::required(['YII_TRACE_LEVEL']);
Dotenv::required(['APP_NAME','APP_SUPPORT_EMAIL','APP_ADMIN_EMAIL']);
Dotenv::required(['DATABASE_DSN','DATABASE_USER','DATABASE_PASSWORD','DB_ENV_MYSQL_DATABASE','DB_PORT_3306_TCP_ADDR']);

Dotenv::setEnvironmentVariable('APP_VERSION', file_get_contents(__DIR__.'/../version'));
