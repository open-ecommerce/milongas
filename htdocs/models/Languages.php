<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "Languages".
 *
 * @property integer $ID
 * @property string $Language
 * @property string $ShortName
 */
class Languages extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'Languages';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['Language'], 'required'],
            [['Language'], 'safe'],
            [['Language', 'ShortName'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => 'ID',
            'Language' => 'Language',
            'ShortName' => 'Short Name',
        ];
    }
}
