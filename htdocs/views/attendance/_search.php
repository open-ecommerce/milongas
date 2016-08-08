<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\AttendanceSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="attendance-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'ID') ?>

    <?= $form->field($model, 'CustomersID') ?>

    <?= $form->field($model, 'Doctor')->checkbox() ?>

    <?= $form->field($model, 'Lawyer')->checkbox() ?>

    <?= $form->field($model, 'Dropin')->checkbox() ?>

    <?php // echo $form->field($model, 'DropinDate') ?>

    <?php // echo $form->field($model, 'Observation') ?>

    <div class="form-group">
        <?= Html::submitButton('Search', ['class' => 'btn btn-primary']) ?>
        <?= Html::resetButton('Reset', ['class' => 'btn btn-default']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
