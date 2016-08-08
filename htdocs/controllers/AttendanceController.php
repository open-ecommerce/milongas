<?php

namespace app\controllers;

use Yii;
use app\models\Attendance;
use app\models\AttendanceSearch;
use app\models\QueueSearch;
use app\models\StatisticsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\Json;
use yii\data\ActiveDataProvider;
use app\models\Customers;
use yii\filters\AccessControl;



/**
 * AttendanceController implements the CRUD actions for Attendance model.
 */
class AttendanceController extends Controller {

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
     * Lists all Attendance models.
     * @return mixed
     */
    public function actionIndex() {
        $searchModel = new AttendanceSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Attendance model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id) {
        return $this->render('view', [
                    'model' => $this->findModel($id),
        ]);
    }

    
    public function actionStatistics() {
       $searchModel = new StatisticsSearch();
       $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('statistics', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }
       
    
    public function actionQueue() {
       $searchModel = new QueueSearch();
       $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('queue', [
                    'searchModel' => $searchModel,
                    'dataProvider' => $dataProvider,
        ]);
    }

    public function actionDoctor() {
        $ID = $_GET['1']['id'];

        $model = Attendance::find()->where(['ID' => $ID])->one();
        $modelCustomers = Customers::find()->where(['ID' => $model->CustomersID])->one();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['doctor/index']);
        } else {
            return $this->render('//attendance/_form-today-doctor', ['modelCustomers' => $modelCustomers, 'model' => $model]);

        }
    }

    public function actionLawyer() {
        $ID = $_GET['1']['id'];

        $model = Attendance::find()->where(['ID' => $ID])->one();
        $modelCustomers = Customers::find()->where(['ID' => $model->CustomersID])->one();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['lawyer/index']);
        } else {
            return $this->render('//attendance/_form-today-lawyer', ['modelCustomers' => $modelCustomers, 'model' => $model]);

        }
    }


    public function actionToday() {

        $current_id = $_GET['1']['id'];

        $sessionName = Yii::$app->user->getId().".parentURL";
        $parentURL = Yii::$app->session->get($sessionName);

        if (!isset($parentURL)) {
            //$url = $this->redirect(Yii::$app->request->referrer);
            $url = $_SERVER["HTTP_REFERER"];

            //Yii::$app->session->set('user.parentURL', $_SERVER["HTTP_REFERER"]);
            Yii::$app->session->set($sessionName, $url);
        }

        $today = date("Y-m-d");
        $beforeToday = 'DropinDate>' . $today;

        $modelCustomers = Customers::find()->where(['ID' => $current_id])->one();
        $model = Attendance::find()->where(['CustomersID' => $current_id])->andwhere(['DropinDate' => $today])->one();


        if ($model === null) {
            $model = new Attendance;
            $model->CustomersID = $current_id;
            $model->Dropin = 1;
            $model->DropinTime = date("H:i:s");
            $model->DropinDate = date("Y-m-d");
        }


        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            unset (Yii::$app->session[$sessionName]);
            Yii::$app->session->destroySession($sessionName);
            return $this->redirect($parentURL);
        } else {

            return $this->render('//attendance/_form-today-attendance', ['modelCustomers' => $modelCustomers, 'model' => $model]);


        }
    }

    /**
     * Url action - /attendance/attendance-detail
     */
    public function actionDetail() {
        if (isset($_POST['expandRowKey'])) {
            $ID = Yii::$app->request->post('expandRowKey');

            $today = date("Y-d-m");
            $beforeToday = 'DropinDate>' . $today;
            $model = Attendance::find()->where(['CustomersID' => $ID])->andwhere($beforeToday)->orderBy('DropinDate desc');

            //$model = Attendance::find()
            //        ->where(['CustomersID' => $ID]);


            $dataProvider = new ActiveDataProvider([
                'query' => $model,
                'pagination' => ['pageSize' => 20,],
            ]);
            $this->layout = '_only-content';
            return $this->render('_grid_attendance-details', [
                        'dataProvider' => $dataProvider,
            ]);
        } else {
            return '<div class="alert alert-danger">No data found</div>';
        }
    }

    /**
     * Creates a new Attendance model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate() {
        $model = new Attendance();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->ID]);
        } else {
            return $this->render('create', [
                        'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Attendance model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id) {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->ID]);
        } else {
            return $this->render('update', [
                        'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Attendance model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id) {
        $this->findModel($id)->delete();

        return $this->redirect(['customers/index']);
    }

    /**
     * Finds the Attendance model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Attendance the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id) {
        if (($model = Attendance::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

}
