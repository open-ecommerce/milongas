<?php

use kartik\export\ExportMenu;
use kartik\grid\GridView;
use kartik\helpers\Html;

$this->title = date('l jS \of F Y');

$deleteTip = "Delete this customer detail and all the attendances records.";
$deleteMsg = "Are you sure you want to delete this customer detail and all the attendances records?";

$this->params['breadcrumbs'][] = $this->title;
?>
<div class="export-all">
    <br>
<?php
$gridColumns = [
    'ID',
    'Name',
    'Gender',
    'ConfirmationDate',
    'Eligible',
    'Comments',
    'CommentsOld',
];


echo ExportMenu::widget([
    'dataProvider' => $dataProvider,
    'columns' => $gridColumns,
    'fontAwesome' => true,
    'dropdownOptions' => [
        'label' => 'Export All',
        'class' => 'btn btn-default'
    ]
]) . "<hr>\n" .
 GridView::widget([
    'dataProvider' => $dataProvider,
    'columns' => $gridColumns,
    'export' => [
        'fontAwesome' => true,
    ]
]);
?>

</div>
