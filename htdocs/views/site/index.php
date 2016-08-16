<?php
/* @var $this yii\web\View */

use app\assets\AppAsset;
use app\widgets\Alert;
use yii\helpers\Html;

$bundle = AppAsset::register($this);
$imgPath = $bundle->baseUrl;


$this->title = 'NNLS Drop-in Application';
?>
<div class="site-index ">
    <div class="header vert">
        <h2 class="lead">Welcome to the Open-ecommerce Drop In System</h2>
    </div>
    <div class="featurette">
        <div class="container">
            <div class="row">
                <div class="col-md-12 text-center">
                    <div>
                        <div id="hero">
                            <?= Html::img($imgPath . '/img/dropin-demo-hero.jpg', ['alt' => 'Drop-in Demo Solution']) ?>
                        </div>
                    </div>
                    <br>
                    <p class="lead">We are allways improuving this system and your help it is very important.</p>
                </div>
            </div>
        </div>
    </div>
</div>
