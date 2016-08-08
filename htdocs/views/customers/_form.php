<?php

use app\models\Languages;
use kartik\form\ActiveForm;
use yii\helpers\ArrayHelper;
use kartik\datecontrol\DateControl;
use kartik\helpers\Html;

/* @var $this yii\web\View */
/* @var $model app\models\Customers */
/* @var $form yii\widgets\ActiveForm */



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

<?php $form = ActiveForm::begin(); ?>
<div class="row">
    <div class="col-md-8"><?= $form->field($model, 'Name')->textInput(['maxlength' => 255]) ?></div>
    <div class="col-md-4"><?= $form->field($model, 'Gender')->dropDownList(['M' => 'Male', 'F' => 'Female'], ['prompt' => '- Choose Gender']) ?></div>

    <div class="col-md-8">
        <?php
        echo $form->field($model, 'FirstDropin')->widget(DateControl::classname(), [
            'type' => DateControl::FORMAT_DATE,
            'displayFormat' => 'php:d M Y',
            'saveFormat' => 'php:Y-m-d',
        ]);
        echo $form->field($model, 'ConfirmationDate')->widget(DateControl::classname(), [
            'type' => DateControl::FORMAT_DATE,
            'displayFormat' => 'php:d M Y',
            'saveFormat' => 'php:Y-m-d',
        ]);
        ?>            
    </div>
    <div class="col-md-4">
        <?= $form->field($model, 'Eligible')->dropDownList([1 => 'Yes', 0 => 'No'], ['prompt' => '- Choose']) ?>
    </div>
    <div class="col-md-8">
        <?= $form->field($model, 'Interpreter')->dropDownList(ArrayHelper::map(Languages::find()->orderBy('Language')->all(), 'ID', 'Language')) ?>    
    </div>
    <div class="col-md-4">
        <?= $form->field($model, 'NeedInterpreter')->dropDownList([1 => 'Yes', 0 => 'No'], ['prompt' => '- Choose']) ?>
    </div>
    <br>
    <div class="row col-md-12"  style="margin: 10px 0; font-weight: bold;">
        <div class="col-md-6 col-md-offset-0" id="doctor-selection">Need Doctor today? <?= Html::checkbox("Doctor","0") ?></div>
        <div class="col-md-6 col-md-offset-0" id="lawyer-selection">Need Lawyer today? <?= Html::checkbox("Lawyer","0") ?></div>
    </div>
    <br>
    <div class="col-md-12">
        <?= $form->field($model, 'Comments', ['template' => "Comments\n\n{input}\n{hint}\n{error}"])->textArea(array('rows' => 5, 'placeholder' => 'Elegibility comments and other important issues.')); ?>
        <?= $form->field($model, 'CommentsOld', ['template' => "Comments\n\n{input}\n{hint}\n{error}"])->textArea(array('rows' => 5, 'placeholder' => 'Please don\'t add new comments here this field will be deleted in the future...')); ?>
    </div>       
</div>


<div class="form-group">
    <?= Html::a('Cancel', ['index'], ['class' => 'btn btn-warning']) ?>        
    <?= Html::submitButton($model->isNewRecord ? 'Create' : 'Update', ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-success']) ?>
</div>
<?php ActiveForm::end(); ?>
