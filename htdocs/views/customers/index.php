<?php

//to do some work y desde aca tambien

use yii\jui\DatePicker;
use yii\helpers\Html;
//use yii\grid\GridView;
use kartik\grid\GridView;
use yii\helpers\Url;
use app\models\Languages;
use yii\helpers\ArrayHelper;

/* @var $this yii\web\View */
/* @var $searchModel app\models\CustomersSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = date('l jS \of F Y');

$deleteTip = "Delete this client detail and all the attendances records.";
$deleteMsg = "Are you sure you want to delete this client detail and all the attendances records?";

$this->params['breadcrumbs'][] = $this->title;
?>
<div class="customers-index">
<?php // echo $this->render('_search', ['model' => $searchModel]);  ?>
    <?php
    $gridColumns = [
        [
            'attribute' => 'ID',
            'label' => 'Cust. #',
            'width' => '10px',
            'hAlign' => 'center',
        ],
        [
            'class' => 'kartik\grid\ExpandRowColumn',
            'value' => function ($model, $key, $index, $column) {
                return GridView::ROW_COLLAPSED;
            },
            'detailUrl' => Url::to(['attendance/detail']),
            'detailRowCssClass' => GridView::TYPE_DEFAULT,
            'pageSummary' => false,
        ],
        [
            'attribute' => 'Name',
            'vAlign' => 'middle',
            'label' => 'Name',
            'format' => 'html',
            'value' => function($model, $index, $dataColumn) {
                return $model->getColoredName();
            },
        ],
        [
            'attribute' => 'Gender',
            'label' => 'Gender',
            'width' => '10px',
            'hAlign' => 'center',
        ],
        [
            'class' => 'kartik\grid\BooleanColumn',
            'attribute' => 'Eligible',
            'label' => 'Eligible',
        ],
        [
            'class' => 'kartik\grid\BooleanColumn',
            'attribute' => 'NeedInterpreter',
            'label' => 'Interp.',
        ],
//        [
//            'attribute' => 'Interpreter',
//            'vAlign' => 'middle',
//            'width' => '70px',
//            'value' => function ($model, $key, $index, $widget) {
//                return $model->getLanguage();
//            },
//            'filterType' => GridView::FILTER_SELECT2,
//            'filter' => ArrayHelper::map(Languages::find()->orderBy('Language')->asArray()->all(), 'ID', 'Language'),
//            'filterWidgetOptions' => [
//                'pluginOptions' => ['allowClear' => true],
//            ],
//            'filterInputOptions' => ['placeholder' => 'Any Interpreter'],
//            'format' => 'raw'
//        ],
        [
            'class' => 'kartik\grid\BooleanColumn',
            'vAlign' => 'middle',
            'label' => 'Dropin',
            'value' => function($model, $index, $dataColumn) {
                return $model->getAttendances('Dropin');
            },
        ],
        [
            'class' => 'kartik\grid\TrivalentColumn',
            'vAlign' => 'middle',
            'label' => 'Doctor',
            'value' => function($model, $index, $dataColumn) {
                return $model->getAttendances('Doctor');
            },
        ],
        [
            'class' => 'kartik\grid\TrivalentColumn',
            'vAlign' => 'middle',
            'label' => 'Lawyer',
            'value' => function($model, $index, $dataColumn) {
                return $model->getAttendances('Lawyer');
            },
        ],
        [
            'class' => 'kartik\grid\ActionColumn',
            'template' => '{today_action}',
            'header' => 'Edit',
            'buttons' => [
                'today_action' => function ($url, $model) {
                    return Html::a('<i class="glyphicon glyphicon-plus"></i>  Drop In', $url, ['class' => 'btn btn-success'], [
                                'title' => Yii::t('app', 'Change today\'s lists'),
                    ]);
                }
                    ],
                    'urlCreator' => function ($action, $model, $key, $index) {
                if ($action === 'today_action') {
                    $url = Yii::$app->urlManager->createUrl(array('attendance/today', ['id' => $key]));
                    return $url;
                }
            }
        ],
        [
                    'attribute' => 'Comments',
                ],
                [
                    'label' => '1st Dropin',
                    'attribute' => 'FirstDropin',
                    'value' => 'FirstDropin',
                    'hAlign' => 'center',
                    'vAlign' => 'middle',
                    'width' => '10px',
                    'format' => ['date', 'php:d M Y'],
                ],
                [
                    'label' => 'Confirmation',
                    'attribute' => 'ConfirmationDate',
                    'value' => 'ConfirmationDate',
                    'hAlign' => 'center',
                    'vAlign' => 'middle',
                    'width' => '10px',
                    'format' => ['date', 'php:d M Y'],
                    'filter' => false,
                ],
                [
                    'attribute' => 'CommentsOld',
                ],
                [
                    'class' => 'kartik\grid\ActionColumn',
                    'header' => 'Update',
                    'template' => '{update}',
                    'viewOptions' => ['label' => '<i class="glyphicon glyphicon-pencil edit-today"></i>'],
                ],
                [
                    'class' => 'kartik\grid\ActionColumn',
                    'header' => 'Delete',
                    'template' => '{delete}',
                    'deleteOptions' => ['label' => '<i class="glyphicon glyphicon-trash"></i>'],
                    'deleteOptions' => ['title' => $deleteTip, 'data-toggle' => 'tooltip', 'data-confirm' => $deleteMsg],
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
                'beforeHeader' => [
                    [
                        'columns' => [
                            ['content' => 'Clients\'s Details', 'options' => ['colspan' => 6, 'class' => 'text-center warning']],
                            ['content' => 'Today\'s Dropin', 'options' => ['colspan' => 4, 'class' => 'text-center success']],
                            ['content' => 'Clients\'s Comments', 'options' => ['colspan' => 3, 'class' => 'text-center warning']],
                            ['content' => 'Editing Clients\'s', 'options' => ['colspan' => 2, 'class' => 'text-center warning']],
                        ],
                        'options' => ['class' => 'skip-export'] // remove this row from export
                    ]
                ],
                'pjax' => true, // pjax is set to always true for this demo
                'pjaxSettings' => [
                    'neverTimeout' => true,
                ],
                'hover' => true,
                'panel' => [
                    'heading' => '<h3 class="panel-title"><i class="glyphicon glyphicon-user"></i> List of clients - ' . $this->title . '</h3>',
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
                    ['content' =>
                        Html::a('<i class="glyphicon glyphicon-plus"></i>  Create new Client', ['create'], ['class' => 'btn btn-success']),
                    ],
                    '{export}',
                ],
            ]);
            ?>

</div>
