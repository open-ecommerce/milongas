<?php

use yii\helpers\Html;

?>
<div class="modal-dialog">
    <div class="modal-content">
        <div class="modal-body">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span
                    class="sr-only">Close</span></button>
            <div class="text-center">
                <br>
                <?= Html::img('media/NNLS-logo-s.jpg') ?>
                <br>
                <h3><?= getenv('APP_NAME') ?></h3>
                <p>
                    Application Version <b><?= getenv('APP_ID') ?>-<?= getenv('APP_VERSION') ?></b>
                </p>
                <p>
                    Developed with Yii2 and based in phundament application.</b>
                </p>
                <br>
                <p class="small">
                    <?= Html::a(Html::img('media/powered-by-open-ecommerce-org.png'), 'http://open-ecommerce.org') ?>
                </p>
                <br>
            </div>
        </div>
    </div>
</div>
