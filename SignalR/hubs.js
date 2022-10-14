/*!
 * ASP.NET SignalR JavaScript Library v2.2.1
 * http://signalr.net/
 *
 * Copyright (c) .NET Foundation. All rights reserved.
 * Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
 *
 */

/// <reference path="..\..\SignalR.Client.JS\Scripts\jquery-1.6.4.js" />
/// <reference path="jquery.signalR.js" />
(function ($, window, undefined) {
    /// <param name="$" type="jQuery" />
    "use strict";

    if (typeof ($.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js.");
    }

    var signalR = $.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, $.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                } else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!$.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
                    }
                }
            }
        }
    }

    $.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies['chattingHub'] = this.createHubProxy('chattingHub'); 
        proxies['chattingHub'].client = { };
        proxies['chattingHub'].server = {
            checkEndUserConnted: function (adminId, userId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["CheckEndUserConnted"], $.makeArray(arguments)));
             },

            connectAdminUser: function (userId, chatUserLimit, isConneted) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["ConnectAdminUser"], $.makeArray(arguments)));
             },

            connectEndUser: function (userId, isAuthenticated) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["ConnectEndUser"], $.makeArray(arguments)));
             },

            disconnectAdminUser: function (userId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["DisconnectAdminUser"], $.makeArray(arguments)));
             },

            disconnectEndUser: function (userId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["DisconnectEndUser"], $.makeArray(arguments)));
             },

            getOnlineUsers: function () {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["GetOnlineUsers"], $.makeArray(arguments)));
             },

            hideShowTyping: function (fromId, toId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["HideShowTyping"], $.makeArray(arguments)));
             },

            sendToAdmin: function (from, to, msg, userName, isGuest, email) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["SendToAdmin"], $.makeArray(arguments)));
             },

            sendToUser: function (isGuest, from, to, message, adminName) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["SendToUser"], $.makeArray(arguments)));
             },

            sessionEndedByAdmin: function (adminId, userId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["SessionEndedByAdmin"], $.makeArray(arguments)));
             },

            setRead: function (fromId, toId) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["SetRead"], $.makeArray(arguments)));
             },

            showTyping: function (fromId, toId, userName) {
                return proxies['chattingHub'].invoke.apply(proxies['chattingHub'], $.merge(["ShowTyping"], $.makeArray(arguments)));
             }
        };

        proxies['loginHub'] = this.createHubProxy('loginHub'); 
        proxies['loginHub'].client = { };
        proxies['loginHub'].server = {
            connect: function (userId, isAdmin) {
                return proxies['loginHub'].invoke.apply(proxies['loginHub'], $.merge(["Connect"], $.makeArray(arguments)));
             },

            isUserLoggedIn: function (userId) {
                return proxies['loginHub'].invoke.apply(proxies['loginHub'], $.merge(["IsUserLoggedIn"], $.makeArray(arguments)));
             },

            removeUserFromConnetedUsers: function (userId, connectionId) {
                return proxies['loginHub'].invoke.apply(proxies['loginHub'], $.merge(["RemoveUserFromConnetedUsers"], $.makeArray(arguments)));
             }
        };

        proxies['notificationHub'] = this.createHubProxy('notificationHub'); 
        proxies['notificationHub'].client = { };
        proxies['notificationHub'].server = {
            connect: function (userId) {
                return proxies['notificationHub'].invoke.apply(proxies['notificationHub'], $.merge(["Connect"], $.makeArray(arguments)));
             },

            getNotificationCount: function (userId) {
                return proxies['notificationHub'].invoke.apply(proxies['notificationHub'], $.merge(["GetNotificationCount"], $.makeArray(arguments)));
             },

            setReadNotification: function (userId) {
                return proxies['notificationHub'].invoke.apply(proxies['notificationHub'], $.merge(["SetReadNotification"], $.makeArray(arguments)));
             }
        };

        return proxies;
    };

    signalR.hub = $.hubConnection("/signalr", { useDefaultPath: false });
    $.extend(signalR, signalR.hub.createHubProxies());

}(window.jQuery, window));