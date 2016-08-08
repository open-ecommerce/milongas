<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Customers;

/**
 * CustomersSearch represents the model behind the search form about `app\models\Customers`.
 */
class CustomersSearch extends Customers
{
    /**
     * @inheritdoc
     */
    
    public $Dropin;
    public $Doctor;
    public $Lawyer;
    public $DropinTime;
    public $DropinDate;
    public $Language;
    
    public function rules()
    {
        return [
            [['ID'], 'integer'],
            [['Name', 'Gender', 'Eligible', 'Comments', 'CommentsOld', 'ConfirmationDate', 'Interpreter'], 'safe'],
            [['Doctor', 'Lawyer', 'Dropin', 'DropinTime', 'DropinDate'], 'safe'],
            [['Language'], 'safe'],
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
        $query = Customers::find();
        $query->joinWith(['attendance']);
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort'=> ['defaultOrder' => ['Name'=>SORT_ASC]]
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        
        // order by doctor
        $dataProvider->sort->attributes['doctor'] = [
            'asc' => ['Attribute.Doctor' => SORT_ASC],
            'desc' => ['Attribute.Doctor' => SORT_DESC],
        ];                
        
        
        $query->andFilterWhere([
            'ID' => $this->ID,
            'ConfirmationDate' => $this->ConfirmationDate,
            'Doctor' => $this->Doctor,
        ]);

        $query->andFilterWhere(['like', 'Name', $this->Name])
            ->andFilterWhere(['like', 'Gender', $this->Gender])
            ->andFilterWhere(['like', 'Eligible', $this->Eligible])
            ->andFilterWhere(['like', 'Eligible', $this->Doctor])
            ->andFilterWhere(['like', 'Comments', $this->Comments])
            ->andFilterWhere(['like', 'CommentsOld', $this->CommentsOld])
            ->andFilterWhere(['like', 'Interpreter', $this->Interpreter]);

        return $dataProvider;
    }
}
