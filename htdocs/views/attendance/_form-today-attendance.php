<?php

use kartik\form\ActiveForm;
use yii\helpers\ArrayHelper;
use kartik\datecontrol\DateControl;
use kartik\helpers\Html;
use app\models\Dropin;

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
                    // echo $form->field($model, 'DropinDate')->widget(DateControl::classname(), [
                    //     'type' => DateControl::FORMAT_DATE,
                    //     'displayFormat' => 'php:d M Y',
                    //     'saveFormat' => 'php:Y-m-d',
                    //     //'disabled' => true,
                    // ]);

                    $time = new \DateTime('now');
                    $today = $time->format('Y-m-d');
                    echo $form->field($model, 'DropinDate')
                                                          ->dropDownList(ArrayHelper::map(Dropin::find()
                                                            ->where(['<=', 'DropinDate' ,$today])
                                                            ->orderBy(['DropinDate' => SORT_DESC])
                                                            ->all(),
                                               'DropinDate','DropinDateFormated'));
                    ?>
                </div>
                <hr>
                <div class="row col-md-12">
                    <div class="attendance-form">
                        <?= $form->field($model, 'Dropin', ['template' => "Dropin to milonga{input}\n{hint}\n{error}"])->checkbox() ?>
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
