<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "Attendance".
 *
 * @property integer $ID
 * @property integer $CustomersID
 * @property integer $Doctor
 * @property integer $Lawyer
 * @property integer $Dropin
 * @property date $DropinDate
 * @property string $Observation
 *
 * @property Customers $customers
 */
class Attendance extends \yii\db\ActiveRecord
{
    
    // to use in total statistics
    public $Clients;
    
    
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'Attendance';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['DropinDate'], 'required'],
            [['CustomersID'], 'integer'],
            [['Doctor', 'Lawyer', 'Dropin'], 'integer'],
            [['DropinDate', 'DropinTime', 'Doctor', 'Lawyer', 'Dropin'], 'safe'],
            ['DropinDate', 'date', 'format' => 'Y-m-d'],
            [['Observation'], 'string', 'max' => 250],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => 'ID',
            'CustomersID' => 'Customers ID',
            'Doctor' => 'Doctor',
            'Lawyer' => 'Lawyer',
            'Dropin' => 'Dropin',
            'DropinDate' => 'Dropin Date',
            'DropinTime' => 'Dropin Time',
            'Observation' => 'Observation',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCustomers()
    {
        return $this->hasOne(Customers::className(), ['ID' => 'CustomersID']);
    }
}
