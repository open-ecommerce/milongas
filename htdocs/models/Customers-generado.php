<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "Customers".
 *
 * @property integer $ID
 * @property string $Name
 * @property string $Gender
 * @property string $ConfirmationDate
 * @property string $Eligible
 * @property string $Comments
 * @property string $CommentsOld
 *
 * @property Attendance[] $attendances
 */
class Customers extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'Customers';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ConfirmationDate'], 'safe'],
            [['Name', 'Gender', 'Eligible', 'Comments', 'CommentsOld'], 'string', 'max' => 255]
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
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAttendances()
    {
        return $this->hasMany(Attendance::className(), ['CustomersID' => 'ID']);
    }
}
