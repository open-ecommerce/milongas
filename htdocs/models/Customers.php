<?php

namespace app\models;

use Yii;
use yii\data\ActiveDataProvider;

/**
 * This is the model class for table "Customers".
 *
 * @property integer $ID
 * @property string $Name
 * @property string $Gender
 * @property date $ConfirmationDate
 * @property integer $Eligible
 * @property string $Comments
 * @property string $CommentsOld
 * @property integer $Interpreter
 * @property integer $NeedInterpreter
 * @property date $FirstDropin
 * 
 * @property Attendance[] $attendances
 * @property Language[] $languages
 */
class Customers extends \yii\db\ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'Customers';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['ConfirmationDate', 'Comments', 'Interpreter', 'NeedInterpreter', 'FirstDropin'], 'safe'],
            [['Name', 'Gender', 'Eligible', 'Interpreter', 'NeedInterpreter'], 'required'],
            [['Name', 'Gender', 'Eligible', 'Comments', 'CommentsOld', 'Interpreter', 'NeedInterpreter'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'ID' => 'ID',
            'Name' => 'Name',
            'Gender' => 'Gender',
            'ConfirmationDate' => 'Solicitor Confirmation Date',
            'Eligible' => 'Eligible',
            'Comments' => 'Comments',
            'CommentsOld' => 'Previous Comments',
            'Interpreter' => 'Language',
            'NeedInterpreter' => 'Interpreter',
            'FirstDropin' => '1st Dropin',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAttendances($field_to_search) {
        $today = date("Y-m-d");
        $model = Attendance::find()->where(['CustomersID' => $this->ID])->andwhere(['DropinDate' => $today])->one();
        //$model =  Attendance::find()->where(['CustomersID'=>$this->ID])->one();
        if (!empty($model)) {
            //design my GridView
            $value = $model->$field_to_search;
        } else {
            $value = 0;
        }

        return $value;

        //return "viva peron";
    }

    public function getDoctorlist() {
        $today = date("Y-m-d");

        //$model =  Attendance::find()->where(['CustomersID'=>$this->ID])->andwhere(['DropinDate'=>$today])->one();
        //$model =  Customers::find()->where(['CustomersID'=>$this->ID])->andwhere(['DropinDate'=>$today])->one();
        //$model = Customers::find()->joinwith('attendance')->all();
        //$model =  Customers::hasMany(Attendance::className(), ['ID' => 'CustomersID']);

        $dataProvider = new ActiveDataProvider([
            'query' => $model,
            'pagination' => ['pageSize' => 20,],
        ]);

        return $dataProvider;

        //$model =  Attendance::find()->where(['CustomersID'=>$this->ID])->one();
    }

    public function getAttendance() {
        return $this->hasOne(Attendance::className(), ['CustomersID' => 'ID']);
    }

    public function getLanguage() {
        $model = Languages::find()->where(['ID' => $this->Interpreter])->one();
        if (!empty($model)) {
            //design my GridView
            $value = $model->Language;
        } else {
            $value = 108;
        }
        return $value;
        //return "viva peron";
    }

    public function getLanguages() {
        return $this->hasOne(Languages::className(), ['ID' => 'Interpreter']);
    }

    public function getColoredName() {
        $full_name = $this->Name;


        $atol = preg_match('/^([a-lA-L]+)$/', $full_name[0]);

        if ($atol == 1) {
            $formatedName = "<span style='color:blue; font-size: 1.3em;line-height: 1.2em;'>" . $full_name . "</span>";
        } else {
            $formatedName = "<span style='color:green; font-size: 1.3em;line-height: 1.2em;'>" . $full_name . "</span>";
        }


        return $formatedName;
    }

}
