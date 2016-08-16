/**
 * Yii JavaScript module.
 *
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */

/**
 * yii is the root module for all Yii JavaScript modules.
 * It implements a mechanism of organizing JavaScript code in modules through the function "yii.initModule()".
 *
 * Each module should be named as "x.y.z", where "x" stands for the root module (for the Yii core code, this is "yii").
 *
 * A module may be structured as follows:
 *
 * ```javascript
 * yii.sample = (function($) {
 *     var pub = {
 *         // whether this module is currently active. If false, init() will not be called for this module
 *         // it will also not be called for all its child modules. If this property is undefined, it means true.
 *         isActive: true,
 *         init: function() {
 *             // ... module initialization code go here ...
 *         },
 *
 *         // ... other public functions and properties go here ...
 *     };
 *
 *     // ... private functions and properties go here ...
 *
 *     return pub;
 * })(jQuery);
 * ```
 *
 * Using this structure, you can define public and private functions/properties for a module.
 * Private functions/properties are only visible within the module, while public functions/properties
 * may be accessed outside of the module. For example, you can access "yii.sample.isActive".
 *
 * You must call "yii.initModule()" once for the root module of all your modules.
 */
yii = (function ($) {
    var pub = {
        /**
         * List of JS or CSS URLs that can be loaded multiple times via AJAX requests. Each script can be represented
         * as either an absolute URL or a relative one.
         */
        reloadableScripts: [],
        /**
         * The selector for clickable elements that need to support confirmation and form submission.
         */
        clickableSelector: 'a, button, input[type="submit"], input[type="button"], input[type="reset"], input[type="image"]',
        /**
         * The selector for changeable elements that need to support confirmation and form submission.
         */
        changeableSelector: 'select, input, textarea',

        /**
         * @return string|undefined the CSRF parameter name. Undefined is returned if CSRF validation is not enabled.
         */
        getCsrfParam: function () {
            return $('meta[name=csrf-param]').attr('content');
        },

        /**
         * @return string|undefined the CSRF token. Undefined is returned if CSRF validation is not enabled.
         */
        getCsrfToken: function () {
            return $('meta[name=csrf-token]').attr('content');
        },

        /**
         * Sets the CSRF token in the meta elements.
         * This method is provided so that you can update the CSRF token with the latest one you obtain from the server.
         * @param name the CSRF token name
         * @param value the CSRF token value
         */
        setCsrfToken: function (name, value) {
            $('meta[name=csrf-param]').attr('content', name);
            $('meta[name=csrf-token]').attr('content', value);
        },

        /**
         * Updates all form CSRF input fields with the latest CSRF token.
         * This method is provided to avoid cached forms containing outdated CSRF tokens.
         */
        refreshCsrfToken: function () {
            var token = pub.getCsrfToken();
            if (token) {
                $('form input[name="' + pub.getCsrfParam() + '"]').val(token);
            }
        },

        /**
         * Displays a confirmation dialog.
         * The default implementation simply displays a js confirmation dialog.
         * You may override this by setting `yii.confirm`.
         * @param message the confirmation message.
         * @param ok a callback to be called when the user confirms the message
         * @param cancel a callback to be called when the user cancels the confirmation
         */
        confirm: function (message, ok, cancel) {
            if (confirm(message)) {
                !ok || ok();
            } else {
                !cancel || cancel();
            }
        },

        /**
         * Handles the action triggered by user.
         * This method recognizes the `data-method` attribute of the element. If the attribute exists,
         * the method will submit the form containing this element. If there is no containing form, a form
         * will be created and submitted using the method given by this attribute value (e.g. "post", "put").
         * For hyperlinks, the form action will take the value of the "href" attribute of the link.
         * For other elements, either the containing form action or the current page URL will be used
         * as the form action URL.
         *
         * If the `data-method` attribute is not defined, the `href` attribute (if any) of the element
         * will be assigned to `window.location`.
         *
         * Starting from version 2.0.3, the `data-params` attribute is also recognized when you specify
         * `data-method`. The value of `data-params` should be a JSON representation of the data (name-value pairs)
         * that should be submitted as hidden inputs. For example, you may use the following code to generate
         * such a link:
         *
         * ```php
         * use yii\helpers\Html;
         * use yii\helpers\Json;
         *
         * echo Html::a('submit', ['site/foobar'], [
         *     'data' => [
         *         'method' => 'post',
         *         'params' => [
         *             'name1' => 'value1',
         *             'name2' => 'value2',
         *         ],
         *     ],
         * ];
         * ```
         *
         * @param $e the jQuery representation of the element
         */
        handleAction: function ($e, event) {
            var $form = $e.attr('data-form') ? $('#' + $e.attr('data-form')) : $e.closest('form'),
                method = !$e.data('method') && $form ? $form.attr('method') : $e.data('method'),
                action = $e.attr('href'),
                params = $e.data('params'),
                pjax = $e.data('pjax'),
                pjaxPushState = !!$e.data('pjax-push-state'),
                pjaxReplaceState = !!$e.data('pjax-replace-state'),
                pjaxTimeout = $e.data('pjax-timeout'),
                pjaxScrollTo = $e.data('pjax-scrollto'),
                pjaxPushRedirect = $e.data('pjax-push-redirect'),
                pjaxReplaceRedirect = $e.data('pjax-replace-redirect'),
                pjaxSkipOuterContainers = $e.data('pjax-skip-outer-containers'),
                pjaxContainer,
                pjaxOptions = {};

            if (pjax !== undefined && $.support.pjax) {
                if ($e.data('pjax-container')) {
                    pjaxContainer = $e.data('pjax-container');
                } else {
                    pjaxContainer = $e.closest('[data-pjax-container=""]');
                }
                // default to body if pjax container not found
                if (!pjaxContainer.length) {
                    pjaxContainer = $('body');
                }
                pjaxOptions = {
                    container: pjaxContainer,
                    push: pjaxPushState,
                    replace: pjaxReplaceState,
                    scrollTo: pjaxScrollTo,
                    pushRedirect: pjaxPushRedirect,
                    replaceRedirect: pjaxReplaceRedirect,
                    pjaxSkipOuterContainers: pjaxSkipOuterContainers,
                    timeout: pjaxTimeout,
                    originalEvent: event,
                    originalTarget: $e
                }
            }

            if (method === undefined) {
                if (action && action != '#') {
                    if (pjax !== undefined && $.support.pjax) {
                        $.pjax.click(event, pjaxOptions);
                    } else {
                        window.location = action;
                    }
                } else if ($e.is(':submit') && $form.length) {
                    if (pjax !== undefined && $.support.pjax) {
                        $form.on('submit',function(e){
                            $.pjax.submit(e, pjaxOptions);
                        })
                    }
                    $form.trigger('submit');
                }
                return;
            }

            var newForm = !$form.length;
            if (newForm) {
                if (!action || !action.match(/(^\/|:\/\/)/)) {
                    action = window.location.href;
                }
                $form = $('<form/>', {method: method, action: action});
                var target = $e.attr('target');
                if (target) {
                    $form.attr('target', target);
                }
                if (!method.match(/(get|post)/i)) {
                    $form.append($('<input/>', {name: '_method', value: method, type: 'hidden'}));
                    method = 'POST';
                }
                if (!method.match(/(get|head|options)/i)) {
                    var csrfParam = pub.getCsrfParam();
                    if (csrfParam) {
                        $form.append($('<input/>', {name: csrfParam, value: pub.getCsrfToken(), type: 'hidden'}));
                    }
                }
                $form.hide().appendTo('body');
            }

            var activeFormData = $form.data('yiiActiveForm');
            if (activeFormData) {
                // remember who triggers the form submission. This is used by yii.activeForm.js
                activeFormData.submitObject = $e;
            }

            // temporarily add hidden inputs according to data-params
            if (params && $.isPlainObject(params)) {
                $.each(params, function (idx, obj) {
                    $form.append($('<input/>').attr({name: idx, value: obj, type: 'hidden'}));
                });
            }

            var oldMethod = $form.attr('method');
            $form.attr('method', method);
            var oldAction = null;
            if (action && action != '#') {
                oldAction = $form.attr('action');
                $form.attr('action', action);
            }
            if (pjax !== undefined && $.support.pjax) {
                $form.on('submit',function(e){
                    $.pjax.submit(e, pjaxOptions);
                })
            }
            $form.trigger('submit');
            $.when($form.data('yiiSubmitFinalizePromise')).then(
                function () {
                    if (oldAction != null) {
                        $form.attr('action', oldAction);
                    }
                    $form.attr('method', oldMethod);

                    // remove the temporarily added hidden inputs
                    if (params && $.isPlainObject(params)) {
                        $.each(params, function (idx, obj) {
                            $('input[name="' + idx + '"]', $form).remove();
                        });
                    }

                    if (newForm) {
                        $form.remove();
                    }
                }
            );
        },

        getQueryParams: function (url) {
            var pos = url.indexOf('?');
            if (pos < 0) {
                return {};
            }

            var pairs = url.substring(pos + 1).split('#')[0].split('&'),
                params = {},
                pair,
                i;

            for (i = 0; i < pairs.length; i++) {
                pair = pairs[i].split('=');
                var name = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1]);
                if (name.length) {
                    if (params[name] !== undefined) {
                        if (!$.isArray(params[name])) {
                            params[name] = [params[name]];
                        }
                        params[name].push(value || '');
                    } else {
                        params[name] = value || '';
                    }
                }
            }
            return params;
        },

        initModule: function (module) {
            if (module.isActive === undefined || module.isActive) {
                if ($.isFunction(module.init)) {
                    module.init();
                }
                $.each(module, function () {
                    if ($.isPlainObject(this)) {
                        pub.initModule(this);
                    }
                });
            }
        },

        init: function () {
            initCsrfHandler();
            initRedirectHandler();
            initScriptFilter();
            initDataMethods();
        }
    };

    function initRedirectHandler() {
        // handle AJAX redirection
        $(document).ajaxComplete(function (event, xhr, settings) {
            var url = xhr && xhr.getResponseHeader('X-Redirect');
            if (url) {
                window.location = url;
            }
        });
    }

    function initCsrfHandler() {
        // automatically send CSRF token for all AJAX requests
        $.ajaxPrefilter(function (options, originalOptions, xhr) {
            if (!options.crossDomain && pub.getCsrfParam()) {
                xhr.setRequestHeader('X-CSRF-Token', pub.getCsrfToken());
            }
        });
        pub.refreshCsrfToken();
    }

    function initDataMethods() {
        var handler = function (event) {
            var $this = $(this),
                method = $this.data('method'),
                message = $this.data('confirm'),
                form = $this.data('form');

            if (method === undefined && message === undefined && form === undefined) {
                return true;
            }

            if (message !== undefined) {
                $.proxy(pub.confirm, this)(message, function () {
                    pub.handleAction($this, event);
                });
            } else {
                pub.handleAction($this, event);
            }
            event.stopImmediatePropagation();
            return false;
        };

        // handle data-confirm and data-method for clickable and changeable elements
        $(document).on('click.yii', pub.clickableSelector, handler)
            .on('change.yii', pub.changeableSelector, handler);
    }

    function initScriptFilter() {
        var hostInfo = location.protocol + '//' + location.host;

        var loadedScripts = $('script[src]').map(function () {
            return this.src.charAt(0) === '/' ? hostInfo + this.src : this.src;
        }).toArray();

        $.ajaxPrefilter('script', function (options, originalOptions, xhr) {
            if (options.dataType == 'jsonp') {
                return;
            }

            var url = options.url.charAt(0) === '/' ? hostInfo + options.url : options.url;
            if ($.inArray(url, loadedScripts) === -1) {
                loadedScripts.push(url);
            } else {
                var isReloadable = $.inArray(url, $.map(pub.reloadableScripts, function (script) {
                        return script.charAt(0) === '/' ? hostInfo + script : script;
                    })) !== -1;
                if (!isReloadable) {
                    xhr.abort();
                }
            }
        });

        $(document).ajaxComplete(function (event, xhr, settings) {
            var styleSheets = [];
            $('link[rel=stylesheet]').each(function () {
                if ($.inArray(this.href, pub.reloadableScripts) !== -1) {
                    return;
                }
                if ($.inArray(this.href, styleSheets) == -1) {
                    styleSheets.push(this.href)
                } else {
                    $(this).remove();
                }
            })
        });
    }

    return pub;
})(jQuery);

jQuery(function () {
    yii.initModule(yii);
});


/**
 * Yii validation module.
 *
 * This JavaScript module provides the validation methods for the built-in validators.
 *
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */

yii.validation = (function ($) {
    var pub = {
        isEmpty: function (value) {
            return value === null || value === undefined || value == [] || value === '';
        },

        addMessage: function (messages, message, value) {
            messages.push(message.replace(/\{value\}/g, value));
        },

        required: function (value, messages, options) {
            var valid = false;
            if (options.requiredValue === undefined) {
                var isString = typeof value == 'string' || value instanceof String;
                if (options.strict && value !== undefined || !options.strict && !pub.isEmpty(isString ? $.trim(value) : value)) {
                    valid = true;
                }
            } else if (!options.strict && value == options.requiredValue || options.strict && value === options.requiredValue) {
                valid = true;
            }

            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },

        'boolean': function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var valid = !options.strict && (value == options.trueValue || value == options.falseValue)
                || options.strict && (value === options.trueValue || value === options.falseValue);

            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },

        string: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            if (typeof value !== 'string') {
                pub.addMessage(messages, options.message, value);
                return;
            }

            if (options.min !== undefined && value.length < options.min) {
                pub.addMessage(messages, options.tooShort, value);
            }
            if (options.max !== undefined && value.length > options.max) {
                pub.addMessage(messages, options.tooLong, value);
            }
            if (options.is !== undefined && value.length != options.is) {
                pub.addMessage(messages, options.notEqual, value);
            }
        },

        file: function (attribute, messages, options) {
            var files = getUploadedFiles(attribute, messages, options);
            $.each(files, function (i, file) {
                validateFile(file, messages, options);
            });
        },

        image: function (attribute, messages, options, deferred) {
            var files = getUploadedFiles(attribute, messages, options);

            $.each(files, function (i, file) {
                validateFile(file, messages, options);

                // Skip image validation if FileReader API is not available
                if (typeof FileReader === "undefined") {
                    return;
                }

                var def = $.Deferred(),
                    fr = new FileReader(),
                    img = new Image();

                img.onload = function () {
                    if (options.minWidth && this.width < options.minWidth) {
                        messages.push(options.underWidth.replace(/\{file\}/g, file.name));
                    }

                    if (options.maxWidth && this.width > options.maxWidth) {
                        messages.push(options.overWidth.replace(/\{file\}/g, file.name));
                    }

                    if (options.minHeight && this.height < options.minHeight) {
                        messages.push(options.underHeight.replace(/\{file\}/g, file.name));
                    }

                    if (options.maxHeight && this.height > options.maxHeight) {
                        messages.push(options.overHeight.replace(/\{file\}/g, file.name));
                    }
                    def.resolve();
                };

                img.onerror = function () {
                    messages.push(options.notImage.replace(/\{file\}/g, file.name));
                    def.resolve();
                };

                fr.onload = function () {
                    img.src = fr.result;
                };

                // Resolve deferred if there was error while reading data
                fr.onerror = function () {
                    def.resolve();
                };

                fr.readAsDataURL(file);

                deferred.push(def);
            });

        },

        number: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            if (typeof value === 'string' && !value.match(options.pattern)) {
                pub.addMessage(messages, options.message, value);
                return;
            }

            if (options.min !== undefined && value < options.min) {
                pub.addMessage(messages, options.tooSmall, value);
            }
            if (options.max !== undefined && value > options.max) {
                pub.addMessage(messages, options.tooBig, value);
            }
        },

        range: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            if (!options.allowArray && $.isArray(value)) {
                pub.addMessage(messages, options.message, value);
                return;
            }

            var inArray = true;

            $.each($.isArray(value) ? value : [value], function (i, v) {
                if ($.inArray(v, options.range) == -1) {
                    inArray = false;
                    return false;
                } else {
                    return true;
                }
            });

            if (options.not === inArray) {
                pub.addMessage(messages, options.message, value);
            }
        },

        regularExpression: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            if (!options.not && !value.match(options.pattern) || options.not && value.match(options.pattern)) {
                pub.addMessage(messages, options.message, value);
            }
        },

        email: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            var valid = true;


            var regexp = /^((?:"?([^"]*)"?\s)?)(?:\s+)?(?:(<?)((.+)@([^>]+))(>?))$/,
                matches = regexp.exec(value);

            if (matches === null) {
                valid = false
            } else {
                if (options.enableIDN) {
                    matches[5] = punycode.toASCII(matches[5]);
                    matches[6] = punycode.toASCII(matches[6]);

                    value = matches[1] + matches[3] + matches[5] + '@' + matches[6] + matches[7];
                }

                if (matches[5].length > 64) {
                    valid = false;
                } else if ((matches[5] + '@' + matches[6]).length > 254) {
                    valid = false;
                } else {
                    valid = value.match(options.pattern) || (options.allowName && value.match(options.fullPattern));
                }
            }

            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },

        url: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            if (options.defaultScheme && !value.match(/:\/\//)) {
                value = options.defaultScheme + '://' + value;
            }

            var valid = true;

            if (options.enableIDN) {
                var regexp = /^([^:]+):\/\/([^\/]+)(.*)$/,
                    matches = regexp.exec(value);
                if (matches === null) {
                    valid = false;
                } else {
                    value = matches[1] + '://' + punycode.toASCII(matches[2]) + matches[3];
                }
            }

            if (!valid || !value.match(options.pattern)) {
                pub.addMessage(messages, options.message, value);
            }
        },

        trim: function ($form, attribute, options) {
            var $input = $form.find(attribute.input);
            var value = $input.val();
            if (!options.skipOnEmpty || !pub.isEmpty(value)) {
                value = $.trim(value);
                $input.val(value);
            }
            return value;
        },

        captcha: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            // CAPTCHA may be updated via AJAX and the updated hash is stored in body data
            var hash = $('body').data(options.hashKey);
            if (hash == null) {
                hash = options.hash;
            } else {
                hash = hash[options.caseSensitive ? 0 : 1];
            }
            var v = options.caseSensitive ? value : value.toLowerCase();
            for (var i = v.length - 1, h = 0; i >= 0; --i) {
                h += v.charCodeAt(i);
            }
            if (h != hash) {
                pub.addMessage(messages, options.message, value);
            }
        },

        compare: function (value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            var compareValue, valid = true;
            if (options.compareAttribute === undefined) {
                compareValue = options.compareValue;
            } else {
                compareValue = $('#' + options.compareAttribute).val();
            }

            if (options.type === 'number') {
                value = parseFloat(value);
                compareValue = parseFloat(compareValue);
            }
            switch (options.operator) {
                case '==':
                    valid = value == compareValue;
                    break;
                case '===':
                    valid = value === compareValue;
                    break;
                case '!=':
                    valid = value != compareValue;
                    break;
                case '!==':
                    valid = value !== compareValue;
                    break;
                case '>':
                    valid = value > compareValue;
                    break;
                case '>=':
                    valid = value >= compareValue;
                    break;
                case '<':
                    valid = value < compareValue;
                    break;
                case '<=':
                    valid = value <= compareValue;
                    break;
                default:
                    valid = false;
                    break;
            }

            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },

        ip: function (value, messages, options) {
            var getIpVersion = function (value) {
                return value.indexOf(':') === -1 ? 4 : 6;
            };

            var negation = null, cidr = null;

            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }

            var matches = new RegExp(options.ipParsePattern).exec(value);
            if (matches) {
                negation = matches[1] || null;
                value = matches[2];
                cidr = matches[4] || null;
            }

            if (options.subnet === true && cidr === null) {
                pub.addMessage(messages, options.messages.noSubnet, value);
                return;
            }
            if (options.subnet === false && cidr !== null) {
                pub.addMessage(messages, options.messages.hasSubnet, value);
                return;
            }
            if (options.negation === false && negation !== null) {
                pub.addMessage(messages, options.messages.message, value);
                return;
            }

            if (getIpVersion(value) == 6) {
                if (!options.ipv6) {
                    pub.addMessage(messages, options.messages.ipv6NotAllowed, value);
                }
                if (!(new RegExp(options.ipv6Pattern)).test(value)) {
                    pub.addMessage(messages, options.messages.message, value);
                }
            } else {
                if (!options.ipv4) {
                    pub.addMessage(messages, options.messages.ipv4NotAllowed, value);
                }
                if (!(new RegExp(options.ipv4Pattern)).test(value)) {
                    pub.addMessage(messages, options.messages.message, value);
                }
            }
        }
    };

    function getUploadedFiles(attribute, messages, options) {
        // Skip validation if File API is not available
        if (typeof File === "undefined") {
            return [];
        }

        var files = $(attribute.input).get(0).files;
        if (!files) {
            messages.push(options.message);
            return [];
        }

        if (files.length === 0) {
            if (!options.skipOnEmpty) {
                messages.push(options.uploadRequired);
            }
            return [];
        }

        if (options.maxFiles && options.maxFiles < files.length) {
            messages.push(options.tooMany);
            return [];
        }

        return files;
    }

    function validateFile(file, messages, options) {
        if (options.extensions && options.extensions.length > 0) {
            var index, ext;

            index = file.name.lastIndexOf('.');

            if (!~index) {
                ext = '';
            } else {
                ext = file.name.substr(index + 1, file.name.length).toLowerCase();
            }

            if (!~options.extensions.indexOf(ext)) {
                messages.push(options.wrongExtension.replace(/\{file\}/g, file.name));
            }
        }

        if (options.mimeTypes && options.mimeTypes.length > 0) {
            if (!validateMimeType(options.mimeTypes, file.type)) {
                messages.push(options.wrongMimeType.replace(/\{file\}/g, file.name));
            }
        }

        if (options.maxSize && options.maxSize < file.size) {
            messages.push(options.tooBig.replace(/\{file\}/g, file.name));
        }

        if (options.minSize && options.minSize > file.size) {
            messages.push(options.tooSmall.replace(/\{file\}/g, file.name));
        }
    }

    function validateMimeType(mimeTypes, fileType) {
        for (var i = 0, len = mimeTypes.length; i < len; i++) {
            if (new RegExp(mimeTypes[i]).test(fileType)) {
                return true;
            }
        }

        return false;
    }

    return pub;
})(jQuery);

