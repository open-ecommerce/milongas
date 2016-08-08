<?php

use kartik\form\ActiveForm;
use yii\helpers\ArrayHelper;
use kartik\datecontrol\DateControl;
use kartik\helpers\Html;

$iconsDoctor = [
    0 => Html::icon('remove') . ' No need for Doctor',
    1 => Html::icon('hourglass') . ' Waiting for Doctor',
    2 => Html::icon('ok') . ' Already seen Doctor',
];
$iconsLawyer = [
    0 => Html::icon('remove') . ' No need for Lawyer',
    1 => Html::icon('hourglass') . ' Waiting for Lawyer',
    2 => Html::icon('ok') . ' Already seen Lawyer',
];
?>
<br>
<div class="today-dropin container">
    <div class="col-md-8 col-md-offset-2">    
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Today Dropin</h3>
            </div>
            <div class="panel-body">
                <?php $form = ActiveForm::begin(); ?>

                <div class="col-md-8"><?= $form->field($modelCustomers, 'Name')->textInput(['readonly' => true]) ?></div>
                <div class="col-md-4">
                    <?php
                    echo $form->field($model, 'DropinDate')->widget(DateControl::classname(), [
                        'type' => DateControl::FORMAT_DATE,
                        'displayFormat' => 'php:d M Y',
                        'saveFormat' => 'php:Y-m-d',
                        //'disabled' => true,
                    ]);
                    ?>
                </div>
                <hr>
                <div class="row col-md-12">
                    <div class="attendance-form">
                        <?= $form->field($model, 'Dropin', ['template' => "Dropin and recived the voucher{input}\n{hint}\n{error}"])->checkbox() ?>
                        <div class="row col-md-offset-0">
                            <div class="col-md-6 col-md-offset-0" id="doctor-selection"><?= $form->field($model, 'Doctor')->multiselect($iconsDoctor, ['selector' => 'radio']); ?></div>
                            <div class="col-md-6 col-md-offset-0" id="lawyer-selection"><?= $form->field($model, 'Lawyer')->multiselect($iconsLawyer, ['selector' => 'radio']); ?></div>
                        </div>    
                        <?= $form->field($model, 'Observation', ['template' => "Comments\n\n{input}\n{hint}\n{error}"])->textArea(array('rows' => 5, 'placeholder' => 'Comments about this specific dropin...')); ?>
                        <div class="form-group">
                            <?= Html::a('Cancel and Close', ['customers/index'], ['class' => 'btn btn-warning']) ?>        
                            <?= Html::submitButton($model->isNewRecord ? 'Confirm Entry and Close' : 'Update', ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-success']) ?>
                        </div>
                    </div>
                    <?php ActiveForm::end(); ?>
                </div>
            </div>
        </div>  
    </div>
</div>  
