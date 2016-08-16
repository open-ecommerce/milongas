<?php
/* @var $this yii\web\View */

use app\assets\AppAsset;
use yii\helpers\Html;

$bundle = AppAsset::register($this);
$imgPath = $bundle->baseUrl;

$this->title = 'Demo Drop-in Application';
?>
<div class="site-index ">
    <div class="header vert">
        <div class="container">
            <h1>Drop-in Demo</h1>
            <p class="lead">We are always improving this system and your help is very important</p>
            <br>
        <div>
            <a href="/"
            class="btn btn-primary btn-lg">Tutorial</a>
        </div>

        </div>
    </div>

<br><br><br><br>

<p class="text-center"><?=
    Html::a(
            Html::img($imgPath . '/img/open-ecommerce-at-github-social-coding.png', ['alt' => 'open-ecommerce.org']), 'https://github.com/open-ecommerce'
    )
    ?>
</p>

<br><br><br><br>

</div>
