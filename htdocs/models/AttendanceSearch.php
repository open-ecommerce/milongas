<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Attendance;

/**
 * AttendanceSearch represents the model behind the search form about `app\models\Attendance`.
 */
class AttendanceSearch extends Attendance
{
    /**
     * @inheritdoc
     */
    
    public $Name;
    
    public function rules()
    {
        return [
            [['ID', 'CustomersID'], 'integer'],
            [['Doctor', 'Lawyer', 'Dropin'], 'integer'],
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
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // order by time
        $dataProvider->sort->attributes['name'] = [
            'asc' => ['Customers.Name' => SORT_ASC],
            'desc' => ['Customers.Name' => SORT_DESC],
        ];        
        
        
        $query->andFilterWhere([
            'ID' => $this->ID,
            'CustomersID' => $this->CustomersID,
            'Doctor' => $this->Doctor,
            'Lawyer' => $this->Lawyer,
            'Dropin' => $this->Dropin,
            'DropinDate' => $this->DropinDate,
            'DropinTime' => $this->DropinTime,
        ]);

        $query->andFilterWhere(['like', 'Observation', $this->Observation]);

        return $dataProvider;
    }
}
