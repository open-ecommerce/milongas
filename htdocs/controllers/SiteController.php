<?php
namespace app\controllers;

use common\models\LoginForm;
use app\models\ContactForm;
use app\models\PasswordResetRequestForm;
use app\models\ResetPasswordForm;
use app\models\SignupForm;
use Yii;
use yii\helpers\Markdown;
use yii\helpers\Url;
use yii\web\Controller;

/**
 * Site controller
 */
class SiteController extends Controller
{
    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [
            'error'   => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class'           => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }

    /**
     * Renders the start page
     * @return string
     */
    public function actionIndex()
    {
        // SEO meta tags
        $this->view->registerMetaTag(
            [
                'name'    => 'keywords',
                'content' => 'Open-ecommerce.org, software, charities, social project, london'
            ],
            'keywords'
        );
        $this->view->registerMetaTag(
            [
                'name'    => 'description',
                'content' => 'internal managment system for dancers Drop-In to milongas.'
            ],
            'description'
        );
        return $this->render('index');
    }

    /**
     * Renders the contact page
     * @return string
     */
    public function actionContact()
    {
        $model = new ContactForm();
        if ($model->load(Yii::$app->request->post()) && $model->sendEmail(Yii::$app->params['adminEmail'])) {
            Yii::$app->session->setFlash('contactFormSubmitted');
            return $this->refresh();
        } else {
            return $this->render('contact', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Renders the start page
     * @return string
     */
    public function actionAbout()
    {
        $this->layout = 'container';
        return $this->render('about');
    }
}