/**
 * Yii form widget.
 *
 * This is the JavaScript widget used by the yii\widgets\ActiveForm widget.
 *
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
(function ($) {

    $.fn.yiiActiveForm = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.yiiActiveForm');
            return false;
        }
    };

    var events = {
        /**
         * beforeValidate event is triggered before validating the whole form.
         * The signature of the event handler should be:
         *     function (event, messages, deferreds)
         * where
         *  - event: an Event object.
         *  - messages: an associative array with keys being attribute IDs and values being error message arrays
         *    for the corresponding attributes.
         *  - deferreds: an array of Deferred objects. You can use deferreds.add(callback) to add a new deferred validation.
         *
         * If the handler returns a boolean false, it will stop further form validation after this event. And as
         * a result, afterValidate event will not be triggered.
         */
        beforeValidate: 'beforeValidate',
        /**
         * afterValidate event is triggered after validating the whole form.
         * The signature of the event handler should be:
         *     function (event, messages, errorAttributes)
         * where
         *  - event: an Event object.
         *  - messages: an associative array with keys being attribute IDs and values being error message arrays
         *    for the corresponding attributes.
         *  - errorAttributes: an array of attributes that have validation errors. Please refer to attributeDefaults for the structure of this parameter.
         */
        afterValidate: 'afterValidate',
        /**
         * beforeValidateAttribute event is triggered before validating an attribute.
         * The signature of the event handler should be:
         *     function (event, attribute, messages, deferreds)
         * where
         *  - event: an Event object.
         *  - attribute: the attribute to be validated. Please refer to attributeDefaults for the structure of this parameter.
         *  - messages: an array to which you can add validation error messages for the specified attribute.
         *  - deferreds: an array of Deferred objects. You can use deferreds.add(callback) to add a new deferred validation.
         *
         * If the handler returns a boolean false, it will stop further validation of the specified attribute.
         * And as a result, afterValidateAttribute event will not be triggered.
         */
        beforeValidateAttribute: 'beforeValidateAttribute',
        /**
         * afterValidateAttribute event is triggered after validating the whole form and each attribute.
         * The signature of the event handler should be:
         *     function (event, attribute, messages)
         * where
         *  - event: an Event object.
         *  - attribute: the attribute being validated. Please refer to attributeDefaults for the structure of this parameter.
         *  - messages: an array to which you can add additional validation error messages for the specified attribute.
         */
        afterValidateAttribute: 'afterValidateAttribute',
        /**
         * beforeSubmit event is triggered before submitting the form after all validations have passed.
         * The signature of the event handler should be:
         *     function (event)
         * where event is an Event object.
         *
         * If the handler returns a boolean false, it will stop form submission.
         */
        beforeSubmit: 'beforeSubmit',
        /**
         * ajaxBeforeSend event is triggered before sending an AJAX request for AJAX-based validation.
         * The signature of the event handler should be:
         *     function (event, jqXHR, settings)
         * where
         *  - event: an Event object.
         *  - jqXHR: a jqXHR object
         *  - settings: the settings for the AJAX request
         */
        ajaxBeforeSend: 'ajaxBeforeSend',
        /**
         * ajaxComplete event is triggered after completing an AJAX request for AJAX-based validation.
         * The signature of the event handler should be:
         *     function (event, jqXHR, textStatus)
         * where
         *  - event: an Event object.
         *  - jqXHR: a jqXHR object
         *  - textStatus: the status of the request ("success", "notmodified", "error", "timeout", "abort", or "parsererror").
         */
        ajaxComplete: 'ajaxComplete'
    };

    // NOTE: If you change any of these defaults, make sure you update yii\widgets\ActiveForm::getClientOptions() as well
    var defaults = {
        // whether to encode the error summary
        encodeErrorSummary: true,
        // the jQuery selector for the error summary
        errorSummary: '.error-summary',
        // whether to perform validation before submitting the form.
        validateOnSubmit: true,
        // the container CSS class representing the corresponding attribute has validation error
        errorCssClass: 'has-error',
        // the container CSS class representing the corresponding attribute passes validation
        successCssClass: 'has-success',
        // the container CSS class representing the corresponding attribute is being validated
        validatingCssClass: 'validating',
        // the GET parameter name indicating an AJAX-based validation
        ajaxParam: 'ajax',
        // the type of data that you're expecting back from the server
        ajaxDataType: 'json',
        // the URL for performing AJAX-based validation. If not set, it will use the the form's action
        validationUrl: undefined,
        // whether to scroll to first visible error after validation.
        scrollToError: true
    };

    // NOTE: If you change any of these defaults, make sure you update yii\widgets\ActiveField::getClientOptions() as well
    var attributeDefaults = {
        // a unique ID identifying an attribute (e.g. "loginform-username") in a form
        id: undefined,
        // attribute name or expression (e.g. "[0]content" for tabular input)
        name: undefined,
        // the jQuery selector of the container of the input field
        container: undefined,
        // the jQuery selector of the input field under the context of the form
        input: undefined,
        // the jQuery selector of the error tag under the context of the container
        error: '.help-block',
        // whether to encode the error
        encodeError: true,
        // whether to perform validation when a change is detected on the input
        validateOnChange: true,
        // whether to perform validation when the input loses focus
        validateOnBlur: true,
        // whether to perform validation when the user is typing.
        validateOnType: false,
        // number of milliseconds that the validation should be delayed when a user is typing in the input field.
        validationDelay: 500,
        // whether to enable AJAX-based validation.
        enableAjaxValidation: false,
        // function (attribute, value, messages, deferred, $form), the client-side validation function.
        validate: undefined,
        // status of the input field, 0: empty, not entered before, 1: validated, 2: pending validation, 3: validating
        status: 0,
        // whether the validation is cancelled by beforeValidateAttribute event handler
        cancelled: false,
        // the value of the input
        value: undefined
    };


    var submitDefer;

    var setSubmitFinalizeDefer = function($form) {
        submitDefer = $.Deferred();
        $form.data('yiiSubmitFinalizePromise', submitDefer.promise());
    };

    // finalize yii.js $form.submit
    var submitFinalize = function($form) {
        if(submitDefer) {
            submitDefer.resolve();
            submitDefer = undefined;
            $form.removeData('yiiSubmitFinalizePromise');
        }
    };


    var methods = {
        init: function (attributes, options) {
            return this.each(function () {
                var $form = $(this);
                if ($form.data('yiiActiveForm')) {
                    return;
                }

                var settings = $.extend({}, defaults, options || {});
                if (settings.validationUrl === undefined) {
                    settings.validationUrl = $form.attr('action');
                }

                $.each(attributes, function (i) {
                    attributes[i] = $.extend({value: getValue($form, this)}, attributeDefaults, this);
                    watchAttribute($form, attributes[i]);
                });

                $form.data('yiiActiveForm', {
                    settings: settings,
                    attributes: attributes,
                    submitting: false,
                    validated: false,
                    target: $form.attr('target')
                });

                /**
                 * Clean up error status when the form is reset.
                 * Note that $form.on('reset', ...) does work because the "reset" event does not bubble on IE.
                 */
                $form.bind('reset.yiiActiveForm', methods.resetForm);

                if (settings.validateOnSubmit) {
                    $form.on('mouseup.yiiActiveForm keyup.yiiActiveForm', ':submit', function () {
                        $form.data('yiiActiveForm').submitObject = $(this);
                    });
                    $form.on('submit.yiiActiveForm', methods.submitForm);
                }
            });
        },

        // add a new attribute to the form dynamically.
        // please refer to attributeDefaults for the structure of attribute
        add: function (attribute) {
            var $form = $(this);
            attribute = $.extend({value: getValue($form, attribute)}, attributeDefaults, attribute);
            $form.data('yiiActiveForm').attributes.push(attribute);
            watchAttribute($form, attribute);
        },

        // remove the attribute with the specified ID from the form
        remove: function (id) {
            var $form = $(this),
                attributes = $form.data('yiiActiveForm').attributes,
                index = -1,
                attribute = undefined;
            $.each(attributes, function (i) {
                if (attributes[i]['id'] == id) {
                    index = i;
                    attribute = attributes[i];
                    return false;
                }
            });
            if (index >= 0) {
                attributes.splice(index, 1);
                unwatchAttribute($form, attribute);
            }
            return attribute;
        },

        // manually trigger the validation of the attribute with the specified ID
        validateAttribute: function (id) {
            var attribute = methods.find.call(this, id);
            if (attribute != undefined) {
                validateAttribute($(this), attribute, true);
            }
        },

        // find an attribute config based on the specified attribute ID
        find: function (id) {
            var attributes = $(this).data('yiiActiveForm').attributes,
                result = undefined;
            $.each(attributes, function (i) {
                if (attributes[i]['id'] == id) {
                    result = attributes[i];
                    return false;
                }
            });
            return result;
        },

        destroy: function () {
            return this.each(function () {
                $(this).unbind('.yiiActiveForm');
                $(this).removeData('yiiActiveForm');
            });
        },

        data: function () {
            return this.data('yiiActiveForm');
        },

        // validate all applicable inputs in the form
        validate: function () {
            var $form = $(this),
                data = $form.data('yiiActiveForm'),
                needAjaxValidation = false,
                messages = {},
                deferreds = deferredArray(),
                submitting = data.submitting;

            var event = $.Event(events.beforeValidate);
            $form.trigger(event, [messages, deferreds]);
            if (submitting) {
                if (event.result === false) {
                    data.submitting = false;
                    submitFinalize($form);
                    return;
                }
            }

            // client-side validation
            $.each(data.attributes, function () {
                if (!$(this.input).is(":disabled")) {
                    this.cancelled = false;
                    // perform validation only if the form is being submitted or if an attribute is pending validation
                    if (data.submitting || this.status === 2 || this.status === 3) {
                        var msg = messages[this.id];
                        if (msg === undefined) {
                            msg = [];
                            messages[this.id] = msg;
                        }
                        var event = $.Event(events.beforeValidateAttribute);
                        $form.trigger(event, [this, msg, deferreds]);
                        if (event.result !== false) {
                            if (this.validate) {
                                this.validate(this, getValue($form, this), msg, deferreds, $form);
                            }
                            if (this.enableAjaxValidation) {
                                needAjaxValidation = true;
                            }
                        } else {
                            this.cancelled = true;
                        }
                    }
                }
            });

            // ajax validation
            $.when.apply(this, deferreds).always(function() {
                // Remove empty message arrays
                for (var i in messages) {
                    if (0 === messages[i].length) {
                        delete messages[i];
                    }
                }
                if ($.isEmptyObject(messages) && needAjaxValidation) {
                    var $button = data.submitObject,
                        extData = '&' + data.settings.ajaxParam + '=' + $form.attr('id');
                    if ($button && $button.length && $button.attr('name')) {
                        extData += '&' + $button.attr('name') + '=' + $button.attr('value');
                    }
                    $.ajax({
                        url: data.settings.validationUrl,
                        type: $form.attr('method'),
                        data: $form.serialize() + extData,
                        dataType: data.settings.ajaxDataType,
                        complete: function (jqXHR, textStatus) {
                            $form.trigger(events.ajaxComplete, [jqXHR, textStatus]);
                        },
                        beforeSend: function (jqXHR, settings) {
                            $form.trigger(events.ajaxBeforeSend, [jqXHR, settings]);
                        },
                        success: function (msgs) {
                            if (msgs !== null && typeof msgs === 'object') {
                                $.each(data.attributes, function () {
                                    if (!this.enableAjaxValidation || this.cancelled) {
                                        delete msgs[this.id];
                                    }
                                });
                                updateInputs($form, $.extend(messages, msgs), submitting);
                            } else {
                                updateInputs($form, messages, submitting);
                            }
                        },
                        error: function () {
                            data.submitting = false;
                            submitFinalize($form);
                        }
                    });
                } else if (data.submitting) {
                    // delay callback so that the form can be submitted without problem
                    setTimeout(function () {
                        updateInputs($form, messages, submitting);
                    }, 200);
                } else {
                    updateInputs($form, messages, submitting);
                }
            });
        },

        submitForm: function () {
            var $form = $(this),
                data = $form.data('yiiActiveForm');

            if (data.validated) {
                // Second submit's call (from validate/updateInputs)
                data.submitting = false;
                var event = $.Event(events.beforeSubmit);
                $form.trigger(event);
                if (event.result === false) {
                    data.validated = false;
                    submitFinalize($form);
                    return false;
                }
                updateHiddenButton($form);
                return true;   // continue submitting the form since validation passes
            } else {
                // First submit's call (from yii.js/handleAction) - execute validating
                setSubmitFinalizeDefer($form);

                if (data.settings.timer !== undefined) {
                    clearTimeout(data.settings.timer);
                }
                data.submitting = true;
                methods.validate.call($form);
                return false;
            }
        },

        resetForm: function () {
            var $form = $(this);
            var data = $form.data('yiiActiveForm');
            // Because we bind directly to a form reset event instead of a reset button (that may not exist),
            // when this function is executed form input values have not been reset yet.
            // Therefore we do the actual reset work through setTimeout.
            setTimeout(function () {
                $.each(data.attributes, function () {
                    // Without setTimeout() we would get the input values that are not reset yet.
                    this.value = getValue($form, this);
                    this.status = 0;
                    var $container = $form.find(this.container);
                    $container.removeClass(
                        data.settings.validatingCssClass + ' ' +
                            data.settings.errorCssClass + ' ' +
                            data.settings.successCssClass
                    );
                    $container.find(this.error).html('');
                });
                $form.find(data.settings.errorSummary).hide().find('ul').html('');
            }, 1);
        },

        /**
         * Updates error messages, input containers, and optionally summary as well.
         * If an attribute is missing from messages, it is considered valid.
         * @param messages array the validation error messages, indexed by attribute IDs
         * @param summary whether to update summary as well.
         */
        updateMessages: function (messages, summary) {
            var $form = $(this);
            var data = $form.data('yiiActiveForm');
            $.each(data.attributes, function () {
                updateInput($form, this, messages);
            });
            if (summary) {
                updateSummary($form, messages);
            }
        },

        /**
         * Updates error messages and input container of a single attribute.
         * If messages is empty, the attribute is considered valid.
         * @param id attribute ID
         * @param messages array with error messages
         */
        updateAttribute: function(id, messages) {
            var attribute = methods.find.call(this, id);
            if (attribute != undefined) {
                var msg = {};
                msg[id] = messages;
                updateInput($(this), attribute, msg);
            }
        }

    };

    var watchAttribute = function ($form, attribute) {
        var $input = findInput($form, attribute);
        if (attribute.validateOnChange) {
            $input.on('change.yiiActiveForm', function () {
                validateAttribute($form, attribute, false);
            });
        }
        if (attribute.validateOnBlur) {
            $input.on('blur.yiiActiveForm', function () {
                if (attribute.status == 0 || attribute.status == 1) {
                    validateAttribute($form, attribute, true);
                }
            });
        }
        if (attribute.validateOnType) {
            $input.on('keyup.yiiActiveForm', function (e) {
                if ($.inArray(e.which, [16, 17, 18, 37, 38, 39, 40]) !== -1 ) {
                    return;
                }
                if (attribute.value !== getValue($form, attribute)) {
                    validateAttribute($form, attribute, false, attribute.validationDelay);
                }
            });
        }
    };

    var unwatchAttribute = function ($form, attribute) {
        findInput($form, attribute).off('.yiiActiveForm');
    };

    var validateAttribute = function ($form, attribute, forceValidate, validationDelay) {
        var data = $form.data('yiiActiveForm');

        if (forceValidate) {
            attribute.status = 2;
        }
        $.each(data.attributes, function () {
            if (this.value !== getValue($form, this)) {
                this.status = 2;
                forceValidate = true;
            }
        });
        if (!forceValidate) {
            return;
        }

        if (data.settings.timer !== undefined) {
            clearTimeout(data.settings.timer);
        }
        data.settings.timer = setTimeout(function () {
            if (data.submitting || $form.is(':hidden')) {
                return;
            }
            $.each(data.attributes, function () {
                if (this.status === 2) {
                    this.status = 3;
                    $form.find(this.container).addClass(data.settings.validatingCssClass);
                }
            });
            methods.validate.call($form);
        }, validationDelay ? validationDelay : 200);
    };

    /**
     * Returns an array prototype with a shortcut method for adding a new deferred.
     * The context of the callback will be the deferred object so it can be resolved like ```this.resolve()```
     * @returns Array
     */
    var deferredArray = function () {
        var array = [];
        array.add = function(callback) {
            this.push(new $.Deferred(callback));
        };
        return array;
    };

    /**
     * Updates the error messages and the input containers for all applicable attributes
     * @param $form the form jQuery object
     * @param messages array the validation error messages
     * @param submitting whether this method is called after validation triggered by form submission
     */
    var updateInputs = function ($form, messages, submitting) {
        var data = $form.data('yiiActiveForm');

        if (submitting) {
            var errorAttributes = [];
            $.each(data.attributes, function () {
                if (!$(this.input).is(":disabled") && !this.cancelled && updateInput($form, this, messages)) {
                    errorAttributes.push(this);
                }
            });

            $form.trigger(events.afterValidate, [messages, errorAttributes]);

            updateSummary($form, messages);

            if (errorAttributes.length) {
                if (data.settings.scrollToError) {
                    var top = $form.find($.map(errorAttributes, function(attribute) {
                        return attribute.input;
                    }).join(',')).first().closest(':visible').offset().top;
                    var wtop = $(window).scrollTop();
                    if (top < wtop || top > wtop + $(window).height()) {
                        $(window).scrollTop(top);
                    }
                }
                data.submitting = false;
            } else {
                data.validated = true;
                var buttonTarget = data.submitObject ? data.submitObject.attr('formtarget') : null;
                if (buttonTarget) {
                    // set target attribute to form tag before submit
                    $form.attr('target', buttonTarget);
                }
                $form.submit();
                // restore original target attribute value
                $form.attr('target', data.target);
            }
        } else {
            $.each(data.attributes, function () {
                if (!this.cancelled && (this.status === 2 || this.status === 3)) {
                    updateInput($form, this, messages);
                }
            });
        }
        submitFinalize($form);
    };

    /**
     * Updates hidden field that represents clicked submit button.
     * @param $form the form jQuery object.
     */
    var updateHiddenButton = function ($form) {
        var data = $form.data('yiiActiveForm');
        var $button = data.submitObject || $form.find(':submit:first');
        // TODO: if the submission is caused by "change" event, it will not work
        if ($button.length && $button.attr('type') == 'submit' && $button.attr('name')) {
            // simulate button input value
            var $hiddenButton = $('input[type="hidden"][name="' + $button.attr('name') + '"]', $form);
            if (!$hiddenButton.length) {
                $('<input>').attr({
                    type: 'hidden',
                    name: $button.attr('name'),
                    value: $button.attr('value')
                }).appendTo($form);
            } else {
                $hiddenButton.attr('value', $button.attr('value'));
            }
        }
    };

    /**
     * Updates the error message and the input container for a particular attribute.
     * @param $form the form jQuery object
     * @param attribute object the configuration for a particular attribute.
     * @param messages array the validation error messages
     * @return boolean whether there is a validation error for the specified attribute
     */
    var updateInput = function ($form, attribute, messages) {
        var data = $form.data('yiiActiveForm'),
            $input = findInput($form, attribute),
            hasError = false;

        if (!$.isArray(messages[attribute.id])) {
            messages[attribute.id] = [];
        }
        $form.trigger(events.afterValidateAttribute, [attribute, messages[attribute.id]]);

        attribute.status = 1;
        if ($input.length) {
            hasError = messages[attribute.id].length > 0;
            var $container = $form.find(attribute.container);
            var $error = $container.find(attribute.error);
            if (hasError) {
                if (attribute.encodeError) {
                    $error.text(messages[attribute.id][0]);
                } else {
                    $error.html(messages[attribute.id][0]);
                }
                $container.removeClass(data.settings.validatingCssClass + ' ' + data.settings.successCssClass)
                    .addClass(data.settings.errorCssClass);
            } else {
                $error.empty();
                $container.removeClass(data.settings.validatingCssClass + ' ' + data.settings.errorCssClass + ' ')
                    .addClass(data.settings.successCssClass);
            }
            attribute.value = getValue($form, attribute);
        }
        return hasError;
    };

    /**
     * Updates the error summary.
     * @param $form the form jQuery object
     * @param messages array the validation error messages
     */
    var updateSummary = function ($form, messages) {
        var data = $form.data('yiiActiveForm'),
            $summary = $form.find(data.settings.errorSummary),
            $ul = $summary.find('ul').empty();

        if ($summary.length && messages) {
            $.each(data.attributes, function () {
                if ($.isArray(messages[this.id]) && messages[this.id].length) {
                    var error = $('<li/>');
                    if (data.settings.encodeErrorSummary) {
                        error.text(messages[this.id][0]);
                    } else {
                        error.html(messages[this.id][0]);
                    }
                    $ul.append(error);
                }
            });
            $summary.toggle($ul.find('li').length > 0);
        }
    };

    var getValue = function ($form, attribute) {
        var $input = findInput($form, attribute);
        var type = $input.attr('type');
        if (type === 'checkbox' || type === 'radio') {
            var $realInput = $input.filter(':checked');
            if (!$realInput.length) {
                $realInput = $form.find('input[type=hidden][name="' + $input.attr('name') + '"]');
            }
            return $realInput.val();
        } else {
            return $input.val();
        }
    };

    var findInput = function ($form, attribute) {
        var $input = $form.find(attribute.input);
        if ($input.length && $input[0].tagName.toLowerCase() === 'div') {
            // checkbox list or radio list
            return $input.find('input');
        } else {
            return $input;
        }
    };

})(window.jQuery);

