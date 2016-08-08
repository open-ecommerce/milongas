<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "Dropins".
 *
 * @property integer $ID
 * @property string $DropinDate
 * @property string $MainEntrance
 */
class Dropin extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'Dropins';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['DropinDate', 'DropinDateFormated'], 'safe'],
            [['MainEntrance'], 'string', 'max' => 10]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => 'ID',
            'DropinDate' => 'Dropin Date',
            'MainEntrance' => 'Main Entrance',
        ];
    }

    /**
     * @inheritdoc
     */
    public function getDropinDateFormated()
    {
        return \Yii::$app->formatter->asDate($this->DropinDate, "php:d M Y");
    }

}
