<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Attendance;

/**
 * StatisticsSearch represents the model behind the search form about `app\models\Attendance`.
 */
class StatisticsSearch extends Attendance
{
    /**
     * @inheritdoc
     */
    
    public $Clients;
    
    public function rules()
    {
        return [
            [['ID'], 'integer'],
            [['DropinDate', 'Clients'], 'safe'],
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
        $query->select(['COUNT(*) AS Clients', 'DropinDate'])
        ->groupBy(['DropinDate'])
        ->all();        
        
        
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort'=> ['defaultOrder' => ['DropinDate'=>SORT_DESC]],
        ]);

        $this->load($params);

        if (!$this->validate()) {
            return $dataProvider;
        }
  
                
        return $dataProvider;
    }
    

    
    
    
    
    
}
