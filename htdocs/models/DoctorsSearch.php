<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Attendance;

/**
 * AttendanceSearch represents the model behind the search form about `app\models\Attendance`.
 */
class DoctorsSearch extends Attendance
{
    /**
     * @inheritdoc
     */
    
    public $Name;
    
    public function rules()
    {
        return [
            [['ID', 'CustomersID'], 'integer'],
            [['Doctor', 'Lawyer', 'Dropin'], 'boolean'],
            [['DropinDate', 'DropinTime', 'Observation'], 'safe'],
            [['Name'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        $query = Attendance::find();
        $query->joinWith(['customers']);
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort'=> ['defaultOrder' => ['DropinTime'=>SORT_ASC]],
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // order by time
        $dataProvider->sort->attributes['Name'] = [
            'asc' => ['Customers.Name' => SORT_ASC],
            'desc' => ['Customers.Name' => SORT_DESC],
        ];        
        
        
        $query->andFilterWhere([
            'ID' => $this->ID,
            'CustomersID' => $this->CustomersID,
            'Dropin' => $this->Dropin,
            'DropinDate' => date('Y-m-d'),
            'DropinTime' => $this->DropinTime,
        ]);

        $query->andFilterWhere(['>', 'Doctor', 0]);
        $query->andFilterWhere(['like', 'Observation', $this->Observation]);

        return $dataProvider;
    }
}
