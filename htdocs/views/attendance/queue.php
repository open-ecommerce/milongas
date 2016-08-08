<?php

//to do some work y desde aca tambien

use yii\jui\DatePicker;
use yii\helpers\Html;
//use yii\grid\GridView;
use kartik\grid\GridView;
use yii\helpers\Url;

/* @var $this yii\web\View */
/* @var $searchModel app\models\QueueSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->registerJs("setTimeout('location.reload(true);',5000);");



$this->title = 'Doctor\'s and Lawyer Queue for Today';
$this->params['breadcrumbs'][] = $this->title;
?>

<div class="queue-display container">
    <div class="col-md-8 col-md-offset-2">    
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Doctor's and Lawyer's Queue for Today </h3>
            </div>
            <div class="panel-body">
                <?php
                $gridColumns = [
                    [
                        'label' => 'Dropin Time',
                        'attribute' => 'DropinTime',
                        'value' => 'DropinTime',
                        'hAlign' => 'center',
                        'vAlign' => 'middle',
                        'width' => '10px',
                        'format' => ['date', 'php:g:i A'],
                    ],
                    [
                        'attribute' => 'CustomersID',
                        'label' => 'Client',
                        'hAlign' => 'center',
                        'vAlign' => 'middle',
                        'width' => '10px',
                    ],
                    [
                        'attribute' => 'Name',
                        'value' => 'customers.Name',
                        'hAlign' => 'left',
                        'vAlign' => 'middle',
                        'width' => '200px',
                    ],
                    [ 'class' => 'kartik\grid\TrivalentColumn',
                        'vAlign' => 'middle',
                        'label' => 'Doctor Status',
                        'attribute' => 'Doctor',
                    ],
                    [ 'class' => 'kartik\grid\TrivalentColumn',
                        'vAlign' => 'middle',
                        'label' => 'Lawyer Status',
                        'attribute' => 'Lawyer',
                    ],
                ];
                ?>


                <?=
                GridView::widget([
                    'dataProvider' => $dataProvider,
                    'resizableColumns' => false,
                    'summary' => false,
                    'showPageSummary' => false,
                    'headerRowOptions' => ['class' => 'kartik-sheet-style'],
                    //'filterRowOptions' => ['class' => 'kartik-sheet-style'],
                    'responsive' => true,
                    'pager' => false,
                    'pjax' => true, // pjax is set to always true for this demo
                    'pjaxSettings' => [
                        'neverTimeout' => true,
                    ],
                    'hover' => true,
                    'columns' => $gridColumns,
                    // set export properties
                    'export' => [
                        'fontAwesome' => true
                    ],
                    // set your toolbar
                    'toolbar' => [
                        '{export}',
                    ],
                ]);
                ?>

            </div>
        </div>
    </div>
</div>
