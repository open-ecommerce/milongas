<?php

use yii\widgets\ActiveForm;
use kartik\datecontrol\DateControl;
use kartik\helpers\Html;

/* @var $this yii\web\View */
/* @var $model app\models\Dropin */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="dropin-form">

    <?php $form = ActiveForm::begin(); ?>

      <div class="row">
        <div class="col-md-8">
          <?= $form->field($model, 'DropinDate')->widget(DateControl::classname(), [
              'type' => DateControl::FORMAT_DATE,
              'displayFormat' => 'php:d M Y',
              'saveFormat' => 'php:Y-m-d',
          ]); ?>
          <?= $form->field($model, 'MainEntrance')->dropDownList(['A-M' => 'A-M', 'M-Z' => 'M-Z', 'ALL' => 'ALL'], ['prompt' => '- Choose restriction']) ?>
        </div>
      </div>

    <div class="form-group">
        <?= Html::a('Cancel', ['index'], ['class' => 'btn btn-warning']) ?>
        <?= Html::submitButton($model->isNewRecord ? Yii::t('app', 'Create') : Yii::t('app', 'Update'), ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
