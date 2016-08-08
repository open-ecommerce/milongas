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

<div class="today-update container">
    <div class="col-md-8 col-md-offset-2">    
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Today Doctor Attendance</h3>
            </div>
            <div class="panel-body">
                <?php $form = ActiveForm::begin(); ?>
                <?= $form->field($modelCustomers, 'Name')->textInput(['readonly' => true]) ?>

                <div class="attendance-form">
                    <div class="row">
                        <div class="col-md-6" >
                            <?php
                            echo $form->field($model, 'DropinDate')->widget(DateControl::classname(), [
                                'type' => DateControl::FORMAT_DATE,
                                'displayFormat' => 'php:d M Y',
                                'saveFormat' => 'php:Y-m-d',
                                'disabled' => true,
                            ]);
                            ?>        
                        </div>
                        <div class="col-md-6" >
                            <?php
                            echo $form->field($model, 'DropinTime')->widget(DateControl::classname(), [
                                'type' => DateControl::FORMAT_TIME,
                                'displayFormat' => 'php:h:i',
                                'disabled' => true,
                            ]);
                            ?>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6" id="doctor-selection"><?= $form->field($model, 'Doctor')->multiselect($iconsDoctor, ['selector' => 'radio']); ?></div>
                        <div class="col-md-6" id="lawyer-selection"><?= $form->field($model, 'Observation', ['template' => "Comments\n\n{input}\n{hint}\n{error}"])->textArea(array('rows' => 5, 'placeholder' => 'Comments about this specific dropin...')); ?></div>
                    </div>    
                    <div class="form-group">
                        <?= Html::a('Cancel', ['doctor/index'], ['class' => 'btn btn-warning']) ?>        
                        <?= Html::submitButton($model->isNewRecord ? 'Create' : 'Update', ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-success']) ?>
                    </div>
                </div>
                <?php ActiveForm::end(); ?>

            </div>
        </div>
    </div>
</div>
