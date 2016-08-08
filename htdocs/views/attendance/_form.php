<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Attendance */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="attendance-form">

    <?php $form = ActiveForm::begin(); ?>

    <?= $form->field($model, 'Dropin')->checkbox() ?>

    <?= $form->field($model, 'DropinDate')->textInput() ?>

    <?= $form->field($model, 'Doctor')->checkbox() ?>

    <?= $form->field($model, 'Lawyer')->checkbox() ?>


    <?= $form->field($model, 'Observation')->textInput(['maxlength' => 250]) ?>

    <div class="form-group">
        <?= Html::submitButton($model->isNewRecord ? 'Create' : 'Update', ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
