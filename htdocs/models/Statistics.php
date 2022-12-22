<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "qry_totals".
 *
 * @property string $DropinDate
 * @property string $MainEntrance
 * @property integer $A-L
 * @property integer $M-Z
 * @property integer $SeenDoctor
 * @property integer $SeenLawyer
 * @property integer $Total
 */
class Statistics extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'qry_totals';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['DropinDate'], 'safe'],
            [['A-L', 'M-Z', 'SeenDoctor', 'SeenLawyer', 'Total'], 'integer'],
            [['MainEntrance'], 'string', 'max' => 30]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'DropinDate' => Yii::t('app', 'Milonga Date'),
            'MainEntrance' => Yii::t('app', 'Venue'),
            'A-L' => Yii::t('app', 'A  L'),
            'M-Z' => Yii::t('app', 'M  Z'),
            'SeenDoctor' => Yii::t('app', 'Seen Doctor'),
            'SeenLawyer' => Yii::t('app', 'Seen Lawyer'),
            'Total' => Yii::t('app', 'Total'),
        ];
    }
}
