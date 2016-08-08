<?php

use yii\helpers\Html;


/* @var $this yii\web\View */
/* @var $model app\models\Dropin */

$this->title = Yii::t('app', 'Create Dropin');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Dropins'), 'url' => ['index']];
$this->params['breadcrumbs'][] = $this->title;
?>

<div class="dropin-create container">
    <div class="col-md-6 col-md-offset-2">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title"><?= Html::encode($this->title) ?></h3>
            </div>
            <div class="panel-body">
                <?=
                $this->render('_form', [
                    'model' => $model,
                ])
                ?>
            </div>
        </div>
    </div>
</div>
