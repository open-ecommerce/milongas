<?php

use yii\helpers\Html;
use kartik\detail\DetailView;
use app\models\Customer;
use app\models\Attendance;
use yii\data\ActiveDataProvider;


/* @var $this yii\web\View */
/* @var $model app\models\Customers */

$this->title = $model->Name;
$this->params['breadcrumbs'][] = ['label' => 'Customers', 'url' => ['index']];
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="customers-view">
    <?= DetailView::widget([
    'model'=>$model,
    'condensed'=>true,
    'hover'=>true,
    'mode'=>DetailView::MODE_EDIT ,
    'panel'=>[
        'heading'=>'Customer: ' . $model->Name,
        'type'=>DetailView::TYPE_INFO,
    ],
    'attributes'=>[
            'ID',
            'Name',
            'Gender',
            ['attribute'=>'ConfirmationDate', 'type'=>DetailView::INPUT_DATE],
            'Eligible',
            'Comments',
            'CommentsOld',
        ],
    ]) ?>
</div>