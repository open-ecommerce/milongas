<?php

namespace app\controllers;

use Yii;
use app\models\Customers;
use app\models\CustomersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\Json;
use app\models\Attendance;
use yii\filters\AccessControl;
use yii\data\ActiveDataProvider;
use yii\data\SqlDataProvider;

/**
 * CustomerController implements the CRUD actions for Customers model.
 */
class CustomersController extends Controller {

    public function behaviors() {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    // deny all POST requests
                    [
                        'allow' => false,
                        'roles' => ['?'],
                    ],
                    // allow authenticated users
                    [
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['post'],
                ],
            ],
        ];
    }

    /**
     * Lists all Customers models.
     * @return mixed
     */
    public function actionIndex() {
        $searchModel = new CustomersSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Customers model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id) {
        return $this->render('view', [
                    'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new Customers model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate() {
        $model = new Customers();
        
        $today = date("Y-m-d");
        $beforeToday = 'DropinDate>' . $today;
        $needDoctor = 0;
        $needLawyer = 0;
        
        if(isset($_POST['Doctor'])) {
            $needDoctor = 1;
        }
        if(isset($_POST['Lawyer'])) {
            $needLawyer = 1;
        }

        
        if ($model->load(Yii::$app->request->post()) ) {
            $model->save();
            $current_id = $model->getPrimaryKey();            
            $attendance = Attendance::find()->where(['CustomersID' => $current_id])->andwhere(['DropinDate' => $today])->one();
            if ($attendance === null) {
                $attendance = new Attendance;
                $attendance->CustomersID = $current_id;
                $attendance->Dropin = 1;
                $attendance->Doctor = $needDoctor;
                $attendance->Lawyer = $needLawyer;
                $attendance->DropinTime = date("H:i:s");
                $attendance->DropinDate = date("Y-m-d");
            }
            $attendance->save();
            
            if ($attendance->save()) {
                return $this->redirect(['index']);
            }
        } else {
            return $this->render('create', [
                        'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Customers model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id) {
        $sessionName = Yii::$app->user->getId() . ".parentURL";
        $parentURL = Yii::$app->session->get($sessionName);
        if (!isset($parentURL)) {
            $url = $_SERVER["HTTP_REFERER"];
            Yii::$app->session->set($sessionName, $url);
        }
        $model = $this->findModel($id);
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            unset(Yii::$app->session[$sessionName]);
            Yii::$app->session->destroySession($sessionName);
            return $this->redirect($parentURL);
        } else {
            return $this->render('update', [
                        'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Customers model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id) {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Customers model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Customers the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id) {
        if (($model = Customers::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    public function actionExportAll() {
        $searchModel = new CustomersSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('export-all', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }

    public function actionExportDropinObs() {

        $dataProvider = new SqlDataProvider([
            'sql' => 'SELECT * FROM qry_observations',
            'pagination' => array('pageSize' => 3000),
        ]);



        $searchModel = new CustomersSearch();
        //$dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('export-dropin-obs', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }

   
}
