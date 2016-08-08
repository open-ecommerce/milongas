<?php

use app\assets\AppAsset;
use yii\helpers\Html;


$this->title = $this->title . ' - ' . Yii::$app->params['appName'];
AppAsset::register($this);
echo $content;