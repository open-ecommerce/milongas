<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "CustomersAttendance".
 *
 * @property integer $ID
 * @property string $Name
 * @property string $Gender
 * @property string $ConfirmationDate
 * @property string $Eligible
 * @property string $Comments
 * @property string $CommentsOld
 * @property boolean $Doctor
 * @property boolean $Lawyer
 * @property boolean $Dropin
 * @property string $DropinDate
 * @property string $Observation
 * @property string $FirstDropin
 */
class CustomersAttendance extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'CustomersAttendance';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ID'], 'integer'],
            [['ConfirmationDate', 'DropinDate', 'FirstDropin'], 'safe'],
            [['Doctor', 'Lawyer', 'Dropin'], 'boolean'],
            [['Name', 'Gender', 'Eligible', 'Comments', 'CommentsOld'], 'string', 'max' => 255],
            [['Observation'], 'string', 'max' => 250]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => 'ID',
            'Name' => 'Name',
            'Gender' => 'Gender',
            'ConfirmationDate' => 'Eligible Date',
            'Eligible' => 'Eligible',
            'Comments' => 'Comments',
            'CommentsOld' => 'CommentsOld',
            'Doctor' => 'Doctor',
            'Lawyer' => 'Lawyer',
            'Dropin' => 'Dropin',
            'DropinDate' => 'Dropin Date',
            'Observation' => 'Observation',
            'FirstDropin' => 'Last Milonga',
        ];
    }
}
