
"use strict";

var exec = require('cordova/exec');

/**
 * Kandy PhoneGap Plugin interface.
 *
 * See [README](https://github.com/Kandy-IO/kandy-phonegap/blob/master/doc/index.md) for more details.
 */
var Kandy = {

    Widgets: {
        PROVISIONING: "provisioning",
        ACCESS: "access",
        CALL: "call",
        CHAT: "chat"
    },

    DeviceContactsFilter: {
        ALL: "ALL",
        IS_FAVORITE: "IS_FAVORITE",
        HAS_PHONE_NUMBER: "HAS_PHONE_NUMBER",
        HAS_EMAIL_ADDRESS: "HAS_EMAIL_ADDRESS"
    },

    DomainContactFilter: {
        ALL: "ALL",
        FIRST_AND_LAST_NAME: "FIRST_AND_LAST_NAME",
        USER_ID: "USER_ID",
        PHONE: "PHONE"
    },

    ThumbnailSize: {
        LARGE: "LARGE",
        MEDIUM: "MEDIUM",
        SMALL: "SMALL"
    },

    ConnectionState: {
        UNKNOWN: "UNKNOWN",
        DISCONNECTED: "DISCONNECTED",
        CONNECTED: "CONNECTED",
        DISCONNECTING: "DISCONNECTING",
        CONNECTING: "CONNECTING",
        FAILED: "FAILED"
    },

    CallState: {
        INITIAL: "INITIAL",
        RINGING: "RINGING",
        DIALING: "DIALING",
        TALKING: "TALKING",
        TERMINATED: "TERMINATED",
        ON_DOUBLE_HOLD: "ON_DOUBLE_HOLD",
        REMOTELY_HELD: "REMOTELY_HELD",
        ON_HOLD: "ON_HOLD"
    },

    ConnectionType: {
        NONE: "NONE",
        MOBILE: "MOBILE",
        WIFI: "WIFI",
        ALL: "ALL"
    },

    //*** LISTENERS ***//
    // TODO: not complete yet
    connectServiceNotificationCallback: function(args){},
    callServiceNotificationCallback: function(args){},
    addressBookServiceNotificationCallback: function(args){},
    chatServiceNotificationCallback: function(args){},
    groupServiceNotificationCallback: function(args){},

    //*** LOGIC ***//

    /**
     * Initialize Kandy SDK.
     *
     * @param config The Kandy plugin configurations.
     */
    initialize: function (config) {
        this._setupKandyPluginWithConfig(config);
        this._registerNotificationListeners();
        this._renderKandyWidgets();
    },

    /**
     * Setup kandy plugin
     *
     * @param config The configurations
     * @private
     */
    _setupKandyPluginWithConfig: function(config) {
        // TODO: not complete yet
    },

    /**
     * Default chat service notification callback.
     *
     * @param args The callback parameter.
     * @private
     */
    _chatServiceNotificationPluginCallback: function (args) {
        // TODO: not complete yet
        switch (args.action) {
            case "_onChatReceived":
                Kandy._onChatReceived(args.data);
                break;
            case "onChatDelivered":
                // TODO: not complete yet
                break;
            default :
        }
    },

    /**
     * Register notification listeners.
     *
     * @param listeners The notification listeners.
     * @private
     */
    _registerNotificationListeners: function () {
        exec(this.connectServiceNotificationCallback, null, "KandyPlugin", "connectServiceNotificationCallback", []);
        exec(this.callServiceNotificationCallback, null, "KandyPlugin", "callServiceNotificationCallback", []);
        exec(this.addressBookServiceNotificationCallback, null, "KandyPlugin", "addressBookServiceNotificationCallback", []);
        exec(this.chatServiceNotificationCallback, null, "KandyPlugin", "chatServiceNotificationCallback", []);
        exec(this.groupServiceNotificationCallback, null, "KandyPlugin", "groupServiceNotificationCallback", []);

        exec(this._chatServiceNotificationPluginCallback, null, "KandyPlugin", "chatServiceNotificationPluginCallback", []);
    },

    /**
     * Render Kandy widgets.
     *
     * @private
     */
    _renderKandyWidgets: function () {
        var widgets = document.getElementsByTagName("kandy");
        for (var i = 0; i < widgets.length; ++i) {
            var name = widgets[i].getAttribute("widget");
            switch (name) {
                case this.Widgets.PROVISIONING:
                    this._renderKandyProvisioningWidget(widgets[i]);
                    break;
                case this.Widgets.ACCESS:
                    this._renderKandyAccessWidget(widgets[i]);
                    break;
                case this.Widgets.CALL:
                    this._renderKandyCallWidget(widgets[i]);
                    break;
                case this.Widgets.CHAT:
                    this._renderKandyChatWidget(widgets[i]);
                    break;
                default:
                    break;
            }
        }
    },

    /**
     * Default success action callback.
     *
     * @param success The success parameter.
     * @private
     */
    _defaultSuccessAction: function (success) {
        // nothing to do
    },

    /**
     * Default error action callback.
     *
     * @param error The error parameter.
     * @private
     */
    _defaultErrorAction: function (error) {
        console.log(error), alert(error); // default action
    },

    /**
     * Get function from element and trigger it.
     *
     * @param element The element widget.
     * @param action The action name.
     * @param val The value of the parameter which is passed to function.
     * @param callback The default action would be used if the function was not found.
     * @private
     */
    _callFunctionByAction: function (element, action, val, callback) {
        var fn = element.getAttribute(action);

        if (fn != undefined && fn != "" && fn != '') {
            fn = window[fn];
            if (typeof fn === "function") {
                fn(val);
            }
        } else if (callback != undefined) {
            callback(val);
        }
    },

    /**
     * Call success action from element.
     *
     * @param element The element widget.
     * @param val The value of the parameter which is passed to function.
     * @param callback The default action would be used if the function was not found.
     * @private
     */
    _callSuccessFunction: function (element, fn, val, callback) {
        this._callFunctionByAction(element, fn + "-success", val, callback);
    },

    /**
     * Call error function from element.
     *
     * @param element The element widget.
     * @param val The value of the parameter which is passed to function.
     * @param callback The default action would be used if the function was not found.
     * @private
     */
    _callErrorFunction: function (element, fn, val, callback) {
        this._callFunctionByAction(element, fn + "-error", val, callback);
    },

    /**
     * Get next id of the element.
     *
     * @param element The element of the widget.
     * @private
     */
    _getIdOrGenerateNextId: function(element) {
        var id = element.getAttribute("id");
        if (id == undefined || id == ""){
            var idx = -1;
            var prefix = "kandy";
            var name = element.getAttribute("widget");

            do {
                ++idx;
                id = prefix + "-" + name + "-" + idx;
            } while(document.getElementById(id) != undefined);
        }

        element.setAttribute("id", id);

        return id;
    },

    /**
     * Render provisioning widget.
     *
     * @param element The element of the provisioning widget.
     * @private
     */
    _renderKandyProvisioningWidget: function (element) {
        if (element == undefined) return;

        var id = this._getIdOrGenerateNextId(element);

        var request = function () {
            element.innerHTML += '<input type="tel" id="' + id + '-phone-number" placeholder="Enter your number" />'
            + '<input type="text" id="' + id + '-region-code" placeholder="code" maxlength=2/>'
            + '<button id = "' + id + '-btn-request">Request code</button>';

            document.getElementById(id + '-btn-request').onclick = function (event) {
                var number = document.getElementById(id + '-phone-number').value,
                    code = document.getElementById(id + '-region-code').value;

                Kandy.provisioning.requestCode(function (s) {
                    Kandy._callSuccessFunction(element, "request", s, Kandy._defaultSuccessAction);
                }, function (e) {
                    Kandy._callErrorFunction(element, "request", e, Kandy._defaultErrorAction);
                }, number, code);
            }
        };

        var validate = function () {
            element.innerHTML += '<input type="text" id="' + id + '-otp-code" placeholder="Enter the OTP code" />'
            + '<button id="' + id + '-btn-validate">Validate</button>';

            document.getElementById(id + '-btn-validate').onclick = function (event) {
                var number = document.getElementById(id + '-phone-number').value,
                    code = document.getElementById(id + '-region-code').value,
                    otp = document.getElementById(id + '-otp-code').value;

                Kandy.provisioning.validate(function (s) {
                    Kandy._callSuccessFunction(element, "validate", s, Kandy._defaultSuccessAction);
                }, function (e) {
                    Kandy._callErrorFunction(element, "validate", e, Kandy._defaultErrorAction);
                }, number, otp, code);
            }
        };

        var deactivate = function () {
            element.innerHTML += '<button id="' + id + '-btn-deactivate">Deactivate</button>';

            document.getElementById(id + '-btn-deactivate').onclick = function (event) {
                Kandy.provisioning.deactivate(function (s) {
                    Kandy._callSuccessFunction(element, "deactivate", s, Kandy._defaultSuccessAction);
                }, function (e) {
                    Kandy._callErrorFunction(element, "deactivate", e, Kandy._defaultErrorAction);
                })
            }
        }

        var action = element.getAttribute("action");
        switch (action) {
            case "request":
                request();
                break;
            case "validate":
                validate();
                break;
            case "deactivate":
                deactivate();
                break;
            default:
                // Render all
                request();
                validate();
                deactivate();
                break;
        }
    },

    /**
     * Render access widget.
     *
     * @param element The element of the access widget.
     * @private
     */
    _renderKandyAccessWidget: function (element) {
        if (element == undefined) return;

        var id = this._getIdOrGenerateNextId(element);

        var loginForm = '<input type="text" id="' + id + '-username" placeholder="userID@domain.com"/>'
            + '<input type="password" id="' + id + '-password" placeholder="Password"/>'
            + '<button id="' + id + '-btn-login">Login</button>';
        var logoutForm = function (user) {
            return '<button id="' + id + '-btn-logout">' + user + '</button>';
        }

        var addLogoutAction = function () {
            document.getElementById(id + '-btn-logout').onclick = function (event) {
                Kandy.access.logout(function (s) {
                    element.innerHTML = loginForm;
                    addLoginAction();
                    Kandy._callSuccessFunction(element, "logout", s, Kandy._defaultSuccessAction);
                }, function (e) {
                    Kandy._callErrorFunction(element, "logout", e, Kandy._defaultErrorAction);
                })
            }
        }

        var addLoginAction = function () {
            document.getElementById(id + '-btn-login').onclick = function (event) {
                var username = document.getElementById(id + '-username').value,
                    password = document.getElementById(id + '-password').value;

                Kandy.access.login(function (s) {
                        element.innerHTML = logoutForm(username);
                        addLogoutAction();
                        Kandy._callSuccessFunction(element, "login", s, Kandy._defaultSuccessAction);
                    }, function (e) {
                        Kandy._callErrorFunction(element, "login", e, Kandy._defaultErrorAction);
                    }, username, password
                )
            }
        }

        element.innerHTML = loginForm;
        addLoginAction();
    },

    /**
     * Render call widget.
     *
     * @param element The element of the call widget.
     * @private
     */
    _renderKandyCallWidget: function (element) {
        if (element == undefined) return;

        var id = this._getIdOrGenerateNextId(element);

        var callType = element.getAttribute("call-type");

        if (callType == 'pstn' || callType == 'PSTN') {
            element.innerHTML = '<input type="text" id="' + id + '-callee" placeholder="Number phone"/>'
            + '<button id="' + id + '-btn-pstn-call">Call</button>';

            document.getElementById(id + '-btn-pstn-call').onclick = function (event) {
                var username = document.getElementById(id + '-callee').value;

                Kandy.call.createPSTNCall(function (s) {
                        Kandy._callSuccessFunction(element, "call", s, Kandy._defaultSuccessAction);
                    }, function (e) {
                        Kandy._callErrorFunction(element, "call", e, Kandy._defaultErrorAction);
                    }, username
                );
            }
        } else {
            element.innerHTML = '<input type="text" id="' + id + '-callee" placeholder="userID@domain.com"/>'
            + '<label><input type="checkbox" id="' + id + '-start-with-video"/>Start with video</label>'
            + '<button id="' + id + '-btn-voip-call">Call</button>';

            document.getElementById(id + '-btn-voip-call').onclick = function (event) {
                var username = document.getElementById(id + '-callee').value,
                    startWithVideo = document.getElementById(id + '-start-with-video').checked == true ? 1 : 0;

                Kandy.call.createVoipCall(function (s) {
                        Kandy._callSuccessFunction(element, "call", s, Kandy._defaultSuccessAction);
                    }, function (e) {
                        Kandy._callErrorFunction(element, "call", e, Kandy._defaultErrorAction);
                    }, username, startWithVideo
                );
            }
        }
    },

    /**
     * Render chat widget.
     *
     * @param element The element of the chat widget.
     * @private
     */
    _renderKandyChatWidget: function (element) {
        // Register message received
        this._onChatReceived = function (message) {
            var msg = message.message;
            if ($("#" + msg.UUID).length) {
                return;
            }
            var item = '<li onClick="js:Kandy.markMessageAsReceived(\'' + msg.UUID + '\')"><h3>' + msg.sender + '</h3><p id="' + msg.UUID + '"><strong>' + msg.message.text + '</strong></p><p>' + msg.timestamp + '</p></li>';
            messages.innerHTML = item + messages.innerHTML;
        }

        if (element == undefined) return;

        var id = this._getIdOrGenerateNextId(element);

        element.innerHTML = '<input type="text" id="' + id + '-recipient" placeholder="recipientID@domain.com"/>'
        + '<input type="text" id="' + id + '-message" placeholder="Message"/>'
        + '<button id="' + id + '-btn-send">Send</button>'
        + '<button id="' + id + '-btn-send-sms">Send SMS</button>'
        + '<button id="' + id + '-btn-pull">Pull pending events</button>'
        + '<div id="' + id + '-messages"></div>';

        var messages = document.getElementById(id + '-messages');


        document.getElementById(id + '-btn-send').onclick = function (event) {
            var recipient = document.getElementById(id + '-recipient').value,
                message = document.getElementById(id + '-message').value;

            Kandy.chat.sendChat(function (s) {
                Kandy._callSuccessFunction(element, "send", s, Kandy._defaultSuccessAction);
                var item = '<li><h3>You: </h3><p>' + message + '</p><p></p></li>';
                messages.innerHTML = item + messages.innerHTML;
            }, function (e) {
                Kandy._callErrorFunction(element, "send", e, Kandy._defaultErrorAction);
            }, recipient, message)

        }

        document.getElementById(id + '-btn-send-sms').onclick = function (event) {
            var recipient = document.getElementById(id + '-recipient').value,
                message = document.getElementById(id + '-message').value;

            Kandy.chat.sendSMS(function (s) {
                Kandy._callSuccessFunction(element, "send-sms", s, Kandy._defaultSuccessAction);
            }, function (e) {
                Kandy._callErrorFunction(element, "send-sms", e, Kandy._defaultErrorAction);
            }, recipient, message)
        }

        document.getElementById(id + '-btn-pull').onclick = function (event) {
            Kandy.chat.pullEvents(function (s) {
                Kandy._callSuccessFunction(element, "pull", s, Kandy._defaultSuccessAction);
            }, function (e) {
                Kandy._callErrorFunction(element, "pull", e, Kandy._defaultErrorAction);
            });
        }
    },

    /**
     * Notify message read.
     *
     * @param uuid The UUID of the message.
     */
    markMessageAsReceived: function (uuid) {
        Kandy.chat.markAsReceived(function () {
            // Mark as read
            var message = $("#" + uuid).text();
            $("#" + uuid).html(message);
        }, function (e) {
            Kandy._defaultErrorAction(e);
        }, uuid);
    },

    //*** PROVISIONING SERVICE ***//
    provisioning: {

        /**
         * Request code for verification and registration process.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param phoneNumber The user phone number.
         * @param countryCode The two letter ISO country code.
         */
        requestCode: function (success, error, phoneNumber, countryCode) {
            exec(success, error, "KandyPlugin", "provisioning:request", [phoneNumber, countryCode]);
        },

        /**
         * Validation of the signed up phone number send received code to the server.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param phoneNumber The user phone number.
         * @param otp The OTP code.
         * @param countryCode The two letter ISO country code.
         */
        validate: function (success, error, phoneNumber, otp, countryCode) {
            exec(success, error, "KandyPlugin", "provisioning:validate", [phoneNumber, otp, countryCode]);
        },

        /**
         * Signing off the registered account (phone number) from a Kandy.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        deactivate: function (success, error) {
            exec(success, error, "KandyPlugin", "provisioning:deactivate", []);
        }
    },

    //*** ACCESS SERVICE ***//
    access: {

        /**
         * Register/login the user on the server with credentials received from admin.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param username The username to login
         * @param password The password to login
         */
        login: function (success, error, username, password) {
            exec(success, error, "KandyPlugin", "login", [username, password]);
        },

        /**
         * This method unregisters user from the Kandy server.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        logout: function (success, error) {
            exec(success, error, "KandyPlugin", "logout", []);
        },

        /**
         * Get the current state.
         *
         * @param success The success callback function.
         */
        getConnectionState: function (success) {
            exec(success, null, "KandyPlugin", "getConnectionState", []);
        },

        /**
         * Get current session.
         *
         * @param success The success callback function.
         */
        getSession: function (success) {
            exec(success, null, "KandyPlugin", "getSession", []);
        }

    },

    //*** CALL SERVICE ***//
    call: {

        /**
         * Create a voip call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param user The id of callee.
         * @param startWithVideo Start the call with video call enabled.
         */
        createVoipCall: function (success, error, user, startWithVideo) {
            exec(success, error, "KandyPlugin", "call:createVoipCall", [user, startWithVideo]);
        },

        /**
         * Create a PSTN call
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param phoneNumber The user phone number
         */
        createPSTNCall: function (success, error, phoneNumber) {
            exec(success, error, "KandyPlugin", "call:createPSTNCall", [phoneNumber]);
        },

        /**
         * Hangup current call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        hangup: function (success, error) {
            exec(success, error, "KandyPlugin", "call:hangup", []);
        },

        /**
         * Mute current call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        mute: function (success, error) {
            exec(success, error, "KandyPlugin", "call:mute", []);
        },

        /**
         * Unmute current call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        unmute: function (success, error) {
            exec(success, error, "KandyPlugin", "call:unmute", []);
        },

        /**
         * Hold current call
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        hold: function (success, error) {
            exec(success, error, "KandyPlugin", "call:hold", []);
        },

        /**
         * Unhold current call
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        unhold: function (success, error) {
            exec(success, error, "KandyPlugin", "call:unhold", []);
        },

        /**
         * Enable sharing video.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        enableVideo: function (success, error) {
            exec(success, error, "KandyPlugin", "call:enableVideo", []);
        },

        /**
         * Disable sharing video.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        disableVideo: function (success, error) {
            exec(success, error, "KandyPlugin", "call:disableVideo", []);
        },

        /**
         * Accept current coming call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        accept: function (success, error) {
            exec(success, error, "KandyPlugin", "call:accept", []);
        },

        /**
         * Reject current coming call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        reject: function (success, error) {
            exec(success, error, "KandyPlugin", "call:reject", []);
        },

        /**
         * Ignore current coming call.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        ignore: function (success, error) {
            exec(success, error, "KandyPlugin", "call:ignore", []);
        }
    },

    //*** CHAT SERVICE ***/
    chat: {

        /**
         * Send the message to recipient.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message/
         * @param message The message to send.
         */
        sendChat: function (success, error, recipient, message) {
            exec(success, error, "KandyPlugin", "chat:sendChat", [recipient, message]);
        },

        /**
         * Send the message to recipient.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param message The message to send.
         */
        sendSMS: function (success, error, recipient, message) {
            exec(success, error, "KandyPlugin", "chat:sendSMS", [recipient, message]);
        },

        /**
         * Send a audio file
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param uri The URI of the file.
         */
        sendAudio: function (success, error, recipient, caption, uri) {
            exec(success, error, "KandyPlugin", "chat:sendAudio", [recipient, caption, uri]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param uri The URI of the file.
         */
        sendVideo: function (success, error, recipient, caption, uri) {
            exec(success, error, "KandyPlugin", "chat:sendVideo", [recipient, caption, uri]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param uri The URI of the file.
         */
        sendImage: function (success, error, recipient, caption, uri) {
            exec(success, error, "KandyPlugin", "chat:sendImage", [recipient, caption, uri]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param uri The URI of the file.
         */
        sendFile: function (success, error, recipient, caption, uri) {
            exec(success, error, "KandyPlugin", "chat:sendFile", [recipient, caption, uri]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param uri The URI of the file.
         */
        sendContact: function (success, error, recipient, caption, uri) {
            exec(success, error, "KandyPlugin", "chat:sendContact", [recipient, caption, uri]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         */
        sendCurrentLocation: function (success, error, recipient, caption) {
            exec(success, error, "KandyPlugin", "chat:sendCurrentLocation", [recipient, caption]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param recipient The destination of the message.
         * @param caption The caption of the file.
         * @param location The location to send.
         */
        sendLocation: function (success, error, recipient, caption, location) {
            exec(success, error, "KandyPlugin", "chat:sendLocation", [recipient, caption, location]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param uuid The UUID of the message.
         */
        cancelMediaTransfer: function (success, error, uuid) {
            exec(success, error, "KandyPlugin", "chat:cancelMediaTransfer", [uuid]);
        },

        /**
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param uuid The UUID of the message.
         */
        downloadMedia: function (success, error, uuid) {
            exec(success, error, "KandyPlugin", "chat:downloadMedia", [uuid]);
        },

        /**
         *
         * Get a thumbnail of the media message.
         * @param success The success callback function.
         * @param error The error callback function.
         * @param uuid The UUID of the message.
         */
        downloadMediaThumbnail: function (success, error, uuid, thumbnailSize) {
            exec(success, error, "KandyPlugin", "chat:downloadMediaThumbnail", [uuid, thumbnailSize]);
        },

        /**
         * Send ack to sever for UUID of received/handled message(s).
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param uuid The UUID of the message.
         */
        markAsReceived: function (success, error, uuid) {
            exec(success, error, "KandyPlugin", "chat:markAsReceived", [uuid]);
        },

        /**
         * Pull pending events from Kandy service.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        pullEvents: function (success, error) {
            exec(success, error, "KandyPlugin", "chat:pullEvents", []);
        }
    },

    // *** GROUP SERVICE ***//
    group: {

        /**
         * Create a new group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param name The name of the group to create.
         */
        createGroup: function (success, error, name) {
            exec(success, error, "KandyPlugin", "group:createGroup", [name]);
        },

        /**
         * Get group list of user.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        getMyGroups: function (success, error) {
            exec(success, error, "KandyPlugin", "group:getMyGroups", []);
        },

        /**
         * Get group detail by group id.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        getGroupById: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:getGroupById", [id]);
        },

        /**
         * Update group name.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param newName The new name of the group.
         */
        updateGroupName: function (success, error, id, newName) {
            exec(success, error, "KandyPlugin", "group:updateGroupName", [id, newName]);
        },

        /**
         * Update group image.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param uri The uri of the image.
         */
        updateGroupImage: function (success, error, id, uri) {
            exec(success, error, "KandyPlugin", "group:updateGroupImage", [id, uri]);
        },

        /**
         * Remove group image.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        removeGroupImage: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:removeGroupImage", [id]);
        },

        /**
         * Get the group image.
         * TODO: Customable thumbnail size.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        downloadGroupImage: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:downloadGroupImage", [id]);
        },

        /**
         * Get thumbnail group image.
         * TODO: Customable thumbnail size.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        downloadGroupImageThumbnail: function (success, error, id, thumbnailSize) {
            exec(success, error, "KandyPlugin", "group:downloadGroupImageThumbnail", [id, thumbnailSize]);
        },

        /**
         * Mute the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        muteGroup: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:muteGroup", [id]);
        },

        /**
         * Unmute the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        unmuteGroup: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:unmuteGroup", [id]);
        },

        /**
         * Destroy the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        destroyGroup: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:destroyGroup", [id]);
        },

        /**
         * Leave the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         */
        leaveGroup: function (success, error, id) {
            exec(success, error, "KandyPlugin", "group:leaveGroup", [id]);
        },

        /**
         * Remove participants of the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param participants The uri list of the participants.
         */
        removeParticipants: function (success, error, id, participants) {
            exec(success, error, "KandyPlugin", "group:removeParticipants", [id, participants]);
        },

        /**
         * Mute participants of the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param participants The uri list of the participants.
         */
        muteParticipants: function (success, error, id, participants) {
            exec(success, error, "KandyPlugin", "group:muteParticipants", [id, participants]);
        },

        /**
         * Unmute participants of the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param participants The uri list of the participants.
         */
        unmuteParticipants: function (success, error, id, participants) {
            exec(success, error, "KandyPlugin", "group:unmuteParticipants", [id, participants]);
        },

        /**
         * Add participants to the group.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param id The id of the group.
         * @param participants The uri list of the participants.
         */
        addParticipants: function (success, error, id, participants) {
            exec(success, error, "KandyPlugin", "group:addParticipants", [id, participants]);
        }

    },

    //*** PRESENCE SERVICE ***//
    presence: {

        /**
         * Register listener for presence's callbacks/notifications.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param userList The id list of users.
         */
        startWatch: function (success, error, userList) {
            exec(success, error, "KandyPlugin", "presence", userList);
        }
    },

    //*** LOCATION SERVICE ***//
    location: {

        /**
         * Get the country info.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        getCountryInfo: function (success, error) {
            exec(success, error, "KandyPlugin", "location:getCountryInfo", []);
        },

        /**
         * Get current location.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        getCurrentLocation: function (success, error) {
            exec(success, error, "KandyPlugin", "location:getCurrentLocation", []);
        }
    },

    //*** PUSH SERVICE ***//
    push: {

        /**
         * Enable the push service.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        enable: function (success, error) {
            exec(success, error, "KandyPlugin", "push:enable", []);
        },

        /**
         * Disable the push service.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         */
        disable: function (success, error) {
            exec(success, error, "KandyPlugin", "push:disable", []);
        }
    },

    //*** ADDRESS BOOK SERVICE ***//
    addressBook: {

        /**
         * Get the contacts list from user device.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param filters The {@link DeviceContactsFilter} array to use.
         */
        getDeviceContacts: function (success, error, filters) {
            exec(success, error, "KandyPlugin", "addressBook:getDeviceContacts", [filters]);
        },

        /**
         * Get the contacts list from the host domain.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param filter The {@link DomainContactFilter} to use.
         */
        getDomainContacts: function (success, error, filter) {
            exec(success, error, "KandyPlugin", "addressBook:getDomainContacts", [filter]);
        },

        /**
         * Get the filterd contacts list from the host domain.
         *
         * @param success The success callback function.
         * @param error The error callback function.
         * @param filter The {@link DomainContactFilter} to search.
         * @param searchString The search string.
         */
        getFilteredDomainDirectoryContacts: function(success, error, filter, searchString) {
            exec(success, error, "KandyPlugin", "addressBook:getFilteredDomainDirectoryContacts", [filter, searchString]);
        }
    }
};

module.exports = Kandy;