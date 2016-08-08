<?php

//to do some work y desde aca tambien

use yii\jui\DatePicker;
use yii\helpers\Html;
//use yii\grid\GridView;
use kartik\grid\GridView;
use yii\helpers\Url;

/* @var $this yii\web\View */
/* @var $searchModel app\models\CustomersSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */
$this->title = 'Lawyer\'s list for: ' . date('l jS \of F Y');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="doctor-index">
    <br>
    <h2><?= Html::encode($this->title) ?></h2>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <br>

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
            'label' => 'Client #',
            'hAlign' => 'center',
            'vAlign' => 'middle',
            'width' => '10px',
        ],
        [
            'attribute' => 'Name',
            'value' => 'customers.Name',
            'hAlign' => 'center',
            'vAlign' => 'middle',
            'width' => '30px',
        ],
        [ 'class' => 'kartik\grid\TrivalentColumn',
            'vAlign' => 'middle',
            'label' => 'Lawyer Status',
            'attribute' => 'Lawyer',
        ],
        [
            'class' => 'kartik\grid\ActionColumn',
            'template' => '{today_action}',
            'header' => 'Status Edition',
            'buttons' => [
                'today_action' => function ($url, $model) {
                    return Html::a('<span class="glyphicon glyphicon-pushpin"></span>', $url, [
                                'title' => Yii::t('app', 'Change Lawyer Status'),
                    ]);
                }
                    ],
                    'urlCreator' => function ($action, $model, $key, $index) {
                if ($action === 'today_action') {
                    $url = Yii::$app->urlManager->createUrl(array('attendance/lawyer', ['id' => $key]));
                    return $url;
                }
            }
                ],
                [
                    'attribute' => 'Observation',
                    'value' => 'Observation',
                    'width' => '30px',
                ],
            ];
            ?>


            <?=
            GridView::widget([
                'dataProvider' => $dataProvider,
                'filterModel' => $searchModel,
                'resizableColumns' => false,
                'showPageSummary' => false,
                'headerRowOptions' => ['class' => 'kartik-sheet-style'],
                'filterRowOptions' => ['class' => 'kartik-sheet-style'],
                'responsive' => true,
                'pjax' => true, // pjax is set to always true for this demo
                'pjaxSettings' => [
                    'neverTimeout' => true,
                ],
                'hover' => true,
                'panel' => [
                    'heading' => '<h3 class="panel-title"><i class="glyphicon glyphicon-user"></i> List of customers for the doctor.</h3>',
                    'type' => 'primary',
                    'showFooter' => false
                ],
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