$(document).ready(function () {
    
    /* smooth scrolling for scroll to top */
    $('.scroll-top').click(function () {
        $('body,html').animate({scrollTop: 0}, 1000);
    })

    /* highlight the top nav as scrolling occurs */
    $('body').scrollspy({target: '#navbar'})

    window.onresize = function () {
        $("canvas").width($(window).width());
    };

    $(document).bind('touchmove', function () {
        $("canvas").css(
            "-webkit-transform",
            "translatey(-" + $(window).scrollTop() + "px)");
    });

    $(document).bind('touchend', function () {
        $("canvas").css(
            "-webkit-transform",
            "translatey(-" + $(window).scrollTop() + "px)");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInlpaS5qcyIsInlpaS52YWxpZGF0aW9uLmpzIiwieWlpLmFjdGl2ZUZvcm0uanMiLCJhcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFlpaSBKYXZhU2NyaXB0IG1vZHVsZS5cbiAqXG4gKiBAbGluayBodHRwOi8vd3d3LnlpaWZyYW1ld29yay5jb20vXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAwOCBZaWkgU29mdHdhcmUgTExDXG4gKiBAbGljZW5zZSBodHRwOi8vd3d3LnlpaWZyYW1ld29yay5jb20vbGljZW5zZS9cbiAqIEBhdXRob3IgUWlhbmcgWHVlIDxxaWFuZy54dWVAZ21haWwuY29tPlxuICogQHNpbmNlIDIuMFxuICovXG5cbi8qKlxuICogeWlpIGlzIHRoZSByb290IG1vZHVsZSBmb3IgYWxsIFlpaSBKYXZhU2NyaXB0IG1vZHVsZXMuXG4gKiBJdCBpbXBsZW1lbnRzIGEgbWVjaGFuaXNtIG9mIG9yZ2FuaXppbmcgSmF2YVNjcmlwdCBjb2RlIGluIG1vZHVsZXMgdGhyb3VnaCB0aGUgZnVuY3Rpb24gXCJ5aWkuaW5pdE1vZHVsZSgpXCIuXG4gKlxuICogRWFjaCBtb2R1bGUgc2hvdWxkIGJlIG5hbWVkIGFzIFwieC55LnpcIiwgd2hlcmUgXCJ4XCIgc3RhbmRzIGZvciB0aGUgcm9vdCBtb2R1bGUgKGZvciB0aGUgWWlpIGNvcmUgY29kZSwgdGhpcyBpcyBcInlpaVwiKS5cbiAqXG4gKiBBIG1vZHVsZSBtYXkgYmUgc3RydWN0dXJlZCBhcyBmb2xsb3dzOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHlpaS5zYW1wbGUgPSAoZnVuY3Rpb24oJCkge1xuICogICAgIHZhciBwdWIgPSB7XG4gKiAgICAgICAgIC8vIHdoZXRoZXIgdGhpcyBtb2R1bGUgaXMgY3VycmVudGx5IGFjdGl2ZS4gSWYgZmFsc2UsIGluaXQoKSB3aWxsIG5vdCBiZSBjYWxsZWQgZm9yIHRoaXMgbW9kdWxlXG4gKiAgICAgICAgIC8vIGl0IHdpbGwgYWxzbyBub3QgYmUgY2FsbGVkIGZvciBhbGwgaXRzIGNoaWxkIG1vZHVsZXMuIElmIHRoaXMgcHJvcGVydHkgaXMgdW5kZWZpbmVkLCBpdCBtZWFucyB0cnVlLlxuICogICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAqICAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAgICAgICAvLyAuLi4gbW9kdWxlIGluaXRpYWxpemF0aW9uIGNvZGUgZ28gaGVyZSAuLi5cbiAqICAgICAgICAgfSxcbiAqXG4gKiAgICAgICAgIC8vIC4uLiBvdGhlciBwdWJsaWMgZnVuY3Rpb25zIGFuZCBwcm9wZXJ0aWVzIGdvIGhlcmUgLi4uXG4gKiAgICAgfTtcbiAqXG4gKiAgICAgLy8gLi4uIHByaXZhdGUgZnVuY3Rpb25zIGFuZCBwcm9wZXJ0aWVzIGdvIGhlcmUgLi4uXG4gKlxuICogICAgIHJldHVybiBwdWI7XG4gKiB9KShqUXVlcnkpO1xuICogYGBgXG4gKlxuICogVXNpbmcgdGhpcyBzdHJ1Y3R1cmUsIHlvdSBjYW4gZGVmaW5lIHB1YmxpYyBhbmQgcHJpdmF0ZSBmdW5jdGlvbnMvcHJvcGVydGllcyBmb3IgYSBtb2R1bGUuXG4gKiBQcml2YXRlIGZ1bmN0aW9ucy9wcm9wZXJ0aWVzIGFyZSBvbmx5IHZpc2libGUgd2l0aGluIHRoZSBtb2R1bGUsIHdoaWxlIHB1YmxpYyBmdW5jdGlvbnMvcHJvcGVydGllc1xuICogbWF5IGJlIGFjY2Vzc2VkIG91dHNpZGUgb2YgdGhlIG1vZHVsZS4gRm9yIGV4YW1wbGUsIHlvdSBjYW4gYWNjZXNzIFwieWlpLnNhbXBsZS5pc0FjdGl2ZVwiLlxuICpcbiAqIFlvdSBtdXN0IGNhbGwgXCJ5aWkuaW5pdE1vZHVsZSgpXCIgb25jZSBmb3IgdGhlIHJvb3QgbW9kdWxlIG9mIGFsbCB5b3VyIG1vZHVsZXMuXG4gKi9cbnlpaSA9IChmdW5jdGlvbiAoJCkge1xuICAgIHZhciBwdWIgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0IG9mIEpTIG9yIENTUyBVUkxzIHRoYXQgY2FuIGJlIGxvYWRlZCBtdWx0aXBsZSB0aW1lcyB2aWEgQUpBWCByZXF1ZXN0cy4gRWFjaCBzY3JpcHQgY2FuIGJlIHJlcHJlc2VudGVkXG4gICAgICAgICAqIGFzIGVpdGhlciBhbiBhYnNvbHV0ZSBVUkwgb3IgYSByZWxhdGl2ZSBvbmUuXG4gICAgICAgICAqL1xuICAgICAgICByZWxvYWRhYmxlU2NyaXB0czogW10sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2VsZWN0b3IgZm9yIGNsaWNrYWJsZSBlbGVtZW50cyB0aGF0IG5lZWQgdG8gc3VwcG9ydCBjb25maXJtYXRpb24gYW5kIGZvcm0gc3VibWlzc2lvbi5cbiAgICAgICAgICovXG4gICAgICAgIGNsaWNrYWJsZVNlbGVjdG9yOiAnYSwgYnV0dG9uLCBpbnB1dFt0eXBlPVwic3VibWl0XCJdLCBpbnB1dFt0eXBlPVwiYnV0dG9uXCJdLCBpbnB1dFt0eXBlPVwicmVzZXRcIl0sIGlucHV0W3R5cGU9XCJpbWFnZVwiXScsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2VsZWN0b3IgZm9yIGNoYW5nZWFibGUgZWxlbWVudHMgdGhhdCBuZWVkIHRvIHN1cHBvcnQgY29uZmlybWF0aW9uIGFuZCBmb3JtIHN1Ym1pc3Npb24uXG4gICAgICAgICAqL1xuICAgICAgICBjaGFuZ2VhYmxlU2VsZWN0b3I6ICdzZWxlY3QsIGlucHV0LCB0ZXh0YXJlYScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4gc3RyaW5nfHVuZGVmaW5lZCB0aGUgQ1NSRiBwYXJhbWV0ZXIgbmFtZS4gVW5kZWZpbmVkIGlzIHJldHVybmVkIGlmIENTUkYgdmFsaWRhdGlvbiBpcyBub3QgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIGdldENzcmZQYXJhbTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICQoJ21ldGFbbmFtZT1jc3JmLXBhcmFtXScpLmF0dHIoJ2NvbnRlbnQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiBzdHJpbmd8dW5kZWZpbmVkIHRoZSBDU1JGIHRva2VuLiBVbmRlZmluZWQgaXMgcmV0dXJuZWQgaWYgQ1NSRiB2YWxpZGF0aW9uIGlzIG5vdCBlbmFibGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q3NyZlRva2VuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJCgnbWV0YVtuYW1lPWNzcmYtdG9rZW5dJykuYXR0cignY29udGVudCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXRzIHRoZSBDU1JGIHRva2VuIGluIHRoZSBtZXRhIGVsZW1lbnRzLlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCBpcyBwcm92aWRlZCBzbyB0aGF0IHlvdSBjYW4gdXBkYXRlIHRoZSBDU1JGIHRva2VuIHdpdGggdGhlIGxhdGVzdCBvbmUgeW91IG9idGFpbiBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAqIEBwYXJhbSBuYW1lIHRoZSBDU1JGIHRva2VuIG5hbWVcbiAgICAgICAgICogQHBhcmFtIHZhbHVlIHRoZSBDU1JGIHRva2VuIHZhbHVlXG4gICAgICAgICAqL1xuICAgICAgICBzZXRDc3JmVG9rZW46IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgJCgnbWV0YVtuYW1lPWNzcmYtcGFyYW1dJykuYXR0cignY29udGVudCcsIG5hbWUpO1xuICAgICAgICAgICAgJCgnbWV0YVtuYW1lPWNzcmYtdG9rZW5dJykuYXR0cignY29udGVudCcsIHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlcyBhbGwgZm9ybSBDU1JGIGlucHV0IGZpZWxkcyB3aXRoIHRoZSBsYXRlc3QgQ1NSRiB0b2tlbi5cbiAgICAgICAgICogVGhpcyBtZXRob2QgaXMgcHJvdmlkZWQgdG8gYXZvaWQgY2FjaGVkIGZvcm1zIGNvbnRhaW5pbmcgb3V0ZGF0ZWQgQ1NSRiB0b2tlbnMuXG4gICAgICAgICAqL1xuICAgICAgICByZWZyZXNoQ3NyZlRva2VuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSBwdWIuZ2V0Q3NyZlRva2VuKCk7XG4gICAgICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICAgICAgICAkKCdmb3JtIGlucHV0W25hbWU9XCInICsgcHViLmdldENzcmZQYXJhbSgpICsgJ1wiXScpLnZhbCh0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BsYXlzIGEgY29uZmlybWF0aW9uIGRpYWxvZy5cbiAgICAgICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gc2ltcGx5IGRpc3BsYXlzIGEganMgY29uZmlybWF0aW9uIGRpYWxvZy5cbiAgICAgICAgICogWW91IG1heSBvdmVycmlkZSB0aGlzIGJ5IHNldHRpbmcgYHlpaS5jb25maXJtYC5cbiAgICAgICAgICogQHBhcmFtIG1lc3NhZ2UgdGhlIGNvbmZpcm1hdGlvbiBtZXNzYWdlLlxuICAgICAgICAgKiBAcGFyYW0gb2sgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjb25maXJtcyB0aGUgbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0gY2FuY2VsIGEgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2FuY2VscyB0aGUgY29uZmlybWF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBjb25maXJtOiBmdW5jdGlvbiAobWVzc2FnZSwgb2ssIGNhbmNlbCkge1xuICAgICAgICAgICAgaWYgKGNvbmZpcm0obWVzc2FnZSkpIHtcbiAgICAgICAgICAgICAgICAhb2sgfHwgb2soKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgIWNhbmNlbCB8fCBjYW5jZWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlcyB0aGUgYWN0aW9uIHRyaWdnZXJlZCBieSB1c2VyLlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCByZWNvZ25pemVzIHRoZSBgZGF0YS1tZXRob2RgIGF0dHJpYnV0ZSBvZiB0aGUgZWxlbWVudC4gSWYgdGhlIGF0dHJpYnV0ZSBleGlzdHMsXG4gICAgICAgICAqIHRoZSBtZXRob2Qgd2lsbCBzdWJtaXQgdGhlIGZvcm0gY29udGFpbmluZyB0aGlzIGVsZW1lbnQuIElmIHRoZXJlIGlzIG5vIGNvbnRhaW5pbmcgZm9ybSwgYSBmb3JtXG4gICAgICAgICAqIHdpbGwgYmUgY3JlYXRlZCBhbmQgc3VibWl0dGVkIHVzaW5nIHRoZSBtZXRob2QgZ2l2ZW4gYnkgdGhpcyBhdHRyaWJ1dGUgdmFsdWUgKGUuZy4gXCJwb3N0XCIsIFwicHV0XCIpLlxuICAgICAgICAgKiBGb3IgaHlwZXJsaW5rcywgdGhlIGZvcm0gYWN0aW9uIHdpbGwgdGFrZSB0aGUgdmFsdWUgb2YgdGhlIFwiaHJlZlwiIGF0dHJpYnV0ZSBvZiB0aGUgbGluay5cbiAgICAgICAgICogRm9yIG90aGVyIGVsZW1lbnRzLCBlaXRoZXIgdGhlIGNvbnRhaW5pbmcgZm9ybSBhY3Rpb24gb3IgdGhlIGN1cnJlbnQgcGFnZSBVUkwgd2lsbCBiZSB1c2VkXG4gICAgICAgICAqIGFzIHRoZSBmb3JtIGFjdGlvbiBVUkwuXG4gICAgICAgICAqXG4gICAgICAgICAqIElmIHRoZSBgZGF0YS1tZXRob2RgIGF0dHJpYnV0ZSBpcyBub3QgZGVmaW5lZCwgdGhlIGBocmVmYCBhdHRyaWJ1dGUgKGlmIGFueSkgb2YgdGhlIGVsZW1lbnRcbiAgICAgICAgICogd2lsbCBiZSBhc3NpZ25lZCB0byBgd2luZG93LmxvY2F0aW9uYC5cbiAgICAgICAgICpcbiAgICAgICAgICogU3RhcnRpbmcgZnJvbSB2ZXJzaW9uIDIuMC4zLCB0aGUgYGRhdGEtcGFyYW1zYCBhdHRyaWJ1dGUgaXMgYWxzbyByZWNvZ25pemVkIHdoZW4geW91IHNwZWNpZnlcbiAgICAgICAgICogYGRhdGEtbWV0aG9kYC4gVGhlIHZhbHVlIG9mIGBkYXRhLXBhcmFtc2Agc2hvdWxkIGJlIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSAobmFtZS12YWx1ZSBwYWlycylcbiAgICAgICAgICogdGhhdCBzaG91bGQgYmUgc3VibWl0dGVkIGFzIGhpZGRlbiBpbnB1dHMuIEZvciBleGFtcGxlLCB5b3UgbWF5IHVzZSB0aGUgZm9sbG93aW5nIGNvZGUgdG8gZ2VuZXJhdGVcbiAgICAgICAgICogc3VjaCBhIGxpbms6XG4gICAgICAgICAqXG4gICAgICAgICAqIGBgYHBocFxuICAgICAgICAgKiB1c2UgeWlpXFxoZWxwZXJzXFxIdG1sO1xuICAgICAgICAgKiB1c2UgeWlpXFxoZWxwZXJzXFxKc29uO1xuICAgICAgICAgKlxuICAgICAgICAgKiBlY2hvIEh0bWw6OmEoJ3N1Ym1pdCcsIFsnc2l0ZS9mb29iYXInXSwgW1xuICAgICAgICAgKiAgICAgJ2RhdGEnID0+IFtcbiAgICAgICAgICogICAgICAgICAnbWV0aG9kJyA9PiAncG9zdCcsXG4gICAgICAgICAqICAgICAgICAgJ3BhcmFtcycgPT4gW1xuICAgICAgICAgKiAgICAgICAgICAgICAnbmFtZTEnID0+ICd2YWx1ZTEnLFxuICAgICAgICAgKiAgICAgICAgICAgICAnbmFtZTInID0+ICd2YWx1ZTInLFxuICAgICAgICAgKiAgICAgICAgIF0sXG4gICAgICAgICAqICAgICBdLFxuICAgICAgICAgKiBdO1xuICAgICAgICAgKiBgYGBcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtICRlIHRoZSBqUXVlcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIGhhbmRsZUFjdGlvbjogZnVuY3Rpb24gKCRlLCBldmVudCkge1xuICAgICAgICAgICAgdmFyICRmb3JtID0gJGUuYXR0cignZGF0YS1mb3JtJykgPyAkKCcjJyArICRlLmF0dHIoJ2RhdGEtZm9ybScpKSA6ICRlLmNsb3Nlc3QoJ2Zvcm0nKSxcbiAgICAgICAgICAgICAgICBtZXRob2QgPSAhJGUuZGF0YSgnbWV0aG9kJykgJiYgJGZvcm0gPyAkZm9ybS5hdHRyKCdtZXRob2QnKSA6ICRlLmRhdGEoJ21ldGhvZCcpLFxuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICRlLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSAkZS5kYXRhKCdwYXJhbXMnKSxcbiAgICAgICAgICAgICAgICBwamF4ID0gJGUuZGF0YSgncGpheCcpLFxuICAgICAgICAgICAgICAgIHBqYXhQdXNoU3RhdGUgPSAhISRlLmRhdGEoJ3BqYXgtcHVzaC1zdGF0ZScpLFxuICAgICAgICAgICAgICAgIHBqYXhSZXBsYWNlU3RhdGUgPSAhISRlLmRhdGEoJ3BqYXgtcmVwbGFjZS1zdGF0ZScpLFxuICAgICAgICAgICAgICAgIHBqYXhUaW1lb3V0ID0gJGUuZGF0YSgncGpheC10aW1lb3V0JyksXG4gICAgICAgICAgICAgICAgcGpheFNjcm9sbFRvID0gJGUuZGF0YSgncGpheC1zY3JvbGx0bycpLFxuICAgICAgICAgICAgICAgIHBqYXhQdXNoUmVkaXJlY3QgPSAkZS5kYXRhKCdwamF4LXB1c2gtcmVkaXJlY3QnKSxcbiAgICAgICAgICAgICAgICBwamF4UmVwbGFjZVJlZGlyZWN0ID0gJGUuZGF0YSgncGpheC1yZXBsYWNlLXJlZGlyZWN0JyksXG4gICAgICAgICAgICAgICAgcGpheFNraXBPdXRlckNvbnRhaW5lcnMgPSAkZS5kYXRhKCdwamF4LXNraXAtb3V0ZXItY29udGFpbmVycycpLFxuICAgICAgICAgICAgICAgIHBqYXhDb250YWluZXIsXG4gICAgICAgICAgICAgICAgcGpheE9wdGlvbnMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKHBqYXggIT09IHVuZGVmaW5lZCAmJiAkLnN1cHBvcnQucGpheCkge1xuICAgICAgICAgICAgICAgIGlmICgkZS5kYXRhKCdwamF4LWNvbnRhaW5lcicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBqYXhDb250YWluZXIgPSAkZS5kYXRhKCdwamF4LWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBqYXhDb250YWluZXIgPSAkZS5jbG9zZXN0KCdbZGF0YS1wamF4LWNvbnRhaW5lcj1cIlwiXScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IHRvIGJvZHkgaWYgcGpheCBjb250YWluZXIgbm90IGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKCFwamF4Q29udGFpbmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwamF4Q29udGFpbmVyID0gJCgnYm9keScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwamF4T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiBwamF4Q29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICBwdXNoOiBwamF4UHVzaFN0YXRlLFxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlOiBwamF4UmVwbGFjZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUbzogcGpheFNjcm9sbFRvLFxuICAgICAgICAgICAgICAgICAgICBwdXNoUmVkaXJlY3Q6IHBqYXhQdXNoUmVkaXJlY3QsXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VSZWRpcmVjdDogcGpheFJlcGxhY2VSZWRpcmVjdCxcbiAgICAgICAgICAgICAgICAgICAgcGpheFNraXBPdXRlckNvbnRhaW5lcnM6IHBqYXhTa2lwT3V0ZXJDb250YWluZXJzLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBwamF4VGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsVGFyZ2V0OiAkZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbiAmJiBhY3Rpb24gIT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwamF4ICE9PSB1bmRlZmluZWQgJiYgJC5zdXBwb3J0LnBqYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQucGpheC5jbGljayhldmVudCwgcGpheE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkZS5pcygnOnN1Ym1pdCcpICYmICRmb3JtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGpheCAhPT0gdW5kZWZpbmVkICYmICQuc3VwcG9ydC5wamF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZm9ybS5vbignc3VibWl0JyxmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLnBqYXguc3VibWl0KGUsIHBqYXhPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJGZvcm0udHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld0Zvcm0gPSAhJGZvcm0ubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKG5ld0Zvcm0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGlvbiB8fCAhYWN0aW9uLm1hdGNoKC8oXlxcL3w6XFwvXFwvKS8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkZm9ybSA9ICQoJzxmb3JtLz4nLCB7bWV0aG9kOiBtZXRob2QsIGFjdGlvbjogYWN0aW9ufSk7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9ICRlLmF0dHIoJ3RhcmdldCcpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYXR0cigndGFyZ2V0JywgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRob2QubWF0Y2goLyhnZXR8cG9zdCkvaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYXBwZW5kKCQoJzxpbnB1dC8+Jywge25hbWU6ICdfbWV0aG9kJywgdmFsdWU6IG1ldGhvZCwgdHlwZTogJ2hpZGRlbid9KSk7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRob2QubWF0Y2goLyhnZXR8aGVhZHxvcHRpb25zKS9pKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3NyZlBhcmFtID0gcHViLmdldENzcmZQYXJhbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NyZlBhcmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZm9ybS5hcHBlbmQoJCgnPGlucHV0Lz4nLCB7bmFtZTogY3NyZlBhcmFtLCB2YWx1ZTogcHViLmdldENzcmZUb2tlbigpLCB0eXBlOiAnaGlkZGVuJ30pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkZm9ybS5oaWRlKCkuYXBwZW5kVG8oJ2JvZHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFjdGl2ZUZvcm1EYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgICAgICAgaWYgKGFjdGl2ZUZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIgd2hvIHRyaWdnZXJzIHRoZSBmb3JtIHN1Ym1pc3Npb24uIFRoaXMgaXMgdXNlZCBieSB5aWkuYWN0aXZlRm9ybS5qc1xuICAgICAgICAgICAgICAgIGFjdGl2ZUZvcm1EYXRhLnN1Ym1pdE9iamVjdCA9ICRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0ZW1wb3JhcmlseSBhZGQgaGlkZGVuIGlucHV0cyBhY2NvcmRpbmcgdG8gZGF0YS1wYXJhbXNcbiAgICAgICAgICAgIGlmIChwYXJhbXMgJiYgJC5pc1BsYWluT2JqZWN0KHBhcmFtcykpIHtcbiAgICAgICAgICAgICAgICAkLmVhY2gocGFyYW1zLCBmdW5jdGlvbiAoaWR4LCBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYXBwZW5kKCQoJzxpbnB1dC8+JykuYXR0cih7bmFtZTogaWR4LCB2YWx1ZTogb2JqLCB0eXBlOiAnaGlkZGVuJ30pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9sZE1ldGhvZCA9ICRmb3JtLmF0dHIoJ21ldGhvZCcpO1xuICAgICAgICAgICAgJGZvcm0uYXR0cignbWV0aG9kJywgbWV0aG9kKTtcbiAgICAgICAgICAgIHZhciBvbGRBY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiAmJiBhY3Rpb24gIT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgb2xkQWN0aW9uID0gJGZvcm0uYXR0cignYWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgJGZvcm0uYXR0cignYWN0aW9uJywgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwamF4ICE9PSB1bmRlZmluZWQgJiYgJC5zdXBwb3J0LnBqYXgpIHtcbiAgICAgICAgICAgICAgICAkZm9ybS5vbignc3VibWl0JyxmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgJC5wamF4LnN1Ym1pdChlLCBwamF4T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRmb3JtLnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgICAgICAgJC53aGVuKCRmb3JtLmRhdGEoJ3lpaVN1Ym1pdEZpbmFsaXplUHJvbWlzZScpKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZEFjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZm9ybS5hdHRyKCdhY3Rpb24nLCBvbGRBY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLmF0dHIoJ21ldGhvZCcsIG9sZE1ldGhvZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSB0ZW1wb3JhcmlseSBhZGRlZCBoaWRkZW4gaW5wdXRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMgJiYgJC5pc1BsYWluT2JqZWN0KHBhcmFtcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChwYXJhbXMsIGZ1bmN0aW9uIChpZHgsIG9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCInICsgaWR4ICsgJ1wiXScsICRmb3JtKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeVBhcmFtczogZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgdmFyIHBvcyA9IHVybC5pbmRleE9mKCc/Jyk7XG4gICAgICAgICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhaXJzID0gdXJsLnN1YnN0cmluZyhwb3MgKyAxKS5zcGxpdCgnIycpWzBdLnNwbGl0KCcmJyksXG4gICAgICAgICAgICAgICAgcGFyYW1zID0ge30sXG4gICAgICAgICAgICAgICAgcGFpcixcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEkLmlzQXJyYXkocGFyYW1zW25hbWVdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IFtwYXJhbXNbbmFtZV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW25hbWVdLnB1c2godmFsdWUgfHwgJycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gdmFsdWUgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRNb2R1bGU6IGZ1bmN0aW9uIChtb2R1bGUpIHtcbiAgICAgICAgICAgIGlmIChtb2R1bGUuaXNBY3RpdmUgPT09IHVuZGVmaW5lZCB8fCBtb2R1bGUuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG1vZHVsZS5pbml0KSkge1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGUuaW5pdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkLmVhY2gobW9kdWxlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3QodGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Yi5pbml0TW9kdWxlKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaW5pdENzcmZIYW5kbGVyKCk7XG4gICAgICAgICAgICBpbml0UmVkaXJlY3RIYW5kbGVyKCk7XG4gICAgICAgICAgICBpbml0U2NyaXB0RmlsdGVyKCk7XG4gICAgICAgICAgICBpbml0RGF0YU1ldGhvZHMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbml0UmVkaXJlY3RIYW5kbGVyKCkge1xuICAgICAgICAvLyBoYW5kbGUgQUpBWCByZWRpcmVjdGlvblxuICAgICAgICAkKGRvY3VtZW50KS5hamF4Q29tcGxldGUoZnVuY3Rpb24gKGV2ZW50LCB4aHIsIHNldHRpbmdzKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0geGhyICYmIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZWRpcmVjdCcpO1xuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdENzcmZIYW5kbGVyKCkge1xuICAgICAgICAvLyBhdXRvbWF0aWNhbGx5IHNlbmQgQ1NSRiB0b2tlbiBmb3IgYWxsIEFKQVggcmVxdWVzdHNcbiAgICAgICAgJC5hamF4UHJlZmlsdGVyKGZ1bmN0aW9uIChvcHRpb25zLCBvcmlnaW5hbE9wdGlvbnMsIHhocikge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmNyb3NzRG9tYWluICYmIHB1Yi5nZXRDc3JmUGFyYW0oKSkge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCBwdWIuZ2V0Q3NyZlRva2VuKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcHViLnJlZnJlc2hDc3JmVG9rZW4oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0RGF0YU1ldGhvZHMoKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIG1ldGhvZCA9ICR0aGlzLmRhdGEoJ21ldGhvZCcpLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkdGhpcy5kYXRhKCdjb25maXJtJyksXG4gICAgICAgICAgICAgICAgZm9ybSA9ICR0aGlzLmRhdGEoJ2Zvcm0nKTtcblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkICYmIG1lc3NhZ2UgPT09IHVuZGVmaW5lZCAmJiBmb3JtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICQucHJveHkocHViLmNvbmZpcm0sIHRoaXMpKG1lc3NhZ2UsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHViLmhhbmRsZUFjdGlvbigkdGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwdWIuaGFuZGxlQWN0aW9uKCR0aGlzLCBldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBoYW5kbGUgZGF0YS1jb25maXJtIGFuZCBkYXRhLW1ldGhvZCBmb3IgY2xpY2thYmxlIGFuZCBjaGFuZ2VhYmxlIGVsZW1lbnRzXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay55aWknLCBwdWIuY2xpY2thYmxlU2VsZWN0b3IsIGhhbmRsZXIpXG4gICAgICAgICAgICAub24oJ2NoYW5nZS55aWknLCBwdWIuY2hhbmdlYWJsZVNlbGVjdG9yLCBoYW5kbGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0U2NyaXB0RmlsdGVyKCkge1xuICAgICAgICB2YXIgaG9zdEluZm8gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0O1xuXG4gICAgICAgIHZhciBsb2FkZWRTY3JpcHRzID0gJCgnc2NyaXB0W3NyY10nKS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3JjLmNoYXJBdCgwKSA9PT0gJy8nID8gaG9zdEluZm8gKyB0aGlzLnNyYyA6IHRoaXMuc3JjO1xuICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgJC5hamF4UHJlZmlsdGVyKCdzY3JpcHQnLCBmdW5jdGlvbiAob3B0aW9ucywgb3JpZ2luYWxPcHRpb25zLCB4aHIpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRhdGFUeXBlID09ICdqc29ucCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBvcHRpb25zLnVybC5jaGFyQXQoMCkgPT09ICcvJyA/IGhvc3RJbmZvICsgb3B0aW9ucy51cmwgOiBvcHRpb25zLnVybDtcbiAgICAgICAgICAgIGlmICgkLmluQXJyYXkodXJsLCBsb2FkZWRTY3JpcHRzKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsb2FkZWRTY3JpcHRzLnB1c2godXJsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzUmVsb2FkYWJsZSA9ICQuaW5BcnJheSh1cmwsICQubWFwKHB1Yi5yZWxvYWRhYmxlU2NyaXB0cywgZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjcmlwdC5jaGFyQXQoMCkgPT09ICcvJyA/IGhvc3RJbmZvICsgc2NyaXB0IDogc2NyaXB0O1xuICAgICAgICAgICAgICAgICAgICB9KSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIGlmICghaXNSZWxvYWRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkuYWpheENvbXBsZXRlKGZ1bmN0aW9uIChldmVudCwgeGhyLCBzZXR0aW5ncykge1xuICAgICAgICAgICAgdmFyIHN0eWxlU2hlZXRzID0gW107XG4gICAgICAgICAgICAkKCdsaW5rW3JlbD1zdHlsZXNoZWV0XScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkodGhpcy5ocmVmLCBwdWIucmVsb2FkYWJsZVNjcmlwdHMpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkodGhpcy5ocmVmLCBzdHlsZVNoZWV0cykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVTaGVldHMucHVzaCh0aGlzLmhyZWYpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHViO1xufSkoalF1ZXJ5KTtcblxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcbiAgICB5aWkuaW5pdE1vZHVsZSh5aWkpO1xufSk7XG5cbiIsIi8qKlxuICogWWlpIHZhbGlkYXRpb24gbW9kdWxlLlxuICpcbiAqIFRoaXMgSmF2YVNjcmlwdCBtb2R1bGUgcHJvdmlkZXMgdGhlIHZhbGlkYXRpb24gbWV0aG9kcyBmb3IgdGhlIGJ1aWx0LWluIHZhbGlkYXRvcnMuXG4gKlxuICogQGxpbmsgaHR0cDovL3d3dy55aWlmcmFtZXdvcmsuY29tL1xuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMDggWWlpIFNvZnR3YXJlIExMQ1xuICogQGxpY2Vuc2UgaHR0cDovL3d3dy55aWlmcmFtZXdvcmsuY29tL2xpY2Vuc2UvXG4gKiBAYXV0aG9yIFFpYW5nIFh1ZSA8cWlhbmcueHVlQGdtYWlsLmNvbT5cbiAqIEBzaW5jZSAyLjBcbiAqL1xuXG55aWkudmFsaWRhdGlvbiA9IChmdW5jdGlvbiAoJCkge1xuICAgIHZhciBwdWIgPSB7XG4gICAgICAgIGlzRW1wdHk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT0gW10gfHwgdmFsdWUgPT09ICcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZE1lc3NhZ2U6IGZ1bmN0aW9uIChtZXNzYWdlcywgbWVzc2FnZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZS5yZXBsYWNlKC9cXHt2YWx1ZVxcfS9nLCB2YWx1ZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcXVpcmVkOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlcXVpcmVkVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZztcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdHJpY3QgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCB8fCAhb3B0aW9ucy5zdHJpY3QgJiYgIXB1Yi5pc0VtcHR5KGlzU3RyaW5nID8gJC50cmltKHZhbHVlKSA6IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghb3B0aW9ucy5zdHJpY3QgJiYgdmFsdWUgPT0gb3B0aW9ucy5yZXF1aXJlZFZhbHVlIHx8IG9wdGlvbnMuc3RyaWN0ICYmIHZhbHVlID09PSBvcHRpb25zLnJlcXVpcmVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICBwdWIuYWRkTWVzc2FnZShtZXNzYWdlcywgb3B0aW9ucy5tZXNzYWdlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2Jvb2xlYW4nOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdmFsaWQgPSAhb3B0aW9ucy5zdHJpY3QgJiYgKHZhbHVlID09IG9wdGlvbnMudHJ1ZVZhbHVlIHx8IHZhbHVlID09IG9wdGlvbnMuZmFsc2VWYWx1ZSlcbiAgICAgICAgICAgICAgICB8fCBvcHRpb25zLnN0cmljdCAmJiAodmFsdWUgPT09IG9wdGlvbnMudHJ1ZVZhbHVlIHx8IHZhbHVlID09PSBvcHRpb25zLmZhbHNlVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0cmluZzogZnVuY3Rpb24gKHZhbHVlLCBtZXNzYWdlcywgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2tpcE9uRW1wdHkgJiYgcHViLmlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHB1Yi5hZGRNZXNzYWdlKG1lc3NhZ2VzLCBvcHRpb25zLm1lc3NhZ2UsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm1pbiAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmxlbmd0aCA8IG9wdGlvbnMubWluKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMudG9vU2hvcnQsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm1heCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmxlbmd0aCA+IG9wdGlvbnMubWF4KSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMudG9vTG9uZywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXMgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS5sZW5ndGggIT0gb3B0aW9ucy5pcykge1xuICAgICAgICAgICAgICAgIHB1Yi5hZGRNZXNzYWdlKG1lc3NhZ2VzLCBvcHRpb25zLm5vdEVxdWFsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmlsZTogZnVuY3Rpb24gKGF0dHJpYnV0ZSwgbWVzc2FnZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGdldFVwbG9hZGVkRmlsZXMoYXR0cmlidXRlLCBtZXNzYWdlcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAkLmVhY2goZmlsZXMsIGZ1bmN0aW9uIChpLCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGVGaWxlKGZpbGUsIG1lc3NhZ2VzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGltYWdlOiBmdW5jdGlvbiAoYXR0cmlidXRlLCBtZXNzYWdlcywgb3B0aW9ucywgZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGdldFVwbG9hZGVkRmlsZXMoYXR0cmlidXRlLCBtZXNzYWdlcywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgICQuZWFjaChmaWxlcywgZnVuY3Rpb24gKGksIGZpbGUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZUZpbGUoZmlsZSwgbWVzc2FnZXMsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBpbWFnZSB2YWxpZGF0aW9uIGlmIEZpbGVSZWFkZXIgQVBJIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIEZpbGVSZWFkZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkZWYgPSAkLkRlZmVycmVkKCksXG4gICAgICAgICAgICAgICAgICAgIGZyID0gbmV3IEZpbGVSZWFkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5taW5XaWR0aCAmJiB0aGlzLndpZHRoIDwgb3B0aW9ucy5taW5XaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChvcHRpb25zLnVuZGVyV2lkdGgucmVwbGFjZSgvXFx7ZmlsZVxcfS9nLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm1heFdpZHRoICYmIHRoaXMud2lkdGggPiBvcHRpb25zLm1heFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMub3ZlcldpZHRoLnJlcGxhY2UoL1xce2ZpbGVcXH0vZywgZmlsZS5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5taW5IZWlnaHQgJiYgdGhpcy5oZWlnaHQgPCBvcHRpb25zLm1pbkhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChvcHRpb25zLnVuZGVySGVpZ2h0LnJlcGxhY2UoL1xce2ZpbGVcXH0vZywgZmlsZS5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5tYXhIZWlnaHQgJiYgdGhpcy5oZWlnaHQgPiBvcHRpb25zLm1heEhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChvcHRpb25zLm92ZXJIZWlnaHQucmVwbGFjZSgvXFx7ZmlsZVxcfS9nLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWYucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChvcHRpb25zLm5vdEltYWdlLnJlcGxhY2UoL1xce2ZpbGVcXH0vZywgZmlsZS5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIGRlZi5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IGZyLnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gUmVzb2x2ZSBkZWZlcnJlZCBpZiB0aGVyZSB3YXMgZXJyb3Igd2hpbGUgcmVhZGluZyBkYXRhXG4gICAgICAgICAgICAgICAgZnIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZnIucmVhZEFzRGF0YVVSTChmaWxlKTtcblxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgbnVtYmVyOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICF2YWx1ZS5tYXRjaChvcHRpb25zLnBhdHRlcm4pKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubWluICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgPCBvcHRpb25zLm1pbikge1xuICAgICAgICAgICAgICAgIHB1Yi5hZGRNZXNzYWdlKG1lc3NhZ2VzLCBvcHRpb25zLnRvb1NtYWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5tYXggIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSA+IG9wdGlvbnMubWF4KSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMudG9vQmlnLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSwgbWVzc2FnZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNraXBPbkVtcHR5ICYmIHB1Yi5pc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmFsbG93QXJyYXkgJiYgJC5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHB1Yi5hZGRNZXNzYWdlKG1lc3NhZ2VzLCBvcHRpb25zLm1lc3NhZ2UsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbkFycmF5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgJC5lYWNoKCQuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0sIGZ1bmN0aW9uIChpLCB2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheSh2LCBvcHRpb25zLnJhbmdlKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpbkFycmF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubm90ID09PSBpbkFycmF5KSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ3VsYXJFeHByZXNzaW9uOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub3QgJiYgIXZhbHVlLm1hdGNoKG9wdGlvbnMucGF0dGVybikgfHwgb3B0aW9ucy5ub3QgJiYgdmFsdWUubWF0Y2gob3B0aW9ucy5wYXR0ZXJuKSkge1xuICAgICAgICAgICAgICAgIHB1Yi5hZGRNZXNzYWdlKG1lc3NhZ2VzLCBvcHRpb25zLm1lc3NhZ2UsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlbWFpbDogZnVuY3Rpb24gKHZhbHVlLCBtZXNzYWdlcywgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2tpcE9uRW1wdHkgJiYgcHViLmlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsaWQgPSB0cnVlO1xuXG5cbiAgICAgICAgICAgIHZhciByZWdleHAgPSAvXigoPzpcIj8oW15cIl0qKVwiP1xccyk/KSg/OlxccyspPyg/Oig8PykoKC4rKUAoW14+XSspKSg+PykpJC8sXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4cC5leGVjKHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YWxpZCA9IGZhbHNlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVuYWJsZUlETikge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzWzVdID0gcHVueWNvZGUudG9BU0NJSShtYXRjaGVzWzVdKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlc1s2XSA9IHB1bnljb2RlLnRvQVNDSUkobWF0Y2hlc1s2XSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaGVzWzFdICsgbWF0Y2hlc1szXSArIG1hdGNoZXNbNV0gKyAnQCcgKyBtYXRjaGVzWzZdICsgbWF0Y2hlc1s3XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlc1s1XS5sZW5ndGggPiA2NCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKG1hdGNoZXNbNV0gKyAnQCcgKyBtYXRjaGVzWzZdKS5sZW5ndGggPiAyNTQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHZhbHVlLm1hdGNoKG9wdGlvbnMucGF0dGVybikgfHwgKG9wdGlvbnMuYWxsb3dOYW1lICYmIHZhbHVlLm1hdGNoKG9wdGlvbnMuZnVsbFBhdHRlcm4pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICBwdWIuYWRkTWVzc2FnZShtZXNzYWdlcywgb3B0aW9ucy5tZXNzYWdlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXJsOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRlZmF1bHRTY2hlbWUgJiYgIXZhbHVlLm1hdGNoKC86XFwvXFwvLykpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG9wdGlvbnMuZGVmYXVsdFNjaGVtZSArICc6Ly8nICsgdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWxpZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmVuYWJsZUlETikge1xuICAgICAgICAgICAgICAgIHZhciByZWdleHAgPSAvXihbXjpdKyk6XFwvXFwvKFteXFwvXSspKC4qKSQvLFxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhwLmV4ZWModmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaGVzWzFdICsgJzovLycgKyBwdW55Y29kZS50b0FTQ0lJKG1hdGNoZXNbMl0pICsgbWF0Y2hlc1szXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdmFsaWQgfHwgIXZhbHVlLm1hdGNoKG9wdGlvbnMucGF0dGVybikpIHtcbiAgICAgICAgICAgICAgICBwdWIuYWRkTWVzc2FnZShtZXNzYWdlcywgb3B0aW9ucy5tZXNzYWdlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpbTogZnVuY3Rpb24gKCRmb3JtLCBhdHRyaWJ1dGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciAkaW5wdXQgPSAkZm9ybS5maW5kKGF0dHJpYnV0ZS5pbnB1dCk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSAkaW5wdXQudmFsKCk7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcE9uRW1wdHkgfHwgIXB1Yi5pc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gJC50cmltKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYXB0Y2hhOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENBUFRDSEEgbWF5IGJlIHVwZGF0ZWQgdmlhIEFKQVggYW5kIHRoZSB1cGRhdGVkIGhhc2ggaXMgc3RvcmVkIGluIGJvZHkgZGF0YVxuICAgICAgICAgICAgdmFyIGhhc2ggPSAkKCdib2R5JykuZGF0YShvcHRpb25zLmhhc2hLZXkpO1xuICAgICAgICAgICAgaWYgKGhhc2ggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGhhc2ggPSBvcHRpb25zLmhhc2g7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhc2ggPSBoYXNoW29wdGlvbnMuY2FzZVNlbnNpdGl2ZSA/IDAgOiAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2ID0gb3B0aW9ucy5jYXNlU2Vuc2l0aXZlID8gdmFsdWUgOiB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHYubGVuZ3RoIC0gMSwgaCA9IDA7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgaCArPSB2LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaCAhPSBoYXNoKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uICh2YWx1ZSwgbWVzc2FnZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNraXBPbkVtcHR5ICYmIHB1Yi5pc0VtcHR5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbXBhcmVWYWx1ZSwgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyZUF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29tcGFyZVZhbHVlID0gb3B0aW9ucy5jb21wYXJlVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBhcmVWYWx1ZSA9ICQoJyMnICsgb3B0aW9ucy5jb21wYXJlQXR0cmlidXRlKS52YWwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgICAgIGNvbXBhcmVWYWx1ZSA9IHBhcnNlRmxvYXQoY29tcGFyZVZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAob3B0aW9ucy5vcGVyYXRvcikge1xuICAgICAgICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB2YWx1ZSA9PSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdmFsdWUgPT09IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHZhbHVlICE9IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB2YWx1ZSAhPT0gY29tcGFyZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB2YWx1ZSA+IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHZhbHVlID49IGNvbXBhcmVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdmFsdWUgPCBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB2YWx1ZSA8PSBjb21wYXJlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlwOiBmdW5jdGlvbiAodmFsdWUsIG1lc3NhZ2VzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgZ2V0SXBWZXJzaW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmluZGV4T2YoJzonKSA9PT0gLTEgPyA0IDogNjtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBuZWdhdGlvbiA9IG51bGwsIGNpZHIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5za2lwT25FbXB0eSAmJiBwdWIuaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gbmV3IFJlZ0V4cChvcHRpb25zLmlwUGFyc2VQYXR0ZXJuKS5leGVjKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgbmVnYXRpb24gPSBtYXRjaGVzWzFdIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaGVzWzJdO1xuICAgICAgICAgICAgICAgIGNpZHIgPSBtYXRjaGVzWzRdIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym5ldCA9PT0gdHJ1ZSAmJiBjaWRyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZXMubm9TdWJuZXQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJuZXQgPT09IGZhbHNlICYmIGNpZHIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwdWIuYWRkTWVzc2FnZShtZXNzYWdlcywgb3B0aW9ucy5tZXNzYWdlcy5oYXNTdWJuZXQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5uZWdhdGlvbiA9PT0gZmFsc2UgJiYgbmVnYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwdWIuYWRkTWVzc2FnZShtZXNzYWdlcywgb3B0aW9ucy5tZXNzYWdlcy5tZXNzYWdlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZ2V0SXBWZXJzaW9uKHZhbHVlKSA9PSA2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmlwdjYpIHtcbiAgICAgICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZXMuaXB2Nk5vdEFsbG93ZWQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEobmV3IFJlZ0V4cChvcHRpb25zLmlwdjZQYXR0ZXJuKSkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZXMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmlwdjQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZXMuaXB2NE5vdEFsbG93ZWQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEobmV3IFJlZ0V4cChvcHRpb25zLmlwdjRQYXR0ZXJuKSkudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHViLmFkZE1lc3NhZ2UobWVzc2FnZXMsIG9wdGlvbnMubWVzc2FnZXMubWVzc2FnZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRVcGxvYWRlZEZpbGVzKGF0dHJpYnV0ZSwgbWVzc2FnZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gU2tpcCB2YWxpZGF0aW9uIGlmIEZpbGUgQVBJIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgICAgaWYgKHR5cGVvZiBGaWxlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlsZXMgPSAkKGF0dHJpYnV0ZS5pbnB1dCkuZ2V0KDApLmZpbGVzO1xuICAgICAgICBpZiAoIWZpbGVzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcE9uRW1wdHkpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMudXBsb2FkUmVxdWlyZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RmlsZXMgJiYgb3B0aW9ucy5tYXhGaWxlcyA8IGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChvcHRpb25zLnRvb01hbnkpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlLCBtZXNzYWdlcywgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5leHRlbnNpb25zICYmIG9wdGlvbnMuZXh0ZW5zaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXgsIGV4dDtcblxuICAgICAgICAgICAgaW5kZXggPSBmaWxlLm5hbWUubGFzdEluZGV4T2YoJy4nKTtcblxuICAgICAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICAgICAgICBleHQgPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ID0gZmlsZS5uYW1lLnN1YnN0cihpbmRleCArIDEsIGZpbGUubmFtZS5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghfm9wdGlvbnMuZXh0ZW5zaW9ucy5pbmRleE9mKGV4dCkpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMud3JvbmdFeHRlbnNpb24ucmVwbGFjZSgvXFx7ZmlsZVxcfS9nLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1pbWVUeXBlcyAmJiBvcHRpb25zLm1pbWVUeXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRlTWltZVR5cGUob3B0aW9ucy5taW1lVHlwZXMsIGZpbGUudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMud3JvbmdNaW1lVHlwZS5yZXBsYWNlKC9cXHtmaWxlXFx9L2csIGZpbGUubmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubWF4U2l6ZSAmJiBvcHRpb25zLm1heFNpemUgPCBmaWxlLnNpemUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gob3B0aW9ucy50b29CaWcucmVwbGFjZSgvXFx7ZmlsZVxcfS9nLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm1pblNpemUgJiYgb3B0aW9ucy5taW5TaXplID4gZmlsZS5zaXplKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG9wdGlvbnMudG9vU21hbGwucmVwbGFjZSgvXFx7ZmlsZVxcfS9nLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlTWltZVR5cGUobWltZVR5cGVzLCBmaWxlVHlwZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbWltZVR5cGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChtaW1lVHlwZXNbaV0pLnRlc3QoZmlsZVR5cGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvKipcbiAqIFlpaSBmb3JtIHdpZGdldC5cbiAqXG4gKiBUaGlzIGlzIHRoZSBKYXZhU2NyaXB0IHdpZGdldCB1c2VkIGJ5IHRoZSB5aWlcXHdpZGdldHNcXEFjdGl2ZUZvcm0gd2lkZ2V0LlxuICpcbiAqIEBsaW5rIGh0dHA6Ly93d3cueWlpZnJhbWV3b3JrLmNvbS9cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDA4IFlpaSBTb2Z0d2FyZSBMTENcbiAqIEBsaWNlbnNlIGh0dHA6Ly93d3cueWlpZnJhbWV3b3JrLmNvbS9saWNlbnNlL1xuICogQGF1dGhvciBRaWFuZyBYdWUgPHFpYW5nLnh1ZUBnbWFpbC5jb20+XG4gKiBAc2luY2UgMi4wXG4gKi9cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgJC5mbi55aWlBY3RpdmVGb3JtID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICBpZiAobWV0aG9kc1ttZXRob2RdKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdvYmplY3QnIHx8ICFtZXRob2QpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQuZXJyb3IoJ01ldGhvZCAnICsgbWV0aG9kICsgJyBkb2VzIG5vdCBleGlzdCBvbiBqUXVlcnkueWlpQWN0aXZlRm9ybScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBldmVudHMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBiZWZvcmVWYWxpZGF0ZSBldmVudCBpcyB0cmlnZ2VyZWQgYmVmb3JlIHZhbGlkYXRpbmcgdGhlIHdob2xlIGZvcm0uXG4gICAgICAgICAqIFRoZSBzaWduYXR1cmUgb2YgdGhlIGV2ZW50IGhhbmRsZXIgc2hvdWxkIGJlOlxuICAgICAgICAgKiAgICAgZnVuY3Rpb24gKGV2ZW50LCBtZXNzYWdlcywgZGVmZXJyZWRzKVxuICAgICAgICAgKiB3aGVyZVxuICAgICAgICAgKiAgLSBldmVudDogYW4gRXZlbnQgb2JqZWN0LlxuICAgICAgICAgKiAgLSBtZXNzYWdlczogYW4gYXNzb2NpYXRpdmUgYXJyYXkgd2l0aCBrZXlzIGJlaW5nIGF0dHJpYnV0ZSBJRHMgYW5kIHZhbHVlcyBiZWluZyBlcnJvciBtZXNzYWdlIGFycmF5c1xuICAgICAgICAgKiAgICBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgYXR0cmlidXRlcy5cbiAgICAgICAgICogIC0gZGVmZXJyZWRzOiBhbiBhcnJheSBvZiBEZWZlcnJlZCBvYmplY3RzLiBZb3UgY2FuIHVzZSBkZWZlcnJlZHMuYWRkKGNhbGxiYWNrKSB0byBhZGQgYSBuZXcgZGVmZXJyZWQgdmFsaWRhdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogSWYgdGhlIGhhbmRsZXIgcmV0dXJucyBhIGJvb2xlYW4gZmFsc2UsIGl0IHdpbGwgc3RvcCBmdXJ0aGVyIGZvcm0gdmFsaWRhdGlvbiBhZnRlciB0aGlzIGV2ZW50LiBBbmQgYXNcbiAgICAgICAgICogYSByZXN1bHQsIGFmdGVyVmFsaWRhdGUgZXZlbnQgd2lsbCBub3QgYmUgdHJpZ2dlcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgYmVmb3JlVmFsaWRhdGU6ICdiZWZvcmVWYWxpZGF0ZScsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhZnRlclZhbGlkYXRlIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciB2YWxpZGF0aW5nIHRoZSB3aG9sZSBmb3JtLlxuICAgICAgICAgKiBUaGUgc2lnbmF0dXJlIG9mIHRoZSBldmVudCBoYW5kbGVyIHNob3VsZCBiZTpcbiAgICAgICAgICogICAgIGZ1bmN0aW9uIChldmVudCwgbWVzc2FnZXMsIGVycm9yQXR0cmlidXRlcylcbiAgICAgICAgICogd2hlcmVcbiAgICAgICAgICogIC0gZXZlbnQ6IGFuIEV2ZW50IG9iamVjdC5cbiAgICAgICAgICogIC0gbWVzc2FnZXM6IGFuIGFzc29jaWF0aXZlIGFycmF5IHdpdGgga2V5cyBiZWluZyBhdHRyaWJ1dGUgSURzIGFuZCB2YWx1ZXMgYmVpbmcgZXJyb3IgbWVzc2FnZSBhcnJheXNcbiAgICAgICAgICogICAgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqICAtIGVycm9yQXR0cmlidXRlczogYW4gYXJyYXkgb2YgYXR0cmlidXRlcyB0aGF0IGhhdmUgdmFsaWRhdGlvbiBlcnJvcnMuIFBsZWFzZSByZWZlciB0byBhdHRyaWJ1dGVEZWZhdWx0cyBmb3IgdGhlIHN0cnVjdHVyZSBvZiB0aGlzIHBhcmFtZXRlci5cbiAgICAgICAgICovXG4gICAgICAgIGFmdGVyVmFsaWRhdGU6ICdhZnRlclZhbGlkYXRlJyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGJlZm9yZVZhbGlkYXRlQXR0cmlidXRlIGV2ZW50IGlzIHRyaWdnZXJlZCBiZWZvcmUgdmFsaWRhdGluZyBhbiBhdHRyaWJ1dGUuXG4gICAgICAgICAqIFRoZSBzaWduYXR1cmUgb2YgdGhlIGV2ZW50IGhhbmRsZXIgc2hvdWxkIGJlOlxuICAgICAgICAgKiAgICAgZnVuY3Rpb24gKGV2ZW50LCBhdHRyaWJ1dGUsIG1lc3NhZ2VzLCBkZWZlcnJlZHMpXG4gICAgICAgICAqIHdoZXJlXG4gICAgICAgICAqICAtIGV2ZW50OiBhbiBFdmVudCBvYmplY3QuXG4gICAgICAgICAqICAtIGF0dHJpYnV0ZTogdGhlIGF0dHJpYnV0ZSB0byBiZSB2YWxpZGF0ZWQuIFBsZWFzZSByZWZlciB0byBhdHRyaWJ1dGVEZWZhdWx0cyBmb3IgdGhlIHN0cnVjdHVyZSBvZiB0aGlzIHBhcmFtZXRlci5cbiAgICAgICAgICogIC0gbWVzc2FnZXM6IGFuIGFycmF5IHRvIHdoaWNoIHlvdSBjYW4gYWRkIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXMgZm9yIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlLlxuICAgICAgICAgKiAgLSBkZWZlcnJlZHM6IGFuIGFycmF5IG9mIERlZmVycmVkIG9iamVjdHMuIFlvdSBjYW4gdXNlIGRlZmVycmVkcy5hZGQoY2FsbGJhY2spIHRvIGFkZCBhIG5ldyBkZWZlcnJlZCB2YWxpZGF0aW9uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBJZiB0aGUgaGFuZGxlciByZXR1cm5zIGEgYm9vbGVhbiBmYWxzZSwgaXQgd2lsbCBzdG9wIGZ1cnRoZXIgdmFsaWRhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGF0dHJpYnV0ZS5cbiAgICAgICAgICogQW5kIGFzIGEgcmVzdWx0LCBhZnRlclZhbGlkYXRlQXR0cmlidXRlIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZC5cbiAgICAgICAgICovXG4gICAgICAgIGJlZm9yZVZhbGlkYXRlQXR0cmlidXRlOiAnYmVmb3JlVmFsaWRhdGVBdHRyaWJ1dGUnLFxuICAgICAgICAvKipcbiAgICAgICAgICogYWZ0ZXJWYWxpZGF0ZUF0dHJpYnV0ZSBldmVudCBpcyB0cmlnZ2VyZWQgYWZ0ZXIgdmFsaWRhdGluZyB0aGUgd2hvbGUgZm9ybSBhbmQgZWFjaCBhdHRyaWJ1dGUuXG4gICAgICAgICAqIFRoZSBzaWduYXR1cmUgb2YgdGhlIGV2ZW50IGhhbmRsZXIgc2hvdWxkIGJlOlxuICAgICAgICAgKiAgICAgZnVuY3Rpb24gKGV2ZW50LCBhdHRyaWJ1dGUsIG1lc3NhZ2VzKVxuICAgICAgICAgKiB3aGVyZVxuICAgICAgICAgKiAgLSBldmVudDogYW4gRXZlbnQgb2JqZWN0LlxuICAgICAgICAgKiAgLSBhdHRyaWJ1dGU6IHRoZSBhdHRyaWJ1dGUgYmVpbmcgdmFsaWRhdGVkLiBQbGVhc2UgcmVmZXIgdG8gYXR0cmlidXRlRGVmYXVsdHMgZm9yIHRoZSBzdHJ1Y3R1cmUgb2YgdGhpcyBwYXJhbWV0ZXIuXG4gICAgICAgICAqICAtIG1lc3NhZ2VzOiBhbiBhcnJheSB0byB3aGljaCB5b3UgY2FuIGFkZCBhZGRpdGlvbmFsIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXMgZm9yIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlLlxuICAgICAgICAgKi9cbiAgICAgICAgYWZ0ZXJWYWxpZGF0ZUF0dHJpYnV0ZTogJ2FmdGVyVmFsaWRhdGVBdHRyaWJ1dGUnLFxuICAgICAgICAvKipcbiAgICAgICAgICogYmVmb3JlU3VibWl0IGV2ZW50IGlzIHRyaWdnZXJlZCBiZWZvcmUgc3VibWl0dGluZyB0aGUgZm9ybSBhZnRlciBhbGwgdmFsaWRhdGlvbnMgaGF2ZSBwYXNzZWQuXG4gICAgICAgICAqIFRoZSBzaWduYXR1cmUgb2YgdGhlIGV2ZW50IGhhbmRsZXIgc2hvdWxkIGJlOlxuICAgICAgICAgKiAgICAgZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICAgKiB3aGVyZSBldmVudCBpcyBhbiBFdmVudCBvYmplY3QuXG4gICAgICAgICAqXG4gICAgICAgICAqIElmIHRoZSBoYW5kbGVyIHJldHVybnMgYSBib29sZWFuIGZhbHNlLCBpdCB3aWxsIHN0b3AgZm9ybSBzdWJtaXNzaW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgYmVmb3JlU3VibWl0OiAnYmVmb3JlU3VibWl0JyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFqYXhCZWZvcmVTZW5kIGV2ZW50IGlzIHRyaWdnZXJlZCBiZWZvcmUgc2VuZGluZyBhbiBBSkFYIHJlcXVlc3QgZm9yIEFKQVgtYmFzZWQgdmFsaWRhdGlvbi5cbiAgICAgICAgICogVGhlIHNpZ25hdHVyZSBvZiB0aGUgZXZlbnQgaGFuZGxlciBzaG91bGQgYmU6XG4gICAgICAgICAqICAgICBmdW5jdGlvbiAoZXZlbnQsIGpxWEhSLCBzZXR0aW5ncylcbiAgICAgICAgICogd2hlcmVcbiAgICAgICAgICogIC0gZXZlbnQ6IGFuIEV2ZW50IG9iamVjdC5cbiAgICAgICAgICogIC0ganFYSFI6IGEganFYSFIgb2JqZWN0XG4gICAgICAgICAqICAtIHNldHRpbmdzOiB0aGUgc2V0dGluZ3MgZm9yIHRoZSBBSkFYIHJlcXVlc3RcbiAgICAgICAgICovXG4gICAgICAgIGFqYXhCZWZvcmVTZW5kOiAnYWpheEJlZm9yZVNlbmQnLFxuICAgICAgICAvKipcbiAgICAgICAgICogYWpheENvbXBsZXRlIGV2ZW50IGlzIHRyaWdnZXJlZCBhZnRlciBjb21wbGV0aW5nIGFuIEFKQVggcmVxdWVzdCBmb3IgQUpBWC1iYXNlZCB2YWxpZGF0aW9uLlxuICAgICAgICAgKiBUaGUgc2lnbmF0dXJlIG9mIHRoZSBldmVudCBoYW5kbGVyIHNob3VsZCBiZTpcbiAgICAgICAgICogICAgIGZ1bmN0aW9uIChldmVudCwganFYSFIsIHRleHRTdGF0dXMpXG4gICAgICAgICAqIHdoZXJlXG4gICAgICAgICAqICAtIGV2ZW50OiBhbiBFdmVudCBvYmplY3QuXG4gICAgICAgICAqICAtIGpxWEhSOiBhIGpxWEhSIG9iamVjdFxuICAgICAgICAgKiAgLSB0ZXh0U3RhdHVzOiB0aGUgc3RhdHVzIG9mIHRoZSByZXF1ZXN0IChcInN1Y2Nlc3NcIiwgXCJub3Rtb2RpZmllZFwiLCBcImVycm9yXCIsIFwidGltZW91dFwiLCBcImFib3J0XCIsIG9yIFwicGFyc2VyZXJyb3JcIikuXG4gICAgICAgICAqL1xuICAgICAgICBhamF4Q29tcGxldGU6ICdhamF4Q29tcGxldGUnXG4gICAgfTtcblxuICAgIC8vIE5PVEU6IElmIHlvdSBjaGFuZ2UgYW55IG9mIHRoZXNlIGRlZmF1bHRzLCBtYWtlIHN1cmUgeW91IHVwZGF0ZSB5aWlcXHdpZGdldHNcXEFjdGl2ZUZvcm06OmdldENsaWVudE9wdGlvbnMoKSBhcyB3ZWxsXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgICAvLyB3aGV0aGVyIHRvIGVuY29kZSB0aGUgZXJyb3Igc3VtbWFyeVxuICAgICAgICBlbmNvZGVFcnJvclN1bW1hcnk6IHRydWUsXG4gICAgICAgIC8vIHRoZSBqUXVlcnkgc2VsZWN0b3IgZm9yIHRoZSBlcnJvciBzdW1tYXJ5XG4gICAgICAgIGVycm9yU3VtbWFyeTogJy5lcnJvci1zdW1tYXJ5JyxcbiAgICAgICAgLy8gd2hldGhlciB0byBwZXJmb3JtIHZhbGlkYXRpb24gYmVmb3JlIHN1Ym1pdHRpbmcgdGhlIGZvcm0uXG4gICAgICAgIHZhbGlkYXRlT25TdWJtaXQ6IHRydWUsXG4gICAgICAgIC8vIHRoZSBjb250YWluZXIgQ1NTIGNsYXNzIHJlcHJlc2VudGluZyB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGUgaGFzIHZhbGlkYXRpb24gZXJyb3JcbiAgICAgICAgZXJyb3JDc3NDbGFzczogJ2hhcy1lcnJvcicsXG4gICAgICAgIC8vIHRoZSBjb250YWluZXIgQ1NTIGNsYXNzIHJlcHJlc2VudGluZyB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGUgcGFzc2VzIHZhbGlkYXRpb25cbiAgICAgICAgc3VjY2Vzc0Nzc0NsYXNzOiAnaGFzLXN1Y2Nlc3MnLFxuICAgICAgICAvLyB0aGUgY29udGFpbmVyIENTUyBjbGFzcyByZXByZXNlbnRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgYXR0cmlidXRlIGlzIGJlaW5nIHZhbGlkYXRlZFxuICAgICAgICB2YWxpZGF0aW5nQ3NzQ2xhc3M6ICd2YWxpZGF0aW5nJyxcbiAgICAgICAgLy8gdGhlIEdFVCBwYXJhbWV0ZXIgbmFtZSBpbmRpY2F0aW5nIGFuIEFKQVgtYmFzZWQgdmFsaWRhdGlvblxuICAgICAgICBhamF4UGFyYW06ICdhamF4JyxcbiAgICAgICAgLy8gdGhlIHR5cGUgb2YgZGF0YSB0aGF0IHlvdSdyZSBleHBlY3RpbmcgYmFjayBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgICAgYWpheERhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIC8vIHRoZSBVUkwgZm9yIHBlcmZvcm1pbmcgQUpBWC1iYXNlZCB2YWxpZGF0aW9uLiBJZiBub3Qgc2V0LCBpdCB3aWxsIHVzZSB0aGUgdGhlIGZvcm0ncyBhY3Rpb25cbiAgICAgICAgdmFsaWRhdGlvblVybDogdW5kZWZpbmVkLFxuICAgICAgICAvLyB3aGV0aGVyIHRvIHNjcm9sbCB0byBmaXJzdCB2aXNpYmxlIGVycm9yIGFmdGVyIHZhbGlkYXRpb24uXG4gICAgICAgIHNjcm9sbFRvRXJyb3I6IHRydWVcbiAgICB9O1xuXG4gICAgLy8gTk9URTogSWYgeW91IGNoYW5nZSBhbnkgb2YgdGhlc2UgZGVmYXVsdHMsIG1ha2Ugc3VyZSB5b3UgdXBkYXRlIHlpaVxcd2lkZ2V0c1xcQWN0aXZlRmllbGQ6OmdldENsaWVudE9wdGlvbnMoKSBhcyB3ZWxsXG4gICAgdmFyIGF0dHJpYnV0ZURlZmF1bHRzID0ge1xuICAgICAgICAvLyBhIHVuaXF1ZSBJRCBpZGVudGlmeWluZyBhbiBhdHRyaWJ1dGUgKGUuZy4gXCJsb2dpbmZvcm0tdXNlcm5hbWVcIikgaW4gYSBmb3JtXG4gICAgICAgIGlkOiB1bmRlZmluZWQsXG4gICAgICAgIC8vIGF0dHJpYnV0ZSBuYW1lIG9yIGV4cHJlc3Npb24gKGUuZy4gXCJbMF1jb250ZW50XCIgZm9yIHRhYnVsYXIgaW5wdXQpXG4gICAgICAgIG5hbWU6IHVuZGVmaW5lZCxcbiAgICAgICAgLy8gdGhlIGpRdWVyeSBzZWxlY3RvciBvZiB0aGUgY29udGFpbmVyIG9mIHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgLy8gdGhlIGpRdWVyeSBzZWxlY3RvciBvZiB0aGUgaW5wdXQgZmllbGQgdW5kZXIgdGhlIGNvbnRleHQgb2YgdGhlIGZvcm1cbiAgICAgICAgaW5wdXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgLy8gdGhlIGpRdWVyeSBzZWxlY3RvciBvZiB0aGUgZXJyb3IgdGFnIHVuZGVyIHRoZSBjb250ZXh0IG9mIHRoZSBjb250YWluZXJcbiAgICAgICAgZXJyb3I6ICcuaGVscC1ibG9jaycsXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gZW5jb2RlIHRoZSBlcnJvclxuICAgICAgICBlbmNvZGVFcnJvcjogdHJ1ZSxcbiAgICAgICAgLy8gd2hldGhlciB0byBwZXJmb3JtIHZhbGlkYXRpb24gd2hlbiBhIGNoYW5nZSBpcyBkZXRlY3RlZCBvbiB0aGUgaW5wdXRcbiAgICAgICAgdmFsaWRhdGVPbkNoYW5nZTogdHJ1ZSxcbiAgICAgICAgLy8gd2hldGhlciB0byBwZXJmb3JtIHZhbGlkYXRpb24gd2hlbiB0aGUgaW5wdXQgbG9zZXMgZm9jdXNcbiAgICAgICAgdmFsaWRhdGVPbkJsdXI6IHRydWUsXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gcGVyZm9ybSB2YWxpZGF0aW9uIHdoZW4gdGhlIHVzZXIgaXMgdHlwaW5nLlxuICAgICAgICB2YWxpZGF0ZU9uVHlwZTogZmFsc2UsXG4gICAgICAgIC8vIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCB0aGUgdmFsaWRhdGlvbiBzaG91bGQgYmUgZGVsYXllZCB3aGVuIGEgdXNlciBpcyB0eXBpbmcgaW4gdGhlIGlucHV0IGZpZWxkLlxuICAgICAgICB2YWxpZGF0aW9uRGVsYXk6IDUwMCxcbiAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgQUpBWC1iYXNlZCB2YWxpZGF0aW9uLlxuICAgICAgICBlbmFibGVBamF4VmFsaWRhdGlvbjogZmFsc2UsXG4gICAgICAgIC8vIGZ1bmN0aW9uIChhdHRyaWJ1dGUsIHZhbHVlLCBtZXNzYWdlcywgZGVmZXJyZWQsICRmb3JtKSwgdGhlIGNsaWVudC1zaWRlIHZhbGlkYXRpb24gZnVuY3Rpb24uXG4gICAgICAgIHZhbGlkYXRlOiB1bmRlZmluZWQsXG4gICAgICAgIC8vIHN0YXR1cyBvZiB0aGUgaW5wdXQgZmllbGQsIDA6IGVtcHR5LCBub3QgZW50ZXJlZCBiZWZvcmUsIDE6IHZhbGlkYXRlZCwgMjogcGVuZGluZyB2YWxpZGF0aW9uLCAzOiB2YWxpZGF0aW5nXG4gICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgLy8gd2hldGhlciB0aGUgdmFsaWRhdGlvbiBpcyBjYW5jZWxsZWQgYnkgYmVmb3JlVmFsaWRhdGVBdHRyaWJ1dGUgZXZlbnQgaGFuZGxlclxuICAgICAgICBjYW5jZWxsZWQ6IGZhbHNlLFxuICAgICAgICAvLyB0aGUgdmFsdWUgb2YgdGhlIGlucHV0XG4gICAgICAgIHZhbHVlOiB1bmRlZmluZWRcbiAgICB9O1xuXG5cbiAgICB2YXIgc3VibWl0RGVmZXI7XG5cbiAgICB2YXIgc2V0U3VibWl0RmluYWxpemVEZWZlciA9IGZ1bmN0aW9uKCRmb3JtKSB7XG4gICAgICAgIHN1Ym1pdERlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAkZm9ybS5kYXRhKCd5aWlTdWJtaXRGaW5hbGl6ZVByb21pc2UnLCBzdWJtaXREZWZlci5wcm9taXNlKCkpO1xuICAgIH07XG5cbiAgICAvLyBmaW5hbGl6ZSB5aWkuanMgJGZvcm0uc3VibWl0XG4gICAgdmFyIHN1Ym1pdEZpbmFsaXplID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgICAgICAgaWYoc3VibWl0RGVmZXIpIHtcbiAgICAgICAgICAgIHN1Ym1pdERlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgIHN1Ym1pdERlZmVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgJGZvcm0ucmVtb3ZlRGF0YSgneWlpU3VibWl0RmluYWxpemVQcm9taXNlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciAkZm9ybSA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKCRmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudmFsaWRhdGlvblVybCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbGlkYXRpb25VcmwgPSAkZm9ybS5hdHRyKCdhY3Rpb24nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkLmVhY2goYXR0cmlidXRlcywgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlc1tpXSA9ICQuZXh0ZW5kKHt2YWx1ZTogZ2V0VmFsdWUoJGZvcm0sIHRoaXMpfSwgYXR0cmlidXRlRGVmYXVsdHMsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB3YXRjaEF0dHJpYnV0ZSgkZm9ybSwgYXR0cmlidXRlc1tpXSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJywge1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6ICRmb3JtLmF0dHIoJ3RhcmdldCcpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBDbGVhbiB1cCBlcnJvciBzdGF0dXMgd2hlbiB0aGUgZm9ybSBpcyByZXNldC5cbiAgICAgICAgICAgICAgICAgKiBOb3RlIHRoYXQgJGZvcm0ub24oJ3Jlc2V0JywgLi4uKSBkb2VzIHdvcmsgYmVjYXVzZSB0aGUgXCJyZXNldFwiIGV2ZW50IGRvZXMgbm90IGJ1YmJsZSBvbiBJRS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAkZm9ybS5iaW5kKCdyZXNldC55aWlBY3RpdmVGb3JtJywgbWV0aG9kcy5yZXNldEZvcm0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnZhbGlkYXRlT25TdWJtaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0ub24oJ21vdXNldXAueWlpQWN0aXZlRm9ybSBrZXl1cC55aWlBY3RpdmVGb3JtJywgJzpzdWJtaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJykuc3VibWl0T2JqZWN0ID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLm9uKCdzdWJtaXQueWlpQWN0aXZlRm9ybScsIG1ldGhvZHMuc3VibWl0Rm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gYWRkIGEgbmV3IGF0dHJpYnV0ZSB0byB0aGUgZm9ybSBkeW5hbWljYWxseS5cbiAgICAgICAgLy8gcGxlYXNlIHJlZmVyIHRvIGF0dHJpYnV0ZURlZmF1bHRzIGZvciB0aGUgc3RydWN0dXJlIG9mIGF0dHJpYnV0ZVxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHZhciAkZm9ybSA9ICQodGhpcyk7XG4gICAgICAgICAgICBhdHRyaWJ1dGUgPSAkLmV4dGVuZCh7dmFsdWU6IGdldFZhbHVlKCRmb3JtLCBhdHRyaWJ1dGUpfSwgYXR0cmlidXRlRGVmYXVsdHMsIGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJykuYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB3YXRjaEF0dHJpYnV0ZSgkZm9ybSwgYXR0cmlidXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyByZW1vdmUgdGhlIGF0dHJpYnV0ZSB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgZnJvbSB0aGUgZm9ybVxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAkLmVhY2goYXR0cmlidXRlcywgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1tpXVsnaWQnXSA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHVud2F0Y2hBdHRyaWJ1dGUoJGZvcm0sIGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG1hbnVhbGx5IHRyaWdnZXIgdGhlIHZhbGlkYXRpb24gb2YgdGhlIGF0dHJpYnV0ZSB3aXRoIHRoZSBzcGVjaWZpZWQgSURcbiAgICAgICAgdmFsaWRhdGVBdHRyaWJ1dGU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IG1ldGhvZHMuZmluZC5jYWxsKHRoaXMsIGlkKTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGVBdHRyaWJ1dGUoJCh0aGlzKSwgYXR0cmlidXRlLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBmaW5kIGFuIGF0dHJpYnV0ZSBjb25maWcgYmFzZWQgb24gdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGUgSURcbiAgICAgICAgZmluZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgYXR0cmlidXRlcyA9ICQodGhpcykuZGF0YSgneWlpQWN0aXZlRm9ybScpLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgJC5lYWNoKGF0dHJpYnV0ZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbaV1bJ2lkJ10gPT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXR0cmlidXRlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnVuYmluZCgnLnlpaUFjdGl2ZUZvcm0nKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZURhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB2YWxpZGF0ZSBhbGwgYXBwbGljYWJsZSBpbnB1dHMgaW4gdGhlIGZvcm1cbiAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkZm9ybSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgZGF0YSA9ICRmb3JtLmRhdGEoJ3lpaUFjdGl2ZUZvcm0nKSxcbiAgICAgICAgICAgICAgICBuZWVkQWpheFZhbGlkYXRpb24gPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IHt9LFxuICAgICAgICAgICAgICAgIGRlZmVycmVkcyA9IGRlZmVycmVkQXJyYXkoKSxcbiAgICAgICAgICAgICAgICBzdWJtaXR0aW5nID0gZGF0YS5zdWJtaXR0aW5nO1xuXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSAkLkV2ZW50KGV2ZW50cy5iZWZvcmVWYWxpZGF0ZSk7XG4gICAgICAgICAgICAkZm9ybS50cmlnZ2VyKGV2ZW50LCBbbWVzc2FnZXMsIGRlZmVycmVkc10pO1xuICAgICAgICAgICAgaWYgKHN1Ym1pdHRpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Ym1pdHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0RmluYWxpemUoJGZvcm0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjbGllbnQtc2lkZSB2YWxpZGF0aW9uXG4gICAgICAgICAgICAkLmVhY2goZGF0YS5hdHRyaWJ1dGVzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKHRoaXMuaW5wdXQpLmlzKFwiOmRpc2FibGVkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBlcmZvcm0gdmFsaWRhdGlvbiBvbmx5IGlmIHRoZSBmb3JtIGlzIGJlaW5nIHN1Ym1pdHRlZCBvciBpZiBhbiBhdHRyaWJ1dGUgaXMgcGVuZGluZyB2YWxpZGF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Ym1pdHRpbmcgfHwgdGhpcy5zdGF0dXMgPT09IDIgfHwgdGhpcy5zdGF0dXMgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBtZXNzYWdlc1t0aGlzLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzW3RoaXMuaWRdID0gbXNnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gJC5FdmVudChldmVudHMuYmVmb3JlVmFsaWRhdGVBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGZvcm0udHJpZ2dlcihldmVudCwgW3RoaXMsIG1zZywgZGVmZXJyZWRzXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUodGhpcywgZ2V0VmFsdWUoJGZvcm0sIHRoaXMpLCBtc2csIGRlZmVycmVkcywgJGZvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmFibGVBamF4VmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWVkQWpheFZhbGlkYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFqYXggdmFsaWRhdGlvblxuICAgICAgICAgICAgJC53aGVuLmFwcGx5KHRoaXMsIGRlZmVycmVkcykuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBlbXB0eSBtZXNzYWdlIGFycmF5c1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gbWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKDAgPT09IG1lc3NhZ2VzW2ldLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkLmlzRW1wdHlPYmplY3QobWVzc2FnZXMpICYmIG5lZWRBamF4VmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGJ1dHRvbiA9IGRhdGEuc3VibWl0T2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0RGF0YSA9ICcmJyArIGRhdGEuc2V0dGluZ3MuYWpheFBhcmFtICsgJz0nICsgJGZvcm0uYXR0cignaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRidXR0b24gJiYgJGJ1dHRvbi5sZW5ndGggJiYgJGJ1dHRvbi5hdHRyKCduYW1lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dERhdGEgKz0gJyYnICsgJGJ1dHRvbi5hdHRyKCduYW1lJykgKyAnPScgKyAkYnV0dG9uLmF0dHIoJ3ZhbHVlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZGF0YS5zZXR0aW5ncy52YWxpZGF0aW9uVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJGZvcm0uYXR0cignbWV0aG9kJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiAkZm9ybS5zZXJpYWxpemUoKSArIGV4dERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogZGF0YS5zZXR0aW5ncy5hamF4RGF0YVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZvcm0udHJpZ2dlcihldmVudHMuYWpheENvbXBsZXRlLCBbanFYSFIsIHRleHRTdGF0dXNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoanFYSFIsIHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZvcm0udHJpZ2dlcihldmVudHMuYWpheEJlZm9yZVNlbmQsIFtqcVhIUiwgc2V0dGluZ3NdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAobXNncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2dzICE9PSBudWxsICYmIHR5cGVvZiBtc2dzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2goZGF0YS5hdHRyaWJ1dGVzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZW5hYmxlQWpheFZhbGlkYXRpb24gfHwgdGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbXNnc1t0aGlzLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUlucHV0cygkZm9ybSwgJC5leHRlbmQobWVzc2FnZXMsIG1zZ3MpLCBzdWJtaXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVJbnB1dHMoJGZvcm0sIG1lc3NhZ2VzLCBzdWJtaXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Ym1pdHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRGaW5hbGl6ZSgkZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5zdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGF5IGNhbGxiYWNrIHNvIHRoYXQgdGhlIGZvcm0gY2FuIGJlIHN1Ym1pdHRlZCB3aXRob3V0IHByb2JsZW1cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVJbnB1dHMoJGZvcm0sIG1lc3NhZ2VzLCBzdWJtaXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVJbnB1dHMoJGZvcm0sIG1lc3NhZ2VzLCBzdWJtaXR0aW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdWJtaXRGb3JtOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGZvcm0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnZhbGlkYXRlZCkge1xuICAgICAgICAgICAgICAgIC8vIFNlY29uZCBzdWJtaXQncyBjYWxsIChmcm9tIHZhbGlkYXRlL3VwZGF0ZUlucHV0cylcbiAgICAgICAgICAgICAgICBkYXRhLnN1Ym1pdHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSAkLkV2ZW50KGV2ZW50cy5iZWZvcmVTdWJtaXQpO1xuICAgICAgICAgICAgICAgICRmb3JtLnRyaWdnZXIoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5yZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEudmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdEZpbmFsaXplKCRmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1cGRhdGVIaWRkZW5CdXR0b24oJGZvcm0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAgIC8vIGNvbnRpbnVlIHN1Ym1pdHRpbmcgdGhlIGZvcm0gc2luY2UgdmFsaWRhdGlvbiBwYXNzZXNcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgc3VibWl0J3MgY2FsbCAoZnJvbSB5aWkuanMvaGFuZGxlQWN0aW9uKSAtIGV4ZWN1dGUgdmFsaWRhdGluZ1xuICAgICAgICAgICAgICAgIHNldFN1Ym1pdEZpbmFsaXplRGVmZXIoJGZvcm0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2V0dGluZ3MudGltZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZGF0YS5zZXR0aW5ncy50aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEuc3VibWl0dGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgbWV0aG9kcy52YWxpZGF0ZS5jYWxsKCRmb3JtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRGb3JtOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGZvcm0gPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XG4gICAgICAgICAgICAvLyBCZWNhdXNlIHdlIGJpbmQgZGlyZWN0bHkgdG8gYSBmb3JtIHJlc2V0IGV2ZW50IGluc3RlYWQgb2YgYSByZXNldCBidXR0b24gKHRoYXQgbWF5IG5vdCBleGlzdCksXG4gICAgICAgICAgICAvLyB3aGVuIHRoaXMgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZm9ybSBpbnB1dCB2YWx1ZXMgaGF2ZSBub3QgYmVlbiByZXNldCB5ZXQuXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUgd2UgZG8gdGhlIGFjdHVhbCByZXNldCB3b3JrIHRocm91Z2ggc2V0VGltZW91dC5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQuZWFjaChkYXRhLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2l0aG91dCBzZXRUaW1lb3V0KCkgd2Ugd291bGQgZ2V0IHRoZSBpbnB1dCB2YWx1ZXMgdGhhdCBhcmUgbm90IHJlc2V0IHlldC5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGdldFZhbHVlKCRmb3JtLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICRmb3JtLmZpbmQodGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLnJlbW92ZUNsYXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zZXR0aW5ncy52YWxpZGF0aW5nQ3NzQ2xhc3MgKyAnICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuc2V0dGluZ3MuZXJyb3JDc3NDbGFzcyArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zZXR0aW5ncy5zdWNjZXNzQ3NzQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKHRoaXMuZXJyb3IpLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoZGF0YS5zZXR0aW5ncy5lcnJvclN1bW1hcnkpLmhpZGUoKS5maW5kKCd1bCcpLmh0bWwoJycpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgZXJyb3IgbWVzc2FnZXMsIGlucHV0IGNvbnRhaW5lcnMsIGFuZCBvcHRpb25hbGx5IHN1bW1hcnkgYXMgd2VsbC5cbiAgICAgICAgICogSWYgYW4gYXR0cmlidXRlIGlzIG1pc3NpbmcgZnJvbSBtZXNzYWdlcywgaXQgaXMgY29uc2lkZXJlZCB2YWxpZC5cbiAgICAgICAgICogQHBhcmFtIG1lc3NhZ2VzIGFycmF5IHRoZSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzLCBpbmRleGVkIGJ5IGF0dHJpYnV0ZSBJRHNcbiAgICAgICAgICogQHBhcmFtIHN1bW1hcnkgd2hldGhlciB0byB1cGRhdGUgc3VtbWFyeSBhcyB3ZWxsLlxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlTWVzc2FnZXM6IGZ1bmN0aW9uIChtZXNzYWdlcywgc3VtbWFyeSkge1xuICAgICAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBkYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgICAgICAgJC5lYWNoKGRhdGEuYXR0cmlidXRlcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUlucHV0KCRmb3JtLCB0aGlzLCBtZXNzYWdlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlU3VtbWFyeSgkZm9ybSwgbWVzc2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIGVycm9yIG1lc3NhZ2VzIGFuZCBpbnB1dCBjb250YWluZXIgb2YgYSBzaW5nbGUgYXR0cmlidXRlLlxuICAgICAgICAgKiBJZiBtZXNzYWdlcyBpcyBlbXB0eSwgdGhlIGF0dHJpYnV0ZSBpcyBjb25zaWRlcmVkIHZhbGlkLlxuICAgICAgICAgKiBAcGFyYW0gaWQgYXR0cmlidXRlIElEXG4gICAgICAgICAqIEBwYXJhbSBtZXNzYWdlcyBhcnJheSB3aXRoIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVBdHRyaWJ1dGU6IGZ1bmN0aW9uKGlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IG1ldGhvZHMuZmluZC5jYWxsKHRoaXMsIGlkKTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1zZyA9IHt9O1xuICAgICAgICAgICAgICAgIG1zZ1tpZF0gPSBtZXNzYWdlcztcbiAgICAgICAgICAgICAgICB1cGRhdGVJbnB1dCgkKHRoaXMpLCBhdHRyaWJ1dGUsIG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoJGZvcm0sIGF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgJGlucHV0ID0gZmluZElucHV0KCRmb3JtLCBhdHRyaWJ1dGUpO1xuICAgICAgICBpZiAoYXR0cmlidXRlLnZhbGlkYXRlT25DaGFuZ2UpIHtcbiAgICAgICAgICAgICRpbnB1dC5vbignY2hhbmdlLnlpaUFjdGl2ZUZvcm0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGVBdHRyaWJ1dGUoJGZvcm0sIGF0dHJpYnV0ZSwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWxpZGF0ZU9uQmx1cikge1xuICAgICAgICAgICAgJGlucHV0Lm9uKCdibHVyLnlpaUFjdGl2ZUZvcm0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZS5zdGF0dXMgPT0gMCB8fCBhdHRyaWJ1dGUuc3RhdHVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGVBdHRyaWJ1dGUoJGZvcm0sIGF0dHJpYnV0ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWxpZGF0ZU9uVHlwZSkge1xuICAgICAgICAgICAgJGlucHV0Lm9uKCdrZXl1cC55aWlBY3RpdmVGb3JtJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KGUud2hpY2gsIFsxNiwgMTcsIDE4LCAzNywgMzgsIDM5LCA0MF0pICE9PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlLnZhbHVlICE9PSBnZXRWYWx1ZSgkZm9ybSwgYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZUF0dHJpYnV0ZSgkZm9ybSwgYXR0cmlidXRlLCBmYWxzZSwgYXR0cmlidXRlLnZhbGlkYXRpb25EZWxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoJGZvcm0sIGF0dHJpYnV0ZSkge1xuICAgICAgICBmaW5kSW5wdXQoJGZvcm0sIGF0dHJpYnV0ZSkub2ZmKCcueWlpQWN0aXZlRm9ybScpO1xuICAgIH07XG5cbiAgICB2YXIgdmFsaWRhdGVBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoJGZvcm0sIGF0dHJpYnV0ZSwgZm9yY2VWYWxpZGF0ZSwgdmFsaWRhdGlvbkRlbGF5KSB7XG4gICAgICAgIHZhciBkYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuXG4gICAgICAgIGlmIChmb3JjZVZhbGlkYXRlKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGUuc3RhdHVzID0gMjtcbiAgICAgICAgfVxuICAgICAgICAkLmVhY2goZGF0YS5hdHRyaWJ1dGVzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gZ2V0VmFsdWUoJGZvcm0sIHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAyO1xuICAgICAgICAgICAgICAgIGZvcmNlVmFsaWRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFmb3JjZVZhbGlkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5zZXR0aW5ncy50aW1lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoZGF0YS5zZXR0aW5ncy50aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YS5zZXR0aW5ncy50aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGRhdGEuc3VibWl0dGluZyB8fCAkZm9ybS5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJC5lYWNoKGRhdGEuYXR0cmlidXRlcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1cyA9IDM7XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLmZpbmQodGhpcy5jb250YWluZXIpLmFkZENsYXNzKGRhdGEuc2V0dGluZ3MudmFsaWRhdGluZ0Nzc0NsYXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1ldGhvZHMudmFsaWRhdGUuY2FsbCgkZm9ybSk7XG4gICAgICAgIH0sIHZhbGlkYXRpb25EZWxheSA/IHZhbGlkYXRpb25EZWxheSA6IDIwMCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcHJvdG90eXBlIHdpdGggYSBzaG9ydGN1dCBtZXRob2QgZm9yIGFkZGluZyBhIG5ldyBkZWZlcnJlZC5cbiAgICAgKiBUaGUgY29udGV4dCBvZiB0aGUgY2FsbGJhY2sgd2lsbCBiZSB0aGUgZGVmZXJyZWQgb2JqZWN0IHNvIGl0IGNhbiBiZSByZXNvbHZlZCBsaWtlIGBgYHRoaXMucmVzb2x2ZSgpYGBgXG4gICAgICogQHJldHVybnMgQXJyYXlcbiAgICAgKi9cbiAgICB2YXIgZGVmZXJyZWRBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIGFycmF5LmFkZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobmV3ICQuRGVmZXJyZWQoY2FsbGJhY2spKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBlcnJvciBtZXNzYWdlcyBhbmQgdGhlIGlucHV0IGNvbnRhaW5lcnMgZm9yIGFsbCBhcHBsaWNhYmxlIGF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0gJGZvcm0gdGhlIGZvcm0galF1ZXJ5IG9iamVjdFxuICAgICAqIEBwYXJhbSBtZXNzYWdlcyBhcnJheSB0aGUgdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAqIEBwYXJhbSBzdWJtaXR0aW5nIHdoZXRoZXIgdGhpcyBtZXRob2QgaXMgY2FsbGVkIGFmdGVyIHZhbGlkYXRpb24gdHJpZ2dlcmVkIGJ5IGZvcm0gc3VibWlzc2lvblxuICAgICAqL1xuICAgIHZhciB1cGRhdGVJbnB1dHMgPSBmdW5jdGlvbiAoJGZvcm0sIG1lc3NhZ2VzLCBzdWJtaXR0aW5nKSB7XG4gICAgICAgIHZhciBkYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuXG4gICAgICAgIGlmIChzdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3JBdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICAkLmVhY2goZGF0YS5hdHRyaWJ1dGVzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKHRoaXMuaW5wdXQpLmlzKFwiOmRpc2FibGVkXCIpICYmICF0aGlzLmNhbmNlbGxlZCAmJiB1cGRhdGVJbnB1dCgkZm9ybSwgdGhpcywgbWVzc2FnZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQXR0cmlidXRlcy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkZm9ybS50cmlnZ2VyKGV2ZW50cy5hZnRlclZhbGlkYXRlLCBbbWVzc2FnZXMsIGVycm9yQXR0cmlidXRlc10pO1xuXG4gICAgICAgICAgICB1cGRhdGVTdW1tYXJ5KCRmb3JtLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIGlmIChlcnJvckF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2V0dGluZ3Muc2Nyb2xsVG9FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9wID0gJGZvcm0uZmluZCgkLm1hcChlcnJvckF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZS5pbnB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignLCcpKS5maXJzdCgpLmNsb3Nlc3QoJzp2aXNpYmxlJykub2Zmc2V0KCkudG9wO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd3RvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcCA8IHd0b3AgfHwgdG9wID4gd3RvcCArICQod2luZG93KS5oZWlnaHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCh0b3ApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEuc3VibWl0dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvblRhcmdldCA9IGRhdGEuc3VibWl0T2JqZWN0ID8gZGF0YS5zdWJtaXRPYmplY3QuYXR0cignZm9ybXRhcmdldCcpIDogbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoYnV0dG9uVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0YXJnZXQgYXR0cmlidXRlIHRvIGZvcm0gdGFnIGJlZm9yZSBzdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYXR0cigndGFyZ2V0JywgYnV0dG9uVGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJGZvcm0uc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgLy8gcmVzdG9yZSBvcmlnaW5hbCB0YXJnZXQgYXR0cmlidXRlIHZhbHVlXG4gICAgICAgICAgICAgICAgJGZvcm0uYXR0cigndGFyZ2V0JywgZGF0YS50YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJC5lYWNoKGRhdGEuYXR0cmlidXRlcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jYW5jZWxsZWQgJiYgKHRoaXMuc3RhdHVzID09PSAyIHx8IHRoaXMuc3RhdHVzID09PSAzKSkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVJbnB1dCgkZm9ybSwgdGhpcywgbWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHN1Ym1pdEZpbmFsaXplKCRmb3JtKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBoaWRkZW4gZmllbGQgdGhhdCByZXByZXNlbnRzIGNsaWNrZWQgc3VibWl0IGJ1dHRvbi5cbiAgICAgKiBAcGFyYW0gJGZvcm0gdGhlIGZvcm0galF1ZXJ5IG9iamVjdC5cbiAgICAgKi9cbiAgICB2YXIgdXBkYXRlSGlkZGVuQnV0dG9uID0gZnVuY3Rpb24gKCRmb3JtKSB7XG4gICAgICAgIHZhciBkYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpO1xuICAgICAgICB2YXIgJGJ1dHRvbiA9IGRhdGEuc3VibWl0T2JqZWN0IHx8ICRmb3JtLmZpbmQoJzpzdWJtaXQ6Zmlyc3QnKTtcbiAgICAgICAgLy8gVE9ETzogaWYgdGhlIHN1Ym1pc3Npb24gaXMgY2F1c2VkIGJ5IFwiY2hhbmdlXCIgZXZlbnQsIGl0IHdpbGwgbm90IHdvcmtcbiAgICAgICAgaWYgKCRidXR0b24ubGVuZ3RoICYmICRidXR0b24uYXR0cigndHlwZScpID09ICdzdWJtaXQnICYmICRidXR0b24uYXR0cignbmFtZScpKSB7XG4gICAgICAgICAgICAvLyBzaW11bGF0ZSBidXR0b24gaW5wdXQgdmFsdWVcbiAgICAgICAgICAgIHZhciAkaGlkZGVuQnV0dG9uID0gJCgnaW5wdXRbdHlwZT1cImhpZGRlblwiXVtuYW1lPVwiJyArICRidXR0b24uYXR0cignbmFtZScpICsgJ1wiXScsICRmb3JtKTtcbiAgICAgICAgICAgIGlmICghJGhpZGRlbkJ1dHRvbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCc8aW5wdXQ+JykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAkYnV0dG9uLmF0dHIoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICRidXR0b24uYXR0cigndmFsdWUnKVxuICAgICAgICAgICAgICAgIH0pLmFwcGVuZFRvKCRmb3JtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGhpZGRlbkJ1dHRvbi5hdHRyKCd2YWx1ZScsICRidXR0b24uYXR0cigndmFsdWUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdGhlIGlucHV0IGNvbnRhaW5lciBmb3IgYSBwYXJ0aWN1bGFyIGF0dHJpYnV0ZS5cbiAgICAgKiBAcGFyYW0gJGZvcm0gdGhlIGZvcm0galF1ZXJ5IG9iamVjdFxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgb2JqZWN0IHRoZSBjb25maWd1cmF0aW9uIGZvciBhIHBhcnRpY3VsYXIgYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlcyBhcnJheSB0aGUgdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgICAqIEByZXR1cm4gYm9vbGVhbiB3aGV0aGVyIHRoZXJlIGlzIGEgdmFsaWRhdGlvbiBlcnJvciBmb3IgdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbiAoJGZvcm0sIGF0dHJpYnV0ZSwgbWVzc2FnZXMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSAkZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyksXG4gICAgICAgICAgICAkaW5wdXQgPSBmaW5kSW5wdXQoJGZvcm0sIGF0dHJpYnV0ZSksXG4gICAgICAgICAgICBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghJC5pc0FycmF5KG1lc3NhZ2VzW2F0dHJpYnV0ZS5pZF0pKSB7XG4gICAgICAgICAgICBtZXNzYWdlc1thdHRyaWJ1dGUuaWRdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgJGZvcm0udHJpZ2dlcihldmVudHMuYWZ0ZXJWYWxpZGF0ZUF0dHJpYnV0ZSwgW2F0dHJpYnV0ZSwgbWVzc2FnZXNbYXR0cmlidXRlLmlkXV0pO1xuXG4gICAgICAgIGF0dHJpYnV0ZS5zdGF0dXMgPSAxO1xuICAgICAgICBpZiAoJGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgaGFzRXJyb3IgPSBtZXNzYWdlc1thdHRyaWJ1dGUuaWRdLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICRmb3JtLmZpbmQoYXR0cmlidXRlLmNvbnRhaW5lcik7XG4gICAgICAgICAgICB2YXIgJGVycm9yID0gJGNvbnRhaW5lci5maW5kKGF0dHJpYnV0ZS5lcnJvcik7XG4gICAgICAgICAgICBpZiAoaGFzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlLmVuY29kZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICRlcnJvci50ZXh0KG1lc3NhZ2VzW2F0dHJpYnV0ZS5pZF1bMF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRlcnJvci5odG1sKG1lc3NhZ2VzW2F0dHJpYnV0ZS5pZF1bMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLnJlbW92ZUNsYXNzKGRhdGEuc2V0dGluZ3MudmFsaWRhdGluZ0Nzc0NsYXNzICsgJyAnICsgZGF0YS5zZXR0aW5ncy5zdWNjZXNzQ3NzQ2xhc3MpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhkYXRhLnNldHRpbmdzLmVycm9yQ3NzQ2xhc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkZXJyb3IuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyLnJlbW92ZUNsYXNzKGRhdGEuc2V0dGluZ3MudmFsaWRhdGluZ0Nzc0NsYXNzICsgJyAnICsgZGF0YS5zZXR0aW5ncy5lcnJvckNzc0NsYXNzICsgJyAnKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoZGF0YS5zZXR0aW5ncy5zdWNjZXNzQ3NzQ2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXR0cmlidXRlLnZhbHVlID0gZ2V0VmFsdWUoJGZvcm0sIGF0dHJpYnV0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc0Vycm9yO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBlcnJvciBzdW1tYXJ5LlxuICAgICAqIEBwYXJhbSAkZm9ybSB0aGUgZm9ybSBqUXVlcnkgb2JqZWN0XG4gICAgICogQHBhcmFtIG1lc3NhZ2VzIGFycmF5IHRoZSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICovXG4gICAgdmFyIHVwZGF0ZVN1bW1hcnkgPSBmdW5jdGlvbiAoJGZvcm0sIG1lc3NhZ2VzKSB7XG4gICAgICAgIHZhciBkYXRhID0gJGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScpLFxuICAgICAgICAgICAgJHN1bW1hcnkgPSAkZm9ybS5maW5kKGRhdGEuc2V0dGluZ3MuZXJyb3JTdW1tYXJ5KSxcbiAgICAgICAgICAgICR1bCA9ICRzdW1tYXJ5LmZpbmQoJ3VsJykuZW1wdHkoKTtcblxuICAgICAgICBpZiAoJHN1bW1hcnkubGVuZ3RoICYmIG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAkLmVhY2goZGF0YS5hdHRyaWJ1dGVzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNBcnJheShtZXNzYWdlc1t0aGlzLmlkXSkgJiYgbWVzc2FnZXNbdGhpcy5pZF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9ICQoJzxsaS8+Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnNldHRpbmdzLmVuY29kZUVycm9yU3VtbWFyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IudGV4dChtZXNzYWdlc1t0aGlzLmlkXVswXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvci5odG1sKG1lc3NhZ2VzW3RoaXMuaWRdWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRzdW1tYXJ5LnRvZ2dsZSgkdWwuZmluZCgnbGknKS5sZW5ndGggPiAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0VmFsdWUgPSBmdW5jdGlvbiAoJGZvcm0sIGF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgJGlucHV0ID0gZmluZElucHV0KCRmb3JtLCBhdHRyaWJ1dGUpO1xuICAgICAgICB2YXIgdHlwZSA9ICRpbnB1dC5hdHRyKCd0eXBlJyk7XG4gICAgICAgIGlmICh0eXBlID09PSAnY2hlY2tib3gnIHx8IHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICAgIHZhciAkcmVhbElucHV0ID0gJGlucHV0LmZpbHRlcignOmNoZWNrZWQnKTtcbiAgICAgICAgICAgIGlmICghJHJlYWxJbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkcmVhbElucHV0ID0gJGZvcm0uZmluZCgnaW5wdXRbdHlwZT1oaWRkZW5dW25hbWU9XCInICsgJGlucHV0LmF0dHIoJ25hbWUnKSArICdcIl0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAkcmVhbElucHV0LnZhbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICRpbnB1dC52YWwoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZmluZElucHV0ID0gZnVuY3Rpb24gKCRmb3JtLCBhdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9ICRmb3JtLmZpbmQoYXR0cmlidXRlLmlucHV0KTtcbiAgICAgICAgaWYgKCRpbnB1dC5sZW5ndGggJiYgJGlucHV0WzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2RpdicpIHtcbiAgICAgICAgICAgIC8vIGNoZWNrYm94IGxpc3Qgb3IgcmFkaW8gbGlzdFxuICAgICAgICAgICAgcmV0dXJuICRpbnB1dC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICRpbnB1dDtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pKHdpbmRvdy5qUXVlcnkpO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIC8qIHNtb290aCBzY3JvbGxpbmcgZm9yIHNjcm9sbCB0byB0b3AgKi9cbiAgICAkKCcuc2Nyb2xsLXRvcCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnYm9keSxodG1sJykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiAwfSwgMTAwMCk7XG4gICAgfSlcblxuICAgIC8qIGhpZ2hsaWdodCB0aGUgdG9wIG5hdiBhcyBzY3JvbGxpbmcgb2NjdXJzICovXG4gICAgJCgnYm9keScpLnNjcm9sbHNweSh7dGFyZ2V0OiAnI25hdmJhcid9KVxuXG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiY2FudmFzXCIpLndpZHRoKCQod2luZG93KS53aWR0aCgpKTtcbiAgICB9O1xuXG4gICAgJChkb2N1bWVudCkuYmluZCgndG91Y2htb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiY2FudmFzXCIpLmNzcyhcbiAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2Zvcm1cIixcbiAgICAgICAgICAgIFwidHJhbnNsYXRleSgtXCIgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4KVwiKTtcbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLmJpbmQoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiY2FudmFzXCIpLmNzcyhcbiAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2Zvcm1cIixcbiAgICAgICAgICAgIFwidHJhbnNsYXRleSgtXCIgKyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4KVwiKTtcbiAgICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
