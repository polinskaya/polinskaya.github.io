(function (namespace) {
    'use strict';

    /**
     * РџСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ РёРјРµРЅ РґР»СЏ РєР»Р°СЃСЃРѕРІ Рё РјРµС‚РѕРґРѕРІ Р±РёР±Р»РёРѕС‚РµРєРё Yandex.Speechkit JS
     * @namespace ya.speechkit
     */
    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    namespace.ya.speechkit.AudioContext = window.AudioContext || window.webkitAudioContext;

    if (typeof namespace.ya.speechkit.settings === 'undefined') {
        var js = document.createElement('script');

        js.type = 'text/javascript';
        js.src = 'https://webasr.yandex.net/jsapi/v1/webspeechkit-settings.js?seed=' + Math.random();

        document.head.appendChild(js);
    }

    /** РќР°Р±РѕСЂ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„РѕСЂРјР°С‚РѕРІ Р°СѓРґРёРѕ.
     * @readonly
     * @enum
     * @memberof ya.speechkit
     */
    namespace.ya.speechkit.FORMAT = {
        /** PCM 8KHz РґР°РµС‚ РїР»РѕС…РѕРµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ, РЅРѕ РјР°Р»С‹Р№ РѕР±СЉРµРј РїРµСЂРµРґР°РІР°РµРјС‹С… РЅР° СЃРµСЂРІРµСЂ РґР°РЅРЅС‹С… */
        PCM8: {format: 'pcm', sampleRate: 8000, mime: 'audio/x-pcm;bit=16;rate=8000', bufferSize: 1024},
        /** PCM 16 KHz РЅР°РёР»СѓС‡С€РµРµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РїСЂРё СЃСЂРµРґРЅРµРј РѕР±СЉРµРјРµ РґР°РЅРЅС‹С… */
        PCM16: {format: 'pcm', sampleRate: 16000, mime: 'audio/x-pcm;bit=16;rate=16000', bufferSize: 2048},
        /** PCM 44 KHz Р±РѕР»СЊС€РѕР№ СЂР°Р·РјРµСЂ РїРµСЂРµРґР°РІР°РµРјС‹С… РґР°РЅРЅС‹С…, РІРѕР·РјРѕР¶РЅС‹ Р·Р°РґРµСЂР¶РєРё РЅР° СѓР·РєРѕРј РєР°РЅР°Р»Рµ */
        PCM44: {format: 'pcm', sampleRate: 44100, mime: 'audio/x-pcm;bit=16;rate=44100', bufferSize: 4096},
    };

    if (typeof MediaRecorder != 'undefined') {
        var isMimeSupported = MediaRecorder.isTypeSupported || 
                                MediaRecorder.isMimeTypeSupported || 
                                MediaRecorder.canRecordMimeType || 
                                function (e) { return false};
        if (isMimeSupported('audio/ogg; codecs=opus')) {
            /** РџРѕРґРґРµСЂР¶РєР° OPUS РІ РєРѕРЅС‚РµР№РЅРµСЂРµ ogg РјРѕР¶РµС‚ Р±С‹С‚СЊ РґРѕСЃС‚СѓРїРЅР° РІ FF, РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РµРіРѕ, РµСЃР»Рё РµСЃС‚СЊ */
            namespace.ya.speechkit.FORMAT.OPUS = {format: 'opus', sampleRate: 48000, mime: 'audio/ogg;codecs=opus', bufferSize: 512};
        } else if (isMimeSupported('audio/webm; codecs=opus')) {
            /** РџРѕРґРґРµСЂР¶РєР° OPUS РІ РєРѕРЅС‚РµР№РЅРµСЂРµ webm РјРѕР¶РµС‚ Р±С‹С‚СЊ РґРѕСЃС‚СѓРїРЅР° РІ Chromium-based Р±СЂР°СѓР·РµСЂР°С…, РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РµРіРѕ, РµСЃР»Рё РµСЃС‚СЊ */
            namespace.ya.speechkit.FORMAT.OPUS = {format: 'opus', sampleRate: 48000, mime: 'audio/webm;codecs=opus', bufferSize: 512};
        } 
    }

    /** Media stream used by SpeechKit
     * @private
     * @memberof ya.speechkit
     */
    namespace.ya.speechkit._stream = null;

    /**
     * Deep copies fileds from object 'from' to object 'to'
     * @param {Object} from Source object
     * @param {Object} to Destination object
     * @private
     */
    namespace.ya.speechkit._extend = function (to, from) {
        var i;
        var toStr = Object.prototype.toString;
        var astr = '[object Array]';
        to = to || {};

        for (i in from) {
            if (from.hasOwnProperty(i)) {
                if (typeof from[i] === 'object') {
                    to[i] = (toStr.call(from[i]) === astr) ? [] : {};
                    namespace.ya.speechkit._extend(to[i], from[i]);
                } else if (typeof from[i] !== 'undefined' || typeof to[i] === 'undefined') {
                    to[i] = from[i];
                }
            }
        }
        return to;
    };

    /**
     * РЎРѕР·РґР°РµС‚ РѕР±СЉРµРєС‚ РґР»СЏ Р·Р°РїРёСЃРё Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р° СЃ РјРёРєСЂРѕС„РѕРЅР°.
     * @class РљР»Р°СЃСЃ, СѓРїСЂР°РІР»СЏСЋС‰РёР№ Р·Р°РїРёСЃСЊСЋ Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°.
     * @name Recorder
     */
    var Recorder = function ()
    {
        if (!namespace.ya.speechkit._stream) {
            return null;
        }

        if (!(this instanceof Recorder)) {
            return new Recorder();
        }

        this.worker = namespace.ya.speechkit.newWorker();

        this.recording = false;

        this.paused = false;
        this.lastDataOnPause = 0;

        this.nullsArray = [];

        this.currCallback = null;
        this.buffCallback = null;
        this.startCallback = null;

        this.audioInput = null;
        this.mediaRecorder = null;

        this.worker.onmessage = function (e) {
            if (e.data.command == 'int16stream')
            {
                var data = e.data.buffer;

                if (this.startCallback) {
                    this.startCallback(data);
                }
            } else if (e.data.command == 'getBuffers' && this.buffCallback) {
                this.buffCallback(e.data.blob);
            } else if (e.data.command == 'clear' && this.currCallback) {
                this.currCallback();
            } else if (this.currCallback) {
                this.currCallback(e.data.blob);
            }
        }.bind(this);

    };

    Recorder.prototype = /** @lends Recorder.prototype */ {
        /**
         * Creates an input point for a given audio format (sets samplerate and buffer size
         * @param {ya.speechkit.FORMAT} format audio format (it's samplerate and bufferSize are being used)
         * @private
         */
        _createNode: function (format) {
            if (!namespace.ya.speechkit.audiocontext) {
                namespace.ya.speechkit.audiocontext = new namespace.ya.speechkit.AudioContext();
            }

            this.audioInput = namespace.ya.speechkit.audiocontext.createMediaStreamSource(
                                                                            namespace.ya.speechkit._stream);
            if (format.format == 'pcm') {
                if (!namespace.ya.speechkit.audiocontext.createScriptProcessor) {
                    this.node = namespace.ya.speechkit.audiocontext.createJavaScriptNode(format.bufferSize, 2, 2);
                } else {
                    this.node = namespace.ya.speechkit.audiocontext.createScriptProcessor(format.bufferSize, 2, 2);
                }

                this.audioInput.connect(this.node);
                this.node.onaudioprocess = function (e) {
                    if (!this.recording) {return;}

                    if (this.paused) {
                        if (Number(new Date()) - this.lastDataOnPause > 2000) {
                            this.lastDataOnPause = Number(new Date());
                            this.worker.postMessage({
                                command: 'record',
                                buffer: [
                                    this.nullsArray,
                                    this.nullsArray
                                ]
                            });
                        }
                    } else {
                        this.worker.postMessage({
                            command: 'record',
                            buffer: [
                                e.inputBuffer.getChannelData(0),
                                e.inputBuffer.getChannelData(1)
                            ]
                        });
                    }
                }.bind(this);

                this.node.connect(namespace.ya.speechkit.audiocontext.destination);
            } else {
                if (format.format == 'opus' && (typeof MediaRecorder != 'undefined')) {
                    this.mediaRecorder = new MediaRecorder(namespace.ya.speechkit._stream, {mimeType: format.mime});
                }
            }
        },
        /**
         * РЎС‚Р°РІРёС‚ Р·Р°РїРёСЃСЊ Р·РІСѓРєР° РЅР° РїР°СѓР·Сѓ.
         * Р’Рѕ РІСЂРµРјСЏ РїР°СѓР·С‹ РЅР° СЃРµСЂРІРµСЂ Р±СѓРґСѓС‚ РѕС‚РїСЂР°РІР»СЏС‚СЊСЃСЏ РїРµСЂРёРѕРґРёС‡РµСЃРєРё Р·Р°РїСЂРѕСЃС‹ СЃ РїСѓСЃС‚С‹Рј Р·РІСѓРєРѕРј, С‡С‚РѕР±С‹ СЃРµСЂРІРµСЂ РЅРµ РѕР±СЂС‹РІР°Р» СЃРµСЃСЃРёСЋ.
         */
        pause: function () {
            this.paused = true;
            this.lastDataOnPause = Number(new Date());

            if (this.mediaRecorder) {
                this.mediaRecorder.pause();
            }
        },
        /**
         * @returns {AudioContext} РўРµРєСѓС‰РёР№ <xref scope="external" locale="ru" href="https://developer.mozilla.org/ru/docs/Web/API/AudioContext">
         * AudioContext</xref><xref scope="external" locale="en-com" href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext">AudioContext</xref>,
         * СЃ РєРѕС‚РѕСЂРѕРіРѕ Р·Р°РїРёСЃС‹РІР°РµС‚СЃСЏ Р·РІСѓРє.
         */
        getAudioContext: function () {
            return namespace.ya.speechkit.audiocontext;
        },
        /**
         * @returns {AnalyserNode} <xref scope="external" locale="ru" href="https://developer.mozilla.org/ru/docs/Web/API/AnalyserNode">
         * AnalyserNode</xref><xref scope="external" locale="en-com" href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode">
         * AnalyserNode</xref> вЂ” РѕР±СЉРµРєС‚, РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ РґР»СЏ Р°РЅР°Р»РёР·Р° Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р° РІ СЂРµР°Р»СЊРЅРѕРј РІСЂРµРјРµРЅРё.
         */
        getAnalyserNode: function () {
            if (!namespace.ya.speechkit.audiocontext) {
                namespace.ya.speechkit.audiocontext = new namespace.ya.speechkit.AudioContext();
            }
            var analyserNode = namespace.ya.speechkit.audiocontext.createAnalyser();
            analyserNode.fftSize = 2048;
            if (!this.audioInput) {
                this.audioInput = namespace.ya.speechkit.audiocontext.createMediaStreamSource(
                                                                            namespace.ya.speechkit._stream);
            }
            this.audioInput.connect(analyserNode);
            return analyserNode;
        },
        /**
         * @returns {Boolean} true, РµСЃР»Рё Р·Р°РїРёСЃСЊ Р·РІСѓРєР° СЃС‚РѕРёС‚ РЅР° РїР°СѓР·Рµ, false вЂ” РІ РїСЂРѕС‚РёРІРЅРѕРј СЃР»СѓС‡Р°Рµ.
         */
        isPaused: function () {
            return this.paused;
        },
        /**
         * РќР°С‡РёРЅР°РµС‚ Р·Р°РїРёСЃСЊ Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°.
         * @param {callback:streamCallback} cb Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РІР°С‚СЊСЃСЏ Р·Р°РїРёСЃР°РЅРЅС‹Р№ Р°СѓРґРёРѕ-РїРѕС‚РѕРє.
         * @param {ya.speechkit.FORMAT} [format=PCM16] Р¤РѕСЂРјР°С‚ РґР»СЏ Р·Р°РїРёСЃРё Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р°. Р”РѕСЃС‚СѓРїРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
         * <ul>
         *     <li> PCM8 вЂ” РїР»РѕС…РѕРµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ, РЅРѕ РјР°Р»С‹Р№ РѕР±СЉРµРј РїРµСЂРµРґР°РІР°РµРјС‹С… РЅР° СЃРµСЂРІРµСЂ РґР°РЅРЅС‹С…;</li>
         *     <li> PCM16 вЂ” РЅР°РёР»СѓС‡С€РµРµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РїСЂРё СЃСЂРµРґРЅРµРј РѕР±СЉРµРјРµ РґР°РЅРЅС‹С…; </li>
         *     <li> PCM44 вЂ” Р±РѕР»СЊС€РѕР№ СЂР°Р·РјРµСЂ РїРµСЂРµРґР°РІР°РµРјС‹С… РґР°РЅРЅС‹С…, РІРѕР·РјРѕР¶РЅС‹ Р·Р°РґРµСЂР¶РєРё РЅР° СѓР·РєРѕРј РєР°РЅР°Р»Рµ.</li>
         *</ul>
         */
        start: function (cb, format) {
            var backref = this;
            if (!namespace.ya.speechkit._stream) {
                return namespace.ya.speechkit.initRecorder(function () {backref.start(cb, format);}, console.log);
            }

            if ((!this.node && (!format || format.format == 'pcm')) || (!this.mediaRecorder && format && format.format == 'opus')) {
                this._createNode(format);
            }

            if (this.isPaused()) {
                this.paused = false;

                if (this.mediaRecorder) {
                    this.mediaRecorder.resume();
                }
                return;
            }

            if (typeof cb !== 'undefined') {
                this.startCallback = cb;
            } else {
                this.startCallback = null;
            }

            if (!format || format.format == 'pcm') {
                this.worker.postMessage({
                    command: 'init',
                    config: {
                        sampleRate: namespace.ya.speechkit.audiocontext.sampleRate,
                        format: format || namespace.ya.speechkit.FORMAT.PCM16,
                        channels: this.channelCount,
                    }
                });

                this.nullsArray = [];
                var bufferLen = (format || namespace.ya.speechkit.FORMAT.PCM16).bufferSize;
                for (var i = 0; i < bufferLen; i++) {
                    this.nullsArray.push(0);
                }
            } else if (format && format.format == 'opus' && this.mediaRecorder) {
                var ondatacallback = function (e) { 
                    if (this.startCallback) {
                        var cb = this.startCallback;
                        var fileReader = new FileReader();
                        fileReader.onload = function() {
                            if (this.result.byteLength > 0) {
                                cb(this.result);
                            }
                        };
                        fileReader.readAsArrayBuffer(e.data);
                    }
                }.bind(this);

                this.mediaRecorder.ondataavailable = ondatacallback;
                this.mediaRecorder.start(200);
            }

            this.clear(function () {this.recording = true;}.bind(this));
        },
        /**
         * РћСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ Р·Р°РїРёСЃСЊ Р·РІСѓРєР°.
         * @param {callback:wavCallback} cb Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РЅ РѕР±СЉРµРєС‚ <xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref>
         * СЃ Р·Р°РїРёСЃР°РЅРЅС‹Рј Р°СѓРґРёРѕ РІ С„РѕСЂРјР°С‚Рµ wav.
         * @param {Number} [channelCount=2] РЎРєРѕР»СЊРєРѕ РєР°РЅР°Р»РѕРІ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ РІ wav-С„Р°Р№Р»Рµ: 1 вЂ” mono, 2 вЂ” stereo.
         */
        stop: function (cb, channelCount) {
            this.recording = false;
            if (this.node) {
                this.node.disconnect();
            }

            this.node = null;

            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
            }
            
            this.mediaRecorder = null;

            if (namespace.ya.speechkit._stream &&
                namespace.ya.speechkit._stream.getAudioTracks) {
                namespace.ya.speechkit._stream.getAudioTracks()[0].stop();
            } else if (namespace.ya.speechkit._stream &&
                typeof namespace.ya.speechkit._stream.stop !== 'undefined') {
                namespace.ya.speechkit._stream.stop();
            }
            namespace.ya.speechkit._stream = null;
            if (typeof namespace.ya.speechkit.audiocontext !== 'undefined' &&
                namespace.ya.speechkit.audiocontext !== null &&
                typeof namespace.ya.speechkit.audiocontext.close !== 'undefined') {
                namespace.ya.speechkit.audiocontext.close();
                namespace.ya.speechkit.audiocontext = null;
            }

            if (typeof cb !== 'undefined') {
                this.exportWav(function (blob) {
                    cb(blob);
                }, channelCount || 2);
            }
        },
        /**
         * @returns {Boolean} true, РµСЃР»Рё РёРґРµС‚ Р·Р°РїРёСЃСЊ Р·РІСѓРєР°, false вЂ” РµСЃР»Рё Р·Р°РїРёСЃСЊ СЃС‚РѕРёС‚ РІ СЂРµР¶РёРјРµ РїР°СѓР·С‹.
         */
        isRecording: function () {
            return this.recording;
        },
        /**
         * РћС‡РёС‰Р°РµС‚ Р±СѓС„РµСЂС‹ СЃ Р·Р°РїРёСЃР°РЅРЅС‹Рј Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»РѕРј.
         * @param {callback:clearCallback} cb Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР°, РєРѕРіРґР° РїСЂРѕРёР·РѕР№РґРµС‚ РѕС‡РёСЃС‚РєР°.
         */
        clear: function (cb) {
            if (typeof cb !== 'undefined') {
                this.currCallback = cb;
            } else {
                this.currCallback = null;
            }
            this.worker.postMessage({command: 'clear'});
        },
        /**
         * РњРµС‚РѕРґ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р±СѓС„РµСЂРѕРІ СЃ Р·Р°РїРёСЃР°РЅРЅС‹Рј Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»РѕРј.
         * @param {callback:buffersCallback} cb Р¤СѓРЅРєС†РёСЏ, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґСѓС‚ РїРµСЂРµРґР°РЅС‹ Р±СѓС„РµСЂС‹ СЃ Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»РѕРј.
         */
        getBuffers: function (cb) {
            if (typeof cb !== 'undefined') {
                this.buffCallback = cb;
            } else {
                this.buffCallback = null;
            }
            this.worker.postMessage({command: 'getBuffers'});
        },
        /**
         * Р­РєСЃРїРѕСЂС‚РёСЂСѓРµС‚ Р·Р°РїРёСЃР°РЅРЅС‹Р№ Р·РІСѓРє РІ wav-С„Р°Р№Р».
         * @param {callback:wavCallback} cb Р¤СѓРЅРєС†РёСЏ, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РЅ РѕР±СЉРµРєС‚ <xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref> СЃ С„Р°Р№Р»РѕРј.
         * @param {Number} [channelCount=1] РљРѕР»РёС‡РµСЃС‚РІРѕ РєР°РЅР°Р»РѕРІ РІ wav-С„Р°Р№Р»Рµ: 1 вЂ” mono, 2 вЂ” stereo.
         */
        exportWav: function (cb, channelCount) {
            if (typeof cb !== 'undefined') {
                this.currCallback = cb;
            } else {
                this.currCallback = null;
            }
            var type = 'audio/wav';

            if (!this.currCallback) {throw new Error('Callback not set');}

            var exportCommand = 'export' + (channelCount != 2 && 'Mono' || '') + 'WAV';

            this.worker.postMessage({
                command: exportCommand,
                type: type
            });
        }
    };

    namespace.ya.speechkit.Recorder = Recorder;

    namespace.ya.speechkit.getUserMedia = navigator.getUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        navigator.webkitGetUserMedia;

    namespace.ya.speechkit.mediaDevices = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ?
        navigator.mediaDevices :
        (namespace.ya.speechkit.getUserMedia ? {
            getUserMedia: function (c) {
                return new Promise(function (y, n) {
                    namespace.ya.speechkit.getUserMedia.call(navigator, c, y, n);
                });
            }
        } : null);

    namespace.ya.speechkit._stream = null;
    namespace.ya.speechkit.audiocontext = null;

    /**
     * Р—Р°РїСЂР°С€РёРІР°РµС‚ Сѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїСЂР°РІР° РґР»СЏ Р·Р°РїРёСЃРё Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°.
     * @param {callback:initSuccessCallback} initSuccess Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїСЂРё СѓСЃРїРµС€РЅРѕРј РїРѕРґРєР»СЋС‡РµРЅРёРё Рє РјРёРєСЂРѕС„РѕРЅСѓ.
     * @param {callback:initFailCallback} initFail Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РЅРѕ СЃРѕРѕР±С‰РµРЅРёСЏ РѕР± РѕС€РёР±РєРµ, РІ СЃР»СѓС‡Р°Рµ РЅРµСѓСЃРїРµС…Р°.
     */
    namespace.ya.speechkit.initRecorder = function (initSuccess, initFail)
    {
        var badInitialization = function (err) {
            namespace.ya.speechkit._stream = null;
            if (typeof initFail !== 'undefined') {
                initFail(err);
            }
        };

        if (namespace.ya.speechkit.mediaDevices)
        {
            namespace.ya.speechkit.mediaDevices.getUserMedia(
                {audio: true}).then(
                function (stream) {
                    namespace.ya.speechkit._stream = stream;
                    if (typeof initSuccess !== 'undefined') {
                        initSuccess();
                    }
                }).catch(
                function (err) {
                    badInitialization(err.message || err.name || err);
                });
        } else {
            badInitialization('Your browser doesn\'t support Web Audio API. ' +
                              'Please, use Yandex.Browser: https://browser.yandex.ru');
        }
    };

    /**
     * РџСЂРѕРІРµСЂСЏРµС‚, РґР°Р» Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЂР°Р·СЂРµС€РµРЅРёРµ РЅР° Р·Р°РїРёСЃСЊ Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°.
     * @return true, РµСЃР»Рё РІ СЂРµР·СѓР»СЊС‚Р°С‚Рµ РІС‹Р·РѕРІР° initRecorder Р±С‹Р»Рё РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅС‹ РїСЂР°РІР° РЅР° Р·Р°РїРёСЃСЊ Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°, РёРЅР°С‡Рµ - false.
     */
    namespace.ya.speechkit.isPermissionProvided = function ()
    {
        return (namespace.ya.speechkit._stream != null);
    }

    /**
     * РџРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ Р»Рё СЂР°РїРѕР·РЅР°РІР°РЅРёРµ Р·Р°РґР°РЅРЅРѕРіРѕ СЏР·С‹РєР°.
     * @return true, РµСЃР»Рё СЏР·С‹Рє РїРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ, false вЂ” РёРЅР°С‡Рµ.
     */
    namespace.ya.speechkit.isLanguageSupported = function (lang)
    {
        if (namespace.ya.speechkit.settings.langWhitelist.indexOf(lang) >= 0) {
            return namespace.ya.speechkit.isSupported();
        } else {
            return namespace.ya.speechkit.isWebAudioSupported();
        }
    };

    /**
     * РџРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ Р»Рё С‚РµС…РЅРѕР»РѕРіРёРё СЂР°РїРѕР·РЅР°РІР°РЅРёСЏ РЇРЅРґРµРєСЃР°.
     * @return true, РµСЃР»Рё РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ, false вЂ” РёРЅР°С‡Рµ.
     */
    namespace.ya.speechkit.isSupported = function ()
    {
        var userAgent = navigator.userAgent.toLowerCase();
        // Yandex recognition is 100% supported on mobile devices only in firefox
        return ((namespace.ya.speechkit.mediaDevices !== null) &&
                ((/mozilla|firefox/.test(userAgent) && !/yabrowser/.test(userAgent)) ||
                !/iphone|ipod|ipad|android|blackberry/.test(userAgent)));
    };

    /**
     * РџРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ Р»Рё СЂР°РїРѕР·РЅР°РІР°РЅРёРµ СЃ РїРѕРјРѕС‰СЊСЋ WebAudio API.
     * @return true, РµСЃР»Рё РїРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ, false вЂ” РёРЅР°С‡Рµ.
     */
    namespace.ya.speechkit.isWebAudioSupported = function ()
    {
        var userAgent = navigator.userAgent.toLowerCase();
        var SpeechRecognition = namespace.SpeechRecognition || namespace.webkitSpeechRecognition;
        // Native recognition is only supported in original chrome and chromium
        return (typeof SpeechRecognition !== 'undefined' && !/yabrowser|opera|opr/.test(userAgent));
    };


    /**
     * Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ СѓСЃРїРµС€РЅРѕРіРѕ РїРѕР»СѓС‡РµРЅРёСЏ РїСЂР°РІ РЅР° РґРѕСЃС‚СѓРї Рє РјРёРєСЂРѕС„РѕРЅСѓ.
     * @callback
     * @name initSuccessCallback
     * @memberof Recorder
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїСЂРё РІРѕР·РЅРёРєРЅРѕРІРµРЅРёРё РѕС€РёР±РєРё РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РґРѕСЃС‚СѓРїР° Рє РјРёРєСЂРѕС„РѕРЅСѓ.
     * @callback initFailCallback
     * @param {String} error РЎРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ.
     * @memberof Recorder
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ РґР»СЏ <xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref> СЃ wav-С„Р°Р№Р»РѕРј.
     * @callback
     * @name wavCallback
     * @param {<xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref> СЃ MIME С‚РёРїРѕРј audio/wav} data wav-С„Р°Р№Р».
     * @memberof Recorder
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґСѓС‚ РїРµСЂРµРґР°РЅС‹ Р±СѓС„РµСЂС‹ Р·Р°РїРёСЃР°РЅРЅРѕРіРѕ Р°СѓРґРёРѕ.
     * @callback
     * @name buffersCallback
     * @param {Float32Array[]} buffers Р‘СѓС„РµСЂС‹ Р·Р°РїРёСЃР°РЅРЅРѕРіРѕ Р°СѓРґРёРѕ РґР»СЏ РґРІСѓС… РєР°РЅР°Р»РѕРІ (РјРѕРЅРѕ Рё СЃС‚РµСЂРµРѕ).
     * @memberof Recorder
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ РѕС‡РёСЃС‚РєРё Р±СѓС„РµСЂРѕРІ (СЌС‚Рѕ СЃРёРіРЅР°Р» РіРѕС‚РѕРІРЅРѕСЃС‚Рё Рє РїРѕРІС‚РѕСЂРЅРѕРјСѓ Р·Р°РїСѓСЃРєСѓ).
     * @callback
     * @name clearCallback
     * @memberof Recorder
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РІР°С‚СЊСЃСЏ Р·Р°РїРёСЃР°РЅРЅС‹Р№ Р°СѓРґРёРѕ-РїРѕС‚РѕРє.
     * @callback
     * @name streamCallback
     * @param {ArrayBuffer} stream Р—Р°РїРёСЃР°РЅРЅС‹Р№ PCM РїРѕС‚РѕРє 16-bit.
     * @memberof Recorder
     */

}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    function _makeWorker(script) {
        var URL = window.URL || window.webkitURL;
        var Blob = window.Blob;
        var Worker = window.Worker;

        if (!URL || !Blob || !Worker || !script) {
            return null;
        }

        var blob = new Blob([script], {type: 'application/javascript'});
        var worker = new Worker(URL.createObjectURL(blob));
        return worker;
    }

    var inline_worker =
"function iirFilter (sampleRate, cutoff, resonance, type) {" +
"" +
"    var	self	= this," +
"            f	= [0.0, 0.0, 0.0, 0.0]," +
"            freq, damp," +
"            prevCut, prevReso," +
"" +
"            sin	= Math.sin," +
"            min	= Math.min," +
"            pow	= Math.pow;" +
"" +
"    self.cutoff = cutoff || 20000;" +
"    self.resonance = resonance || 0.1;" +
"    self.samplerate = sampleRate || 44100;" +
"    self.type = type || 0;" +
"" +
"    function calcCoeff () {" +
"            freq = 2 * sin(Math.PI * min(0.25, self.cutoff / (self.samplerate * 2)));" +
"            damp = min(2 * (1 - pow(self.resonance, 0.25)), min(2, 2 / freq - freq * 0.5));" +
"    }" +
"" +
"    self.pushSample = function (sample) {" +
"            if (prevCut !== self.cutoff || prevReso !== self.resonance){" +
"                    calcCoeff();" +
"                    prevCut = self.cutoff;" +
"                    prevReso = self.resonance;" +
"            }" +
"" +
"            f[3] = sample - damp * f[2];" +
"            f[0] = f[0] + freq * f[2];" +
"            f[1] = f[3] - f[0];" +
"            f[2] = freq * f[1] + f[2];" +
"" +
"            f[3] = sample - damp * f[2];" +
"            f[0] = f[0] + freq * f[2];" +
"            f[1] = f[3] - f[0];" +
"            f[2] = freq * f[1] + f[2];" +
"" +
"            return f[self.type];" +
"    };" +
"" +
"    self.getMix = function (type) {" +
"            return f[type || self.type];" +
"    };" +
"}" +
"" +
"var speex_loaded = false;" +
"var recLength = 0;" +
"var recBuffersL = [];" +
"var recBuffersR = [];" +
"var sampleRate;" +
"var outSampleRate;" +
"var tmp_buf = 0;" +
"var need_buf_size = 4096;" +
"var speex_converter = null;" +
"    " +
"this.onmessage = function (e) {" +
"    switch (e.data.command) {" +
"    case 'init':" +
"        init(e.data.config);" +
"        break;" +
"    case 'record':" +
"        record(e.data.buffer);" +
"        break;" +
"    case 'exportWAV':" +
"        exportWAV(e.data.type);" +
"        break;" +
"    case 'exportMonoWAV':" +
"        exportMonoWAV(e.data.type);" +
"        break;" +
"    case 'getBuffers':" +
"        getBuffers();" +
"        break;" +
"    case 'clear':" +
"        clear();" +
"        break;" +
"    }" +
"};" +
"    " +
"function init(config) {" +
"    sampleRate = config.sampleRate;" +
"    outSampleRate = config.format.sampleRate || sampleRate;" +
"    need_buf_size = config.format.bufferSize || 4096;" +
"    speex_converter = null;" +
"    /*if (config.format.format == \'speex\') {" +
"        if (!speex_loaded) {" +
"            importScripts(\'./speex.min.js\');" +
"            speex_loaded = true;" +
"        }" +
"        need_buf_size /= 16;" +
"        speex_converter = new SpeexConverter(outSampleRate);" +
"    }*/" +
"}" +
"" +
"var resample = function (inbuf) {" +
"    var speed = 1.0 * sampleRate / outSampleRate;" +
"    var l = Math.ceil(inbuf.length / speed);" +
"    var result = new Float32Array(l);" +
"    var bin = 0;" +
"    var num = 0;" +
"    var indexIn = 0;" +
"    var indexOut = 0;" +
"    for (indexOut = 1, indexIn = speed; indexOut < l - 1; indexIn += speed, indexOut++) {" +
"        var pos = Math.floor(indexIn);" +
"        var dt = indexIn - pos;" +
"        var second = (pos + 1 < inbuf.length) ? pos + 1 : inbuf.length - 1; " +
"        result[indexOut] = inbuf[pos] * (1 - dt) + inbuf[second] * dt;" +
"    }" +
"    result[0] = inbuf[0];" +
"    result[l - 1] = inbuf[inbuf.length - 1];" +
"    return result;" +
"};" +
"    " +
"function record(inputBuffer) {" +
"    if (outSampleRate == sampleRate) {" +
"        recBuffersL.push(inputBuffer[0]);" +
"        recBuffersR.push(inputBuffer[1]);" +
"        recLength += inputBuffer[0].length;" +
"    " +
"        var samples = inputBuffer[0];" +
"        var buffer = new ArrayBuffer(samples.length * 2);" +
"        var view = new DataView(buffer);" +
"        floatTo16BitPCM(view, 0, samples);" +
"        this.postMessage({command: 'int16stream', buffer: buffer});" +
"    } else {" +
"        var filter0 = new iirFilter(outSampleRate, outSampleRate * 0.125, 0.0); " +
"        var filter1 = new iirFilter(outSampleRate, outSampleRate * 0.125, 0.0); " +
"" +
"        for (var i =0; i < inputBuffer[0].length; i++) { " +
"            inputBuffer[0][i] = filter0.pushSample(inputBuffer[0][i]); " +
"            inputBuffer[1][i] = filter1.pushSample(inputBuffer[1][i]); " +
"        }" +
"" +
"        var resin0 = resample(inputBuffer[0], outSampleRate, sampleRate);" +
"        var resin1 = resample(inputBuffer[1], outSampleRate, sampleRate);" +
"    " +
"        recBuffersL.push(resin0);" +
"        recBuffersR.push(resin1);" +
"        recLength += resin0.length;" +
"    " +
"        var result = new Int16Array(resin0.length);" +
"    " +
"        for (var i = 0 ; i < resin0.length ; i++) {" +
"            result[i] = Math.floor(Math.min(Math.max((resin0[i] + resin1[i]) * 0.5, -1.0), 1.0) * 16383);" +
"        }" +
"    " +
"        if (speex_converter) {" +
"            result = speex_converter.convert(result);" +
"        } else {" +
"            result = result.buffer;" +
"        }" +
"    " +
"        if (!tmp_buf) {" +
"            tmp_buf = result;" +
"        } else {" +
"            var tmp = new DataView(new ArrayBuffer(tmp_buf.byteLength + result.byteLength));" +
"            tmp_buf = new DataView(tmp_buf);" +
"            result = new DataView(result);" +
"    " +
"            for (i = 0; i < tmp_buf.byteLength; i++) {" +
"                tmp.setUint8(i, tmp_buf.getUint8(i));" +
"            }" +
"    " +
"            for (i = 0; i < result.byteLength; i++) {" +
"                tmp.setUint8(i + tmp_buf.byteLength, result.getUint8(i));" +
"            }" +
"    " +
"            tmp_buf = tmp.buffer;" +
"        }" +
"    " +
"        if (tmp_buf.byteLength >= need_buf_size) {" +
"            this.postMessage({command: 'int16stream', buffer: tmp_buf});" +
"            tmp_buf = false;" +
"        }" +
"    }" +
"}" +
"    " +
"function exportWAV(type) {" +
"    var bufferL = mergeBuffers(recBuffersL, recLength);" +
"    var bufferR = mergeBuffers(recBuffersR, recLength);" +
"    var interleaved = interleave(bufferL, bufferR);" +
"    var dataview = encodeWAV(interleaved);" +
"    var audioBlob = new Blob([dataview], {type: type});" +
"    " +
"    this.postMessage({command: 'exportWAV', blob: audioBlob});" +
"}" +
"    " +
"function exportMonoWAV(type) {" +
"    var bufferL = mergeBuffers(recBuffersL, recLength);" +
"    var dataview = encodeWAV(bufferL, true);" +
"    var audioBlob = new Blob([dataview], {type: type});" +
"    " +
"    this.postMessage({command: 'exportMonoWAV', blob: audioBlob});" +
"}" +
"    " +
"function getBuffers() {" +
"    var buffers = [];" +
"    buffers.push(mergeBuffers(recBuffersL, recLength));" +
"    buffers.push(mergeBuffers(recBuffersR, recLength));" +
"    this.postMessage({command: 'getBuffers', blob: buffers});" +
"}" +
"    " +
"function clear() {" +
"    recLength = 0;" +
"    recBuffersL = [];" +
"    recBuffersR = [];" +
"    if (speex_converter) {" +
"        speex_converter.clear();" +
"    }" +
"    this.postMessage({command: 'clear'});" +
"}" +
"    " +
"function mergeBuffers(recBuffers, recLength) {" +
"    var result = new Float32Array(recLength);" +
"    var offset = 0;" +
"    for (var i = 0; i < recBuffers.length; i++){" +
"        result.set(recBuffers[i], offset);" +
"        offset += recBuffers[i].length;" +
"    }" +
"    return result;" +
"}" +
"    " +
"function interleave(inputL, inputR) {" +
"    var length = inputL.length + inputR.length;" +
"    var result = new Float32Array(length);" +
"    " +
"    var index = 0;" +
"    var inputIndex = 0;" +
"    " +
"    while (index < length){" +
"        result[index++] = inputL[inputIndex];" +
"        result[index++] = inputR[inputIndex];" +
"        inputIndex++;" +
"    }" +
"    return result;" +
"}" +
"    " +
"function floatTo16BitPCM(output, offset, input) {" +
"    for (var i = 0; i < input.length; i++, offset += 2){" +
"        var s = Math.max(-1, Math.min(1, input[i]));" +
"        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);" +
"    }" +
"}" +
"    " +
"function writeString(view, offset, string) {" +
"    for (var i = 0; i < string.length; i++){" +
"        view.setUint8(offset + i, string.charCodeAt(i));" +
"    }" +
"}" +
"    " +
"function encodeWAV(samples, mono) {" +
"    var buffer = new ArrayBuffer(44 + samples.length * 2);" +
"    var view = new DataView(buffer);" +
"    " +
"    /* RIFF identifier */" +
"    writeString(view, 0, 'RIFF');" +
"    /* file length */" +
"    view.setUint32(4, 32 + samples.length * 2, true);" +
"    /* RIFF type */" +
"    writeString(view, 8, 'WAVE');" +
"    /* format chunk identifier */" +
"    writeString(view, 12, 'fmt ');" +
"    /* format chunk length */" +
"    view.setUint32(16, 16, true);" +
"    /* sample format (raw) */" +
"    view.setUint16(20, 1, true);" +
"    /* channel count */" +
"    view.setUint16(22, mono ? 1 : 2, true);" +
"    /* sample rate */" +
"    view.setUint32(24, outSampleRate, true);" +
"    /* block align (channel count * bytes per sample) */" +
"    var block_align = mono ? 2 : 4;" +
"    /* byte rate (sample rate * block align) */" +
"    view.setUint32(28, outSampleRate * block_align, true);" +
"    /* block align (channel count * bytes per sample) */" +
"    view.setUint16(32, block_align, true);" +
"    /* bits per sample */" +
"    view.setUint16(34, 16, true);" +
"    /* data chunk identifier */" +
"    writeString(view, 36, 'data');" +
"    /* data chunk length */" +
"    view.setUint32(40, samples.length * 2, true);" +
"    " +
"    floatTo16BitPCM(view, 44, samples);" +
"    " +
"    return view;" +
"}" +
" ";

    namespace.ya.speechkit.newWorker = function () {
        return _makeWorker(inline_worker);
    };
}(this));

(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    /**
     * РЎРѕР·РґР°РµС‚ РЅРѕРІС‹Р№ РѕР±СЉРµРєС‚ С‚РёРїР° Recognizer.
     * @class РЎРѕР·РґР°РµС‚ СЃРµСЃСЃРёСЋ Рё РѕС‚РїСЂР°РІР»СЏРµС‚ Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂРІРµСЂ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @name Recognizer
     * @param {Object} [options] РћРїС†РёРё.
     * @param {callback:initCallback} [options.onInit] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕР№ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё
     * СЃРµСЃСЃРёРё.
     * @param {callback:dataCallback} [options.onResult] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ Р·Р°РІРµСЂС€РµРЅРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @param {callback:errorCallback} [options.onError]
     * @param {String} [options.uuid=СЃРј. РѕРїРёСЃР°РЅРёРµ] UUID СЃРµСЃСЃРёРё. РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїСЂРёРЅРёРјР°РµС‚ Р·РЅР°С‡РµРЅРёРµ, СѓРєР°Р·Р°РЅРЅРѕРµ
     * РІ РЅР°СЃС‚СЂРѕР№РєР°С… ya.speechkit.settings.uuid.
     * @param {String} [options.apikey] API-РєР»СЋС‡. Р•СЃР»Рё РЅРµ Р·Р°РґР°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РєР»СЋС‡, СѓРєР°Р·Р°РЅРЅС‹Р№
     * РІ РЅР°СЃС‚СЂРѕР№РєР°С… ya.speechkit.settings.apikey.
     * @param {ya.speechkit.FORMAT} [options.format=ya.speechkit.FORMAT.PCM16] Р¤РѕСЂРјР°С‚ Р°СѓРґРёРѕРїРѕС‚РѕРєР°.
     * @param {String} [options.url=СЃРј. РѕРїРёСЃР°РЅРёРµ] URL СЃРµСЂРІРµСЂР°, РЅР° РєРѕС‚РѕСЂРѕРј Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЊСЃСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµ.
     * Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ Р±РµСЂРµС‚СЃСЏ Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РЅР°СЃС‚СЂРѕР№РєР°С… ya.speechkit.settings.asrUrl. РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РѕРЅРѕ СЂР°РІРЅРѕ
     * 'webasr.yandex.net/asrsocket.ws'.
     * @param {Boolean} [options.punctuation=true] РСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р»Рё РїСѓРЅРєС‚СѓР°С†РёСЋ.
     * @param {Boolean} [options.allowStrongLanguage=false] РћС‚РєР»СЋС‡РёС‚СЊ С„РёР»СЊС‚СЂР°С†РёСЋ РѕР±СЃС†РµРЅРЅРѕР№ Р»РµРєСЃРёРєРё.
     * @param {String} [options.model='notes'] РЇР·С‹РєРѕРІР°СЏ РјРѕРґРµР»СЊ, РєРѕС‚РѕСЂР°СЏ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅР° РїСЂРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРё.
     * Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РЅР°СЃС‚СЂРѕР№РєР°С… ya.speechkit.model. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ
     * РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РјРѕРґРµР»СЊ 'notes'.
     * @param {String} [options.lang='ru-RU'] РЇР·С‹Рє СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ. Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ: 'ru-RU', 'en-US', 'tr-TR', 'uk-UA'.
     * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
     * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РЅР°СЃС‚СЂРѕР№РєР°С… ya.speechkit.lang. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
     * РІС‹Р±РёСЂР°РµС‚СЃСЏ СЂСѓСЃСЃРєРёР№ СЏР·С‹Рє: 'ru-RU'. </p>
     * @param {String} [options.applicationName] РќР°Р·РІР°РЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ. Р”Р»СЏ РЅРµРєРѕС‚РѕСЂС‹С… РїСЂРёР»РѕР¶РµРЅРёР№ РјС‹ РїРѕРґРґРµСЂР¶РёРІР°РµРј СЃРїРµС†РёР°Р»СЊРЅСѓСЋ Р»РѕРіРёРєСѓ. РџСЂРёРјРµСЂ - sandbox.
     */
    var Recognizer = function (options) {
        if (!(this instanceof namespace.ya.speechkit.Recognizer)) {
            return new namespace.ya.speechkit.Recognizer(options);
        }
        this.options = namespace.ya.speechkit._extend(
                        {apikey: namespace.ya.speechkit.settings.apikey,
                         uuid: namespace.ya.speechkit.settings.uuid,
                         url: namespace.ya.speechkit.settings.websocketProtocol +
                            namespace.ya.speechkit.settings.asrUrl,
                         onInit: function () {},
                         onResult: function () {},
                         onError: function () {},
                         punctuation: true,
                         allowStrongLanguage: false
                        },
                        options);

        // Backward compatibility
        this.options.key = this.options.apikey;
        this.options.format = this.options.format.mime;

        this.sessionId = null;
        this.socket = null;

        this.onFinish = function () {};

        this.buffered = [];
        this.totaldata = 0;
    };

    Recognizer.prototype = /** @lends Recognizer.prototype */{
        /**
         * Send raw data to websocket.
         * @param data Any data to send to websocket (json string, raw audio data).
         * @private
         */
        _sendRaw: function (data) {
            if (this.socket) {
                try {
                    this.socket.send(data);
                } catch (e) {
                    this.options.onError('Socket error: ' + e);
                }
            }
        },
        /**
         * Stringify JSON and send it to websocket.
         * @param {Object} json Object needed to be send to websocket.
         * @private
         */
        _sendJson: function (json) {
            this._sendRaw(JSON.stringify({type: 'message', data: json}));
        },
        /**
         * Р—Р°РїСѓСЃРєР°РµС‚ РїСЂРѕС†РµСЃСЃ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
         */
        start: function () {
            this.sessionId = null;
            try {
                this.socket = new WebSocket(this.options.url);
            } catch (e) {
                this.options.onError('Error on socket creation: ' + e);
                this.options.stopCallback();
                return;
            }

            this.socket.onopen = function () {
                // {uuid: uuid, key: key, format: audioFormat, punctuation: punctuation ...
                // console.log('Initial request: ' + JSON.stringify(this.options));
                this._sendJson(this.options);
            }.bind(this);

            this.socket.onmessage = function (e) {
                try {
                    var message = JSON.parse(e.data);
                } catch (e) {
                    this.options.onError('Error on receiving data from server: ' + e);
                    this.options.stopCallback();
                    return;
                }

                if (message.type == 'InitResponse'){
                    this.sessionId = message.data.sessionId;
                    this.options.onInit(message.data.sessionId, message.data.code);
                } else if (message.type == 'AddDataResponse'){
                    this.options.onResult(message.data.text, message.data.uttr, message.data.merge, message.data.words, message.data.biometry, message.data.metainfo);
                    if (typeof message.data.close !== 'undefined' && message.data.close) {
                        this.close();
                    }
                } else if (message.type == 'Error'){
                    this.options.onError('Session ' + this.sessionId + ': ' + message.data);
                    this.close();
                } else {
                    this.options.onError('Session ' + this.sessionId + ': ' + message);
                    this.close();
                }
            }.bind(this);

            this.socket.onerror = function (error) {
                this.options.onError('Socket error: ' + error.message);
            }.bind(this);

            this.socket.onclose = function (event) {
            }.bind(this);
        },
        /**
         * Р”РѕР±Р°РІР»СЏРµС‚ РґР°РЅРЅС‹Рµ СЃ Р°СѓРґРёРѕ Рє РїРѕС‚РѕРєСѓ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
         * Р•СЃР»Рё СЃРµСЃСЃРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РµС‰Рµ РЅРµ Р±С‹Р»Р° СЃРѕР·РґР°РЅР°, С‚Рѕ РґР°РЅРЅС‹Рµ Р±СѓРґСѓС‚ Р±СѓС„РµСЂРёР·РѕРІР°РЅС‹ Рё РѕС‚РїСЂР°РІСЏС‚СЃСЏ РЅР° СЃРµСЂРІРµСЂ
         * РїРѕ С„Р°РєС‚Сѓ СѓСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ СЃРѕРµРґРёРЅРµРЅРёСЏ.
         * @param {ArrayBuffer} data Р‘СѓС„РµСЂ СЃ Р°СѓРґРёРѕ СЃРёРіРЅР°Р»РѕРј РІ С„РѕСЂРјР°С‚Рµ PCM 16bit.
         */
        addData: function (data) {
            this.totaldata += data.byteLength;

            if (!this.sessionId) {
                this.buffered.push(data);
                return;
            }

            for (var i = 0; i < this.buffered.length; i++){
                this._sendRaw(new Blob([this.buffered[i]], {type: this.options.format}));
                this.totaldata += this.buffered[i].byteLength;
            }

            this.buffered = [];
            this._sendRaw(new Blob([data], {type: this.options.format}));
        },
        /**
         * РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ Р·Р°РІРµСЂС€Р°РµС‚ Р·Р°РїРёСЃСЊ Р·РІСѓРєР° Рё РѕС‚СЃС‹Р»Р°РµС‚ Р·Р°РїСЂРѕСЃ (РЅРµ Р·Р°РєСЂС‹РІР°РµС‚ СЃРµСЃСЃРёСЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ, РїРѕРєР° РЅРµ РїРѕР»СѓС‡РёС‚ РѕС‚ СЃРµСЂРІРµСЂР° РїРѕСЃР»РµРґРЅРёР№ РѕС‚РІРµС‚).
         */
        finish: function (cb) {
            this.onFinish = cb;
            this._sendJson({command: 'finish'});
        },
        /**
         * Р—Р°РІРµСЂС€Р°РµС‚ СЃРµСЃСЃРёСЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё, Р·Р°РєСЂС‹РІР°СЏ СЃРѕРµРґРёРЅРµРЅРёРµ СЃ СЃРµСЂРІРµСЂРѕРј.
         */
        close: function () {
            this.options.onInit = function () {};
            this.options.onResult = this.options.onInit;
            this.options.onError = this.options.onInit;

            this.onFinish();
            if (this.socket) {
                this.socket.close();
                this.options.stopCallback();
            }
            this.socket = null;
        }
    };

    namespace.ya.speechkit.Recognizer = Recognizer;

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕР№ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё
     * СЃРµСЃСЃРёРё.
     * @callback
     * @name initCallback
     * @param {String} sessionId РРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ СЃРµСЃСЃРёРё.
     * @param {Number} code HTTP-СЃС‚Р°С‚СѓСЃ, РєРѕС‚РѕСЂС‹Р№ Р±СѓРґРµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊСЃСЏ РІ РѕС‚РІРµС‚Рµ СЃРµСЂРІРµСЂР° РїРѕСЃР»Рµ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё СЃРµСЃСЃРёРё (200).
     * @memberOf Recognizer
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РІ СЃР»СѓС‡Р°Рµ РІРѕР·РЅРёРєРЅРѕРІРµРЅРёСЏ РѕС€РёР±РєРё.
     * @callback
     * @name errorCallback
     * @param {String} message РўРµРєСЃС‚ СЃРѕРѕР±С‰РµРЅРёСЏ РѕР± РѕС€РёР±РєРµ.
     * @memberOf Recognizer
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ Р·Р°РІРµСЂС€РµРЅРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @callback
     * @name dataCallback
     * @param {String} text Р Р°СЃРїРѕР·РЅР°РЅРЅС‹Р№ С‚РµРєСЃС‚.
     * @param {Boolean} utterance РЇРІР»СЏРµС‚СЃСЏ Р»Рё РґР°РЅРЅС‹Р№ С‚РµРєСЃС‚ С„РёРЅР°Р»СЊРЅС‹Рј СЂРµР·СѓР»СЊС‚Р°С‚РѕРј СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
     * @param {Number} merge Р§РёСЃР»Рѕ РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹С… Р·Р°РїСЂРѕСЃРѕРІ РїРѕ РєРѕС‚РѕСЂС‹Рј РІС‹РґР°РЅ РѕС‚РІРµС‚. (РЎРєРѕР»СЊРєРѕ РїР°РєРµС‚РѕРІ СЃ РґР°РЅРЅС‹РјРё Р±С‹Р»Рё СЃРѕРµРґРёРЅРµРЅС‹ РІ СЌС‚РѕС‚ СЂРµР·СѓР»СЊС‚Р°С‚).
     * @memberOf Recognizer
     */
}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    function noop() {}

    /**
    * РџР°СЂР°РјРµС‚СЂС‹ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РґР»СЏ SpeechRecognition
    * @private
    */
    namespace.ya.speechkit._defaultOptions = function () {
        /**
         * @typedef {Object} SpeechRecognitionOptions
         * @property {SpeechRecognition~initCallback} initCallback - Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ
         * @property {SpeechRecognition~errorCallback} errorCallback - Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ РѕС€РёР±РєРё (РІСЃРµ РѕС€РёР±РєРё - РєСЂРёС‚РёС‡РЅС‹, Рё РїСЂРёРІРѕРґСЏС‚ Рє РїРѕСЂС‡Рµ СЃРµСЃСЃРёРё)
         * @property {SpeechRecognition~dataCallback} dataCallback - Р¤СѓРЅРєС†РёСЏ, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґСѓС‚ РїСЂРёС…РѕРґРёС‚СЊ СЂРµР·СѓР»СЊС‚Р°С‚С‹ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ
         * @property {SpeechRecognition~infoCallback} infoCallback - Р¤СѓРЅРєС†РёСЏ РґР»СЏ С‚РµС…РЅРёС‡РµСЃРєРѕР№ РёРЅС„РѕСЂРјР°С†РёРё
         * @property {SpeechRecognition~stopCallback} stopCallback - Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РІ РјРѕРјРµРЅС‚ РѕСЃС‚Р°РЅРѕРІРєРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ
         * @property {Boolean} punctuation - РЎР»РµРґСѓРµС‚ Р»Рё РїС‹С‚Р°С‚СЊСЃСЏ СЂР°СЃСЃС‚Р°РІР»СЏС‚СЊ Р·РЅР°РєРё РїСЂРµРїРёРЅР°РЅРёСЏ
         * @property {Boolean} allowStringLanguage - РЎР»РµРґСѓРµС‚ Р»Рё РѕС‚РєР»СЋС‡РёС‚СЊ С„РёР»СЊС‚СЂР°С†РёСЋ РѕР±СЃС†РµРЅРЅРѕР№ Р»РµРєСЃРёРєРё
         * @property {String} model - РЇР·С‹РєРѕРІР°СЏ РјРѕРґРµР»СЊ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё
         * @property {String} lang - РЇР·С‹Рє, СЂРµС‡СЊ РЅР° РєРѕС‚РѕСЂРѕРј СЃР»РµРґСѓРµС‚ СЂР°СЃРїРѕР·РЅР°РІР°С‚СЊ
         * @property {ya.speechkit.FORMAT} format - Р¤РѕСЂРјР°С‚ РїРµСЂРµРґР°С‡Рё Р°СѓРґРёРѕ СЃРёРіРЅР°Р»Р°
         * @property {String} [options.applicationName] РќР°Р·РІР°РЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ. Р”Р»СЏ РЅРµРєРѕС‚РѕСЂС‹С… РїСЂРёР»РѕР¶РµРЅРёР№ РјС‹ РїРѕРґРґРµСЂР¶РёРІР°РµРј СЃРїРµС†РёР°Р»СЊРЅСѓСЋ Р»РѕРіРёРєСѓ. РџСЂРёРјРµСЂ - sandbox.
         */
        return {
                initCallback: noop,
                errorCallback: noop,
                dataCallback: noop,
                infoCallback: noop,
                stopCallback: noop,
                punctuation: false,
                allowStrongLanguage: false,
                model: namespace.ya.speechkit.settings.model,
                applicationName: window.location.href,
                device: navigator.userAgent,
                lang: namespace.ya.speechkit.settings.lang,
                format: namespace.ya.speechkit.FORMAT.PCM16,
                url: namespace.ya.speechkit.settings.websocketProtocol +
                        namespace.ya.speechkit.settings.asrUrl,
                vad: false,
                speechStart: noop,
                speechEnd: noop,
            };
    };

    /**
    * РЎРѕР·РґР°РµС‚ РЅРѕРІС‹Р№ РѕР±СЉРµРєС‚ С‚РёРїР° SpeechRecognition.
    * @class РљР»Р°СЃСЃ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ Р±РѕР»СЊС€РѕРіРѕ РїРѕС‚РѕРєР° Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р°.
    * @name SpeechRecognition
    */
    var SpeechRecognition = function () {
        if (!(this instanceof namespace.ya.speechkit.SpeechRecognition)) {
            return new namespace.ya.speechkit.SpeechRecognition();
        }
        this.send = 0;
        this.send_bytes = 0;
        this.proc = 0;
        this.recorder = null;
        this.recognizer = null;
        this.vad = null;
    };

    SpeechRecognition.prototype = /** @lends SpeechRecognition.prototype */ {
        /**
         * Р—Р°РїСѓСЃРєР°РµС‚ РїСЂРѕС†РµСЃСЃ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
         * @param {Object} [options] РџР°СЂР°РјРµС‚СЂС‹, РєРѕС‚РѕСЂС‹Рµ Р±СѓРґСѓС‚ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊСЃСЏ РІРѕ РІСЂРµРјСЏ СЃРµСЃСЃРёРё.
         * @param {callback:initCallback} [options.initCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
         * @param {callback:errorCallback} [options.errorCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ РѕС€РёР±РєРё (РІСЃРµ РѕС€РёР±РєРё РєСЂРёС‚РёС‡РЅС‹ Рё РїСЂРёРІРѕРґСЏС‚ Рє Р·Р°РІРµСЂС€РµРЅРёСЋ СЃРµСЃСЃРёРё).
         * @param {callback:dataCallback} [options.dataCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ Р·Р°РІРµСЂС€РµРЅРёСЏ
         * СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ. Р’ РєР°С‡РµСЃС‚РІРµ Р°СЂРіСѓРјРµРЅС‚Р° РµР№ РїРµСЂРµРґР°СЋС‚СЃСЏ СЂРµР·СѓР»СЊС‚Р°С‚С‹ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
         * @param {callback:infoCallback} [options.infoCallback] Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ С‚РµС…РЅРёС‡РµСЃРєРѕР№ РёРЅС„РѕСЂРјР°С†РёРё.
         * @param {callback:stopCallback} [options.stopCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РІ РјРѕРјРµРЅС‚ РѕСЃС‚Р°РЅРѕРІРєРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
         * @param {String} [options.apikey] API-РєР»СЋС‡. Р•СЃР»Рё РЅРµ Р·Р°РґР°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РєР»СЋС‡, СѓРєР°Р·Р°РЅРЅС‹Р№
         * РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}.
         * @param {Boolean} [options.punctuation=false] РЎР»РµРґСѓРµС‚ Р»Рё РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСѓРЅРєС‚СѓР°С†РёСЋ.
         * @param {Boolean} [options.allowStrongLanguage=false] РЎР»РµРґСѓРµС‚ Р»Рё РѕС‚РєР»СЋС‡РёС‚СЊ С„РёР»СЊС‚СЂР°С†РёСЋ РѕР±СЃС†РµРЅРЅРѕР№ Р»РµРєСЃРёРєРё.
         * @param {String} [options.model='notes'] РЇР·С‹РєРѕРІР°СЏ РјРѕРґРµР»СЊ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё. РЎРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… Р·РЅР°С‡РµРЅРёР№:
         * <ul>
         *     <li>'notes' (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ) вЂ” РѕР±С‰Р°СЏ Р»РµРєСЃРёРєР°;</li>
         *     <li>'queries' вЂ” РєРѕСЂРѕС‚РєРёРµ Р·Р°РїСЂРѕСЃС‹;</li>
         *     <li>'names' вЂ” РёРјРµРЅР°; </li>
         *     <li>'dates' вЂ” РґР°С‚С‹; </li>
         *     <li>'maps' вЂ” С‚РѕРїРѕРЅРёРјС‹;</li>
         *     <li>'notes' вЂ” С‚РµРєСЃС‚С‹;</li>
         *     <li>'numbers' вЂ” С‡РёСЃР»Р°.</li>
         * </ul>
         * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
         * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ
         * РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РјРѕРґРµР»СЊ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ вЂ” 'notes'. </p>
         * @param {String} [options.applicationName] РќР°Р·РІР°РЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ. Р”Р»СЏ РЅРµРєРѕС‚РѕСЂС‹С… РїСЂРёР»РѕР¶РµРЅРёР№ РјС‹ РїРѕРґРґРµСЂР¶РёРІР°РµРј СЃРїРµС†РёР°Р»СЊРЅСѓСЋ Р»РѕРіРёРєСѓ. РџСЂРёРјРµСЂ - sandbox.
         * @param {String} [options.lang='ru-RU'] РЇР·С‹Рє, СЂРµС‡СЊ РЅР° РєРѕС‚РѕСЂРѕРј СЃР»РµРґСѓРµС‚ СЂР°СЃРїРѕР·РЅР°РІР°С‚СЊ. Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ: 'ru-RU', 'en-US', 'tr-TR'.
         * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
         * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
         * РІС‹Р±РёСЂР°РµС‚СЃСЏ СЂСѓСЃСЃРєРёР№ СЏР·С‹Рє: 'ru-RU'. </p>
         * @param {ya.speechkit.FORMAT} [options.format=ya.speechkit.FORMAT.PCM16] Р¤РѕСЂРјР°С‚ РїРµСЂРµРґР°С‡Рё Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р°.
         * @param {Boolean} [options.partialResults=true] РћС‚РїСЂР°РІР»СЏС‚СЊ Р»Рё РЅР° СЃРµСЂРІРµСЂ РїСЂРѕРјРµР¶СѓС‚РѕС‡РЅС‹Рµ СЂРµР·СѓР»СЊС‚Р°С‚С‹.
         * @param {Number} [options.utteranceSilence=120] Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ РїСЂРѕРјРµР¶СѓС‚РєР° С‚РёС€РёРЅС‹ РІРѕ РІСЂРµРјСЏ Р·Р°РїРёСЃРё СЂРµС‡Рё (РІ РґРµСЃСЏС‚РєР°С… РјРёР»Р»РёСЃРµРєСѓРЅРґ). РљР°Рє С‚РѕР»СЊРєРѕ РІСЃС‚СЂРµС‡Р°РµС‚СЃСЏ
         * С‚Р°РєРѕР№ РїРµСЂРµСЂС‹РІ РІ СЂРµС‡Рё, Р·Р°РїРёСЃСЊ Р·РІСѓРєР° РѕСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ, Рё Р·Р°РїРёСЃР°РЅРЅС‹Р№ С„СЂР°РіРјРµРЅС‚ СЂРµС‡Рё РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РЅР° СЃРµСЂРІРµСЂ.
         * @param {Number} [options.expNumCount=0] РљРѕР»РёС‡РµСЃС‚РІРѕ РѕР¶РёРґР°РµРјС‹С… РїРѕРґСЂСЏРґ РёРґСѓС‰РёС… С†РёС„СЂ (РїСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РёС… РїСЂРµРІСЂР°С‰РµРЅРёРµ РІ С‚РµР»РµС„РѕРЅРЅС‹Рµ РЅРѕРјРµСЂР°).
         */
        start: function (options) {
            this.options = namespace.ya.speechkit._extend(
                                namespace.ya.speechkit._extend(
                                    {},
                                    namespace.ya.speechkit._defaultOptions()
                                ),
                                options);
            if (namespace.ya.speechkit.settings.langWhitelist.indexOf(this.options.lang) >= 0) {
                if (namespace.ya.speechkit._stream !== null) {
                    this._onstart();
                } else {
                    namespace.ya.speechkit.initRecorder(
                        this._onstart.bind(this),
                        this.options.errorCallback
                    );
                }
            } else {
                var old_error_callback = this.options.errorCallback;
                this.recorder = namespace.ya.speechkit.WebAudioRecognition(
                    namespace.ya.speechkit._extend(
                    this.options,
                    {
                        errorCallback: function (e) {
                            this.recorder = null;
                            old_error_callback(e);
                        }.bind(this)
                    }
                    ));
                this.recorder.start();
            }
        },
        /**
         * Will be called after successful call of initRecorder
         * @private
         */
        _onstart: function () {
            if (this.recorder && this.recorder.isPaused()) {
                this.recorder.start();
            }

            if (this.recognizer) {
                return;
            }

            this.send = 0;
            this.send_bytes = 0;
            this.proc = 0;

            if (!this.recorder) {
                this.recorder = new namespace.ya.speechkit.Recorder();
                if (this.options.vad) {
                    this.vad = new namespace.ya.speechkit.Vad({recorder: this.recorder,
                                                     speechStart: this.options.speechStart,
                                                     speechEnd: this.options.speechEnd});
                }
            }

            this.recognizer = new namespace.ya.speechkit.Recognizer(
                namespace.ya.speechkit._extend(this.options,
                {
                    onInit: function (sessionId, code) {
                        if (code != 200) {
                            this.options.errorCallback("Session initialization failed. Response code " + code);
                            this.abort();
                            return;
                        }
                        this.recorder.start(function (data) {
                            if (this.options.vad && this.vad) {
                                this.vad.update();
                            }
                            this.send++;
                            this.send_bytes += data.byteLength;
                            this.options.infoCallback({
                                send_bytes: this.send_bytes,
                                format: this.options.format,
                                send_packages: this.send,
                                processed: this.proc
                            });
                            if (this.recognizer) {
                                this.recognizer.addData(data);
                            }
                        }.bind(this), this.options.format);

                        this.options.initCallback(sessionId, code, 'yandex');
                    }.bind(this),
                    onResult: function (text, uttr, merge, words, biometry, metainfo) {
                                this.proc += merge;
                                this.options.infoCallback({
                                    send_bytes: this.send_bytes,
                                    format: this.options.format,
                                    send_packages: this.send,
                                    processed: this.proc
                                });
                                this.options.dataCallback(text, uttr, merge, words, biometry, metainfo);
                            }.bind(this),
                    onError: function (msg) {
                                if (this.recorder) {
                                    this.recorder.stop(function () { this.recorder = null; }.bind(this));
                                }
                                if (this.recognizer) {
                                    this.recognizer.close();
                                    this.recognizer = null;
                                }
                                this.options.errorCallback(msg);
                            }.bind(this),
                }));
            this.recognizer.start();
        },
        /**
         * Р—Р°РІРµСЂС€Р°РµС‚ СЃРµСЃСЃРёСЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
         * РџРѕ Р·Р°РІРµСЂС€РµРЅРёРё СЃРµСЃСЃРёРё Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° С„СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє stopCallback.
         */
        stop: function () {
            if (this.recognizer) {
                this.recognizer.finish(function () {
                    if (this.recorder) {
                        this.recorder.stop(
                            function () {
                                this.recorder = null;
                                this.recognizer = null;
                            }.bind(this)
                        );
                    }
                }.bind(this));

            }

            if (!this.recognizer && this.recorder) {
                this.recorder.stop(
                    function () {
                        this.recorder = null;
                        this.recognizer = null;
                    }.bind(this)
                );
            }
        },
        /**
         * РџСЂРµСЂС‹РІР°РµС‚ СЃРµСЃСЃРёСЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё (РЅРµ РґРѕР¶РёРґР°РµС‚СЃСЏ С„РёРЅР°Р»СЊРЅРѕРіРѕ СЂРµР·СѓР»СЊС‚Р°С‚Р° СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ).
         * РџРѕ Р·Р°РІРµСЂС€РµРЅРёРё СЃРµСЃСЃРёРё Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° С„СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє stopCallback.
         */
        abort: function () {
            if (this.recognizer) {
                this.recognizer.close();
            }
            if (this.recorder) {
                this.recorder.stop(
                    function () {
                        this.recognizer = null;
                        this.recorder = null;
                    }.bind(this)
                );
            }
        },
        /**
         * РЎС‚Р°РІРёС‚ СЃРµСЃСЃРёСЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РЅР° РїР°СѓР·Сѓ.
         * Р§С‚РѕР±С‹ СЃРѕРµРґРёРЅРµРЅРёРµ СЃ СЃРµСЂРІРµСЂРѕРј РЅРµ РїСЂРµСЂС‹РІР°Р»РѕСЃСЊ Рё РјРѕР¶РЅРѕ Р±С‹Р»Рѕ РјРѕРјРµРЅС‚Р°Р»СЊРЅРѕ РІРѕР·РѕР±РЅРѕРІРёС‚СЊ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµ,
         * РЅР° СЃРµСЂРІРµСЂ РїРµСЂРёРѕРґРёС‡РµСЃРєРё РїРѕСЃС‹Р»Р°СЋС‚СЃСЏ РЅРµР±РѕР»СЊС€РёРµ РєСѓСЃРєРё РґР°РЅРЅС‹С….
         */
        pause: function () {
            if (this.recorder) {
                this.recorder.pause();
            }
        },
        /**
         * РћРїСЂРµРґРµР»СЏРµС‚, СЃС‚РѕРёС‚ Р»Рё РЅР° РїР°СѓР·Рµ СЃРµСЃСЃРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
         * @returns {Boolean} true, РµСЃР»Рё СЃРµСЃСЃРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё СЃС‚РѕРёС‚ РЅР° РїР°СѓР·Рµ, false вЂ” РёРЅР°С‡Рµ.
         */
        isPaused: function () {
            return (!this.recorder || this.recorder.isPaused());
        }
    };

    ya.speechkit.SpeechRecognition = SpeechRecognition;

    /**
     * Р¤СѓРЅРєС†РёСЏ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РєРѕСЂРѕС‚РєРёС… С„СЂР°РіРјРµРЅС‚РѕРІ СЂРµС‡Рё.
     * <p> РџСЂРё РІС‹Р·РѕРІРµ С„СѓРЅРєС†РёРё recognize() РЅР°С‡РёРЅР°РµС‚СЃСЏ Р·Р°РїРёСЃСЊ Р·РІСѓРєР° СЃ РјРёРєСЂРѕС„РѕРЅР°.
     * РљР°Рє С‚РѕР»СЊРєРѕ РЅР°СЃС‚СѓРїР°РµС‚ С‚РёС€РёРЅР° Р±РѕР»РµРµ С‡РµРј РЅР° РѕРґРЅСѓ СЃРµРєСѓРЅРґСѓ, Р·Р°РїРёСЃСЊ
     * РїСЂРµРєСЂР°С‰Р°РµС‚СЃСЏ, Рё С„СѓРЅРєС†РёСЏ РѕС‚РїСЂР°РІР»СЏРµС‚ Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂРІРµСЂ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ Р·Р°РїРёСЃР°РЅРЅРѕРіРѕ С„СЂР°РіРјРµРЅС‚Р°.</p>
     * <p>РџСЂРёРµРјР»РµРјРѕРµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РѕР±РµСЃРїРµС‡РёРІР°РµС‚СЃСЏ РЅР° С„СЂР°РіРјРµРЅС‚Р°С… РґР»РёС‚РµР»СЊРЅРѕСЃС‚СЊСЋ РЅРµ Р±РѕР»РµРµ 10 СЃРµРєСѓРЅРґ.
     * РџСЂРё Р±РѕР»РµРµ РґР»РёС‚РµР»СЊРЅРѕРј С„СЂР°РіРјРµРЅС‚Рµ РєР°С‡РµСЃС‚РІРѕ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СѓС…СѓРґС€Р°РµС‚СЃСЏ.</p>
     * @static
     * @function
     * @name recognize
     * @param {Object} [options] РџР°СЂР°РјРµС‚СЂС‹ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @param {callback:SpeechRecognition.initCallback} [options.initCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ С„Р°РєС‚Сѓ
     * РёРЅРёС†РёР°Р»РёР·Р°С†РёРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
     * @param {callback:SpeechRecognition.errorCallback} [options.errorCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїСЂРё РІРѕР·РЅРёРєРЅРѕРІРµРЅРёРё РѕС€РёР±РєРё
     * (РІСЃРµ РѕС€РёР±РєРё РєСЂРёС‚РёС‡РЅС‹ Рё РїСЂРёРІРѕРґСЏС‚ Рє Р·Р°РІРµСЂС€РµРЅРёСЋ СЃРµСЃСЃРёРё).
     * @param {callback:SpeechRecognition.recognitionDoneCallback} [options.doneCallback] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґРµС‚ РѕС‚РїСЂР°РІР»РµРЅ СЂРµР·СѓР»СЊС‚Р°С‚ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @param {String} [options.apikey] API-РєР»СЋС‡. РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїСЂРёРЅРёРјР°РµС‚ Р·РЅР°С‡РµРЅРёРµ, СѓРєР°Р·Р°РЅРЅРѕРµ
     * РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}.
     * @param {String} [options.model='notes'] РЎРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… Р·РЅР°С‡РµРЅРёР№:
     * <ul>
     *     <li>'notes' (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ) вЂ” С‚РµРєСЃС‚;</li>
     *     <li>'queries' вЂ” РєРѕСЂРѕС‚РєРёРµ Р·Р°РїСЂРѕСЃС‹;</li>
     *     <li>'names' вЂ” РёРјРµРЅР°; </li>
     *     <li>'dates' вЂ” РґР°С‚С‹; </li>
     *     <li>'maps' вЂ” С‚РѕРїРѕРЅРёРјС‹;</li>
     *     <li>'notes' вЂ” С‚РµРєСЃС‚С‹;</li>
     *     <li>'numbers' вЂ” С‡РёСЃР»Р°.</li>
     * </ul>
     * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
     * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ
     * РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РјРѕРґРµР»СЊ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ вЂ” 'notes'. </p>
     * @param {String} [options.applicationName] РќР°Р·РІР°РЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ. Р”Р»СЏ РЅРµРєРѕС‚РѕСЂС‹С… РїСЂРёР»РѕР¶РµРЅРёР№ РјС‹ РїРѕРґРґРµСЂР¶РёРІР°РµРј СЃРїРµС†РёР°Р»СЊРЅСѓСЋ Р»РѕРіРёРєСѓ. РџСЂРёРјРµСЂ вЂ” sandbox.
     * @param {String} [options.lang='ru-RU'] РЇР·С‹Рє, СЂРµС‡СЊ РЅР° РєРѕС‚РѕСЂРѕРј СЃР»РµРґСѓРµС‚ СЂР°СЃРїРѕР·РЅР°РІР°С‚СЊ. Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ: 'ru-RU', 'en-US', 'tr-TR'.
     * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
     * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
     * РІС‹Р±РёСЂР°РµС‚СЃСЏ СЂСѓСЃСЃРєРёР№ СЏР·С‹Рє: 'ru-RU'. </p>
     * @param {Boolean} [options.partialResults=true] РћС‚РїСЂР°РІР»СЏС‚СЊ Р»Рё РЅР° СЃРµСЂРІРµСЂ РїСЂРѕРјРµР¶СѓС‚РѕС‡РЅС‹Рµ СЂРµР·СѓР»СЊС‚Р°С‚С‹.
     * @param {Number} [options.utteranceSilence=120] Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ РїСЂРѕРјРµР¶СѓС‚РєР° С‚РёС€РёРЅС‹ РІРѕ РІСЂРµРјСЏ Р·Р°РїРёСЃРё СЂРµС‡Рё (РІ РґРµСЃСЏС‚РєР°С… РјРёР»Р»РёСЃРµРєСѓРЅРґ). РљР°Рє С‚РѕР»СЊРєРѕ РІСЃС‚СЂРµС‡Р°РµС‚СЃСЏ
     * С‚Р°РєРѕР№ РїРµСЂРµСЂС‹РІ РІ СЂРµС‡Рё, Р·Р°РїРёСЃСЊ Р·РІСѓРєР° РѕСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ, Рё Р·Р°РїРёСЃР°РЅРЅС‹Р№ С„СЂР°РіРјРµРЅС‚ СЂРµС‡Рё РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РЅР° СЃРµСЂРІРµСЂ.
     */

    namespace.ya.speechkit.recognize = function (options) {
        var dict = new namespace.ya.speechkit.SpeechRecognition();

        var opts = namespace.ya.speechkit._extend(
                        namespace.ya.speechkit._extend(
                            {},
                            namespace.ya.speechkit._defaultOptions()
                        ),
                        options);

        opts.doneCallback = options.doneCallback;

        opts.dataCallback = function (text, uttr, merge) {
            if (uttr) {
                if (opts.doneCallback) {
                    opts.doneCallback(text);
                }
                dict.stop();
            }
        };

        opts.stopCallback = function () {
            dict = null;
        };

        dict.start(opts);
    };

    /**
     * Р¤СѓРЅРєС†РёСЏ, РІ РєРѕС‚РѕСЂСѓСЋ РїРµСЂРµРґР°РµС‚СЃСЏ РїРѕР»РЅРѕСЃС‚СЊСЋ СЂР°СЃРїРѕР·РЅР°РЅРЅС‹Р№ С„СЂР°РіРјРµРЅС‚ С‚РµРєСЃС‚Р°.
     * @param {String} text Р Р°СЃРїРѕР·РЅР°РЅРЅР°СЏ СЂРµС‡СЊ.
     * @callback
     * @name recognitionDoneCallback
     * @memberOf SpeechRecognition
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕР№ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @callback
     * @name initCallback
     * @memberOf SpeechRecognition
     * @param {String} sessionId РРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ СЃРµСЃСЃРёРё.
     * @param {Number} code HTTP-СЃС‚Р°С‚СѓСЃ, РєРѕС‚РѕСЂС‹Р№ Р±СѓРґРµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊСЃСЏ РІ РѕС‚РІРµС‚Рµ СЃРµСЂРІРµСЂР° (200 РІ СЃР»СѓС‡Р°Рµ СѓСЃРїРµС…Р°).
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ, РІ РєРѕС‚РѕСЂСѓСЋ Р±СѓРґСѓС‚ РїРµСЂРµРґР°РЅС‹ СЃРѕРѕР±С‰РµРЅРёСЏ РѕР± РѕС€РёР±РєР°С….
     * @callback
     * @name errorCallback
     * @memberOf SpeechRecognition
     * @param {String} message РўРµРєСЃС‚ СЃРѕРѕР±С‰РµРЅРёСЏ РѕР± РѕС€РёР±РєРµ.
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ РґР»СЏ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @callback
     * @name dataCallback
     * @memberOf SpeechRecognition
     * @param {String} text Р Р°СЃРїРѕР·РЅР°РЅРЅС‹Р№ С‚РµРєСЃС‚.
     * @param {Boolean} utterance РЇРІР»СЏРµС‚СЃСЏ Р»Рё РґР°РЅРЅС‹Р№ С‚РµРєСЃС‚ С„РёРЅР°Р»СЊРЅС‹Рј СЂРµР·СѓР»СЊС‚Р°С‚РѕРј СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
     * @param {Number} merge Р§РёСЃР»Рѕ РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹С… Р·Р°РїСЂРѕСЃРѕРІ, РїРѕ РєРѕС‚РѕСЂС‹Рј РІС‹РґР°РЅ РѕС‚РІРµС‚ РѕС‚ СЃРµСЂРІРµСЂР°.
     */

    /**
     * Р’ СЌС‚Сѓ С„СѓРЅРєС†РёСЋ Р±СѓРґРµС‚ РїРµСЂРµРґР°РІР°С‚СЊСЃСЏ С‚РµС…РЅРёС‡РµСЃРєР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ.
     * @callback
     * @name infoCallback
     * @memberOf SpeechRecognition.
     * @param {Number} send_bytes РЎРєРѕР»СЊРєРѕ Р±Р°Р№С‚ Р°СѓРґРёРѕ-РґР°РЅРЅС‹С… Р±С‹Р»Рѕ РїРµСЂРµРґР°РЅРѕ РЅР° СЃРµСЂРІРµСЂ.
     * @param {Number} send_packages РЎРєРѕР»СЊРєРѕ РїР°РєРµС‚РѕРІ Р°СѓРґРёРѕ-РґР°РЅРЅС‹С… Р±С‹Р»Рѕ РїРµСЂРµРґР°РЅРѕ РЅР° СЃРµСЂРІРµСЂ.
     * @param {Number} processed РљРѕР»РёС‡РµСЃС‚РІРѕ РїР°РєРµС‚РѕРІ, РЅР° РєРѕС‚РѕСЂС‹Рµ РѕС‚РІРµС‚РёР» СЃРµСЂРІРµСЂ.
     * @param {ya.speechkit.FORMAT} format РљР°РєРѕР№ С„РѕСЂРјР°С‚ Р°СѓРґРёРѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ.
     */

    /**
     * Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ РѕСЃС‚Р°РЅРѕРІРєРё СЃРµСЃСЃРёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё.
     * @callback
     * @name stopCallback
     * @memberOf SpeechRecognition
     */
}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    var speakersCache = null;

    /**
     * Р’РѕСЃРїСЂРѕРёР·РІРѕРґРёС‚ Р°СѓРґРёРѕС„Р°Р№Р».
     * @function
     * @static
     * @param {String | <xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref>} url URL, РїРѕ РєРѕС‚РѕСЂРѕРјСѓ РґРѕСЃС‚СѓРїРµРЅ Р»РёР±Рѕ Р°СѓРґРёРѕ-С„Р°Р№Р»,
     * Р»РёР±Рѕ РѕР±СЉРµРєС‚ <xref href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" scope="external">Blob</xref> СЃРѕ Р·РІСѓРєРѕРј РІ РїРѕРґРґРµСЂР¶РёРІР°РµРјРѕРј Р±СЂР°СѓР·РµСЂРѕРј С„РѕСЂРјР°С‚Рµ.
     * @param {Function} [cb] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ Р·Р°РІРµСЂС€РµРЅРёСЏ РІРѕСЃРїСЂРѕРёР·РІРµРґРµРЅРёСЏ.
     * @name play
     */
    namespace.ya.speechkit.play = function (url, cb) {
        var audio = new Audio(url);
        audio.volume = 1.0;
        audio.onended = cb || function () {};
        audio.play();
    };

    /**
     * @class РљР»Р°СЃСЃ, РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ РґР»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ С‚РµС…РЅРѕР»РѕРіРёРё СЃРёРЅС‚РµР·Р° СЂРµС‡Рё (РѕР·РІСѓС‡РёРІР°РЅРёСЏ С‚РµРєСЃС‚Р°).
     * @name Tts
     * @param {TtsOptions} [options] РћРїС†РёРё.
     * @param {String} [options.apikey] API-РєР»СЋС‡ (РµСЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… РєР»СЋС‡ РЅРµ Р±С‹Р» СѓРєР°Р·Р°РЅ, С‚Рѕ РІ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂРµ РµРіРѕ РЅРµРѕР±С…РѕРґРёРјРѕ СѓРєР°Р·Р°С‚СЊ).
     * @param {String} [options.emotion='neutral'] Р­РјРѕС†РёРѕРЅР°Р»СЊРЅР°СЏ РѕРєСЂР°СЃРєР° РіРѕР»РѕСЃР°. Р”РѕСЃС‚СѓРїРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
     * <ul>
     *     <li>'neutral' вЂ” РЅРµР№С‚СЂР°Р»СЊРЅС‹Р№ (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ);</li>
     *     <li>'good' вЂ” РґРѕР±СЂРѕР¶РµР»Р°С‚РµР»СЊРЅС‹Р№;</li>
     *     <li>'evil' вЂ” Р·Р»РѕР№.</li>
     * </ul>
     * @param {Array} [options.emotions] РњР°СЃСЃРёРІ СЌРјРѕС†РёР№ РІРёРґР° [['emotion1', weight1], ['emotion2', weight2]], РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ РґР»СЏ РІР·РІРµС€РµРЅРЅРѕРіРѕ СЃРјРµС€РёРІР°РЅРёСЏ СЌРјРѕС†РёР№
     * @param {String} [options.speaker='omazh'] Р“РѕР»РѕСЃ РґР»СЏ РѕР·РІСѓС‡РёРІР°РЅРёСЏ. РЎРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… Р·РЅР°С‡РµРЅРёР№ РјРѕР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ РІС‹Р·РІР°РІ С„СѓРЅРєС†РёСЋ Tts.speakers:
     * * <ul>
     *     <li>Р¶РµРЅСЃРєРёРµ РіРѕР»РѕСЃР°: 'omazh' (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ) Рё 'jane';</li>
     *     <li>'РјСѓР¶СЃРєРёРµ РіРѕР»РѕСЃР°: 'zahar' Рё 'ermil'.</li>
     * </ul>
     * @param {Array} [options.speakers] РњР°СЃСЃРёРІ РіРѕР»РѕСЃРѕРІ РІРёРґР° [['speaker1', weight1], ['speaker2', weight2]], РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ РґР»СЏ РІР·РІРµС€РµРЅРЅРѕРіРѕ СЃРјРµС€РёРІР°РЅРёСЏ РіРѕР»РѕСЃРѕРІ.
     * weight РјРѕР¶РµС‚ РїСЂРёРЅРёРјР°С‚СЊ Р·РЅР°С‡РµРЅРёСЏ РѕС‚ 1.0 РґРѕ 3.0. РќР°РїСЂРёРјРµСЂ, [['omazh', 1.5], ['zahar', 2.2]].
     * @param {Array} [options.genders] РњР°СЃСЃРёРІ РїРѕР»РѕРІ РІРёРґР° [['gender1', weight1], ['gender2', weight2]], РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ РґР»СЏ РІР·РІРµС€РµРЅРЅРѕРіРѕ СЃРјРµС€РёРІР°РЅРёСЏ РїРѕР»РѕРІ РіРѕРІРѕСЂСЏС‰РµРіРѕ.
     * weight РјРѕР¶РµС‚ РїСЂРёРЅРёРјР°С‚СЊ Р·РЅР°С‡РµРЅРёСЏ РѕС‚ 1.0 РґРѕ 3.0.
     * @param {Boolean} [options.fast=false] РСЃРїРѕР»СЊР·РѕРІР°С‚СЊ "Р±С‹СЃС‚СЂС‹Р№" СЃРёРЅС‚РµР·, РєРѕС‚РѕСЂС‹Р№ СѓСЃРєРѕСЂСЏРµС‚ РіРµРЅРµСЂР°С†РёСЋ Р·РІСѓРєР° РїСѓС‚С‘Рј СѓРјРµРЅСЊС€РµРЅРёСЏ РµРіРѕ РєР°С‡РµСЃС‚РІР°.
     * @param {String} [options.lang='ru-RU'] РЇР·С‹Рє С‚РµРєСЃС‚Р°, РєРѕС‚РѕСЂС‹Р№ РЅР°РґРѕ РїСЂРѕРёР·РЅРµСЃС‚Рё. Р”РѕСЃС‚СѓРїРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ: 'ru-RU', 'en-US', 'tr-TR', 'uk-UA'.
     * @param {Float} [options.speed=1.0] РЎРєРѕСЂРѕСЃС‚СЊ СЃРёРЅС‚РµР·Р° СЂРµС‡Рё. РџСЂРёРЅРёРјР°РµС‚ Р·РЅР°С‡РµРЅРёСЏ РѕС‚ 0.0 (РјРµРґР»РµРЅРЅРѕ) РґРѕ 2.0 (Р±С‹СЃС‚СЂРѕ).
     */
    var Tts = function (options) {
        if (!(this instanceof namespace.ya.speechkit.Tts)) {
            return new namespace.ya.speechkit.Tts(options);
        }
        var _this = this;
        /**
         * РћРїС†РёРё РѕР·РІСѓС‡РёРІР°РЅРёСЏ С‚РµРєСЃС‚Р°.
         * @type TtsOptions
         * @name Tts.options
         * @field
         */
        this.options = namespace.ya.speechkit._extend(
                        {
                            apikey: namespace.ya.speechkit.settings.apikey,
                            uuid: namespace.ya.speechkit.settings.uuid,
                            url: namespace.ya.speechkit.settings.websocketProtocol +
                                namespace.ya.speechkit.settings.ttsStreamUrl,
                            applicationName: window.location.href,
                            device: navigator.userAgent,
                            infoCallback: function () {},
                            errorCallback: function (msg) {
                                                console.log(msg);
                                            },
                        },
                        options);
        this.sessionId = null;
        this.socket = null;

        this.buffered = [];

    };

    Tts.prototype = /** @lends Tts.prototype */{
        /**
         * Send raw data to websocket
         * @param data Any data to send to websocket (json string, raw audio data)
         * @private
         */
        _sendRaw: function (data) {
            if (this.socket) {
                this.socket.send(data);
            }
        },
        /**
         * Stringify JSON and send it to websocket
         * @param {Object} json Object needed to be send to websocket
         * @private
         */
        _sendJson: function (json) {
            this._sendRaw(JSON.stringify({type: 'message', data: json}));
        },
        /**
         * @private
         * РћР·РІСѓС‡РёРІР°РЅРёРµ С‚РµРєСЃС‚Р°.
         * @param {String} text РўРµРєСЃС‚.
         * @param {Function} [cb] Р¤СѓРЅРєС†РёСЏ-РѕР±СЂР°Р±РѕС‚С‡РёРє, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕ Р·Р°РІРµСЂС€РµРЅРёРё РІРѕСЃРїСЂРѕРёР·РІРµРґРµРЅРёСЏ.
         * @param {TtsOptions} [options] РћРїС†РёРё.
         */
        say: function (text, cb, options) {
            this.speak(
                text,
                namespace.ya.speechkit._extend(
                this.options,
                    namespace.ya.speechkit._extend(
                        {
                            dataCallback: function (blob) {
                                var url = URL.createObjectURL(blob);
                                namespace.ya.speechkit.play(url, cb);
                            }
                        },
                    options)
                )
            );
        },
        /**
         * РћР·РІСѓС‡РёРІР°РЅРёРµ С‚РµРєСЃС‚Р°.
         * @param {TtsOptions} text РћРїС†РёРё.
         * @param {TtsOptions} [options] РћРїС†РёРё.
         */
        speak: function (text, options) {
            var opts = namespace.ya.speechkit._extend(
                            namespace.ya.speechkit._extend(
                            {text: text},
                            this.options),
                        options);
            try {
                this.socket = new WebSocket(opts.url);
            } catch (e) {
                opts.errorCallback('Error on socket creation: ' + e);
                return;
            }

            var context = namespace.ya.speechkit.audiocontext || new namespace.ya.speechkit.AudioContext();
            namespace.ya.speechkit.audiocontext = context;

            this.socket.onopen = function () {
                this._sendJson(opts);
            }.bind(this);

            var play_queue = [];
            var playing = false;

            this.socket.binaryType = 'arraybuffer';

            this.socket.onmessage = function (e) {
                var message = {};
                if (e.data && e.data[0] == '{') {
                    try {
                        message = JSON.parse(e.data);
                    } catch (ex) {
                        message = {type: 'Audio', data: e.data};
                    }
                } else {
                    message = {type: 'Audio', data: e.data};
                }
                if (message.type == 'InitResponse') {
                    this.sessionId = message.data.sessionId;
                } else if (message.type == 'Error') {
                    opts.errorCallback('Session ' + this.sessionId + ': ' + message.data);
                    this.socket.onclose = function () {};
                    this.socket.close();
                } else if (message.type == 'Phonemes') {
                    opts.infoCallback(message.data);
                } else if (message.type == 'Audio') {
                    play_queue.push(message.data);
                } else {
                    opts.errorCallback('Session ' + this.sessionId + ': ' + message);
                    this.socket.onclose = function () {};
                    this.socket.close();
                }
            }.bind(this);

            this.socket.onerror = function (error) {
                opts.errorCallback('Socket error: ' + error.message);
            }.bind(this);

            this.socket.onclose = function (event) {
                /* Hello, Mozilla */
                var tmp = new Uint8Array(play_queue[0]);
                var wav_len = play_queue.reduce(function(prev, now, i, arr) {return prev + now.byteLength;}, 0);

                var size_of_wav = wav_len - 8;
                var data_size = wav_len - 44;
                for (var i=0; i<4; i++) {
                    tmp[4 + i] = size_of_wav % 256;
                    size_of_wav /= 256;
                    tmp[40 + i] = data_size % 256;
                    data_size /= 256;
                }

                var res = Array.prototype.concat.apply([], play_queue);
                var blob = new Blob(res, {type: 'audio/x-wav'});
                if (typeof opts.dataCallback !== 'undefined') {
                    opts.dataCallback(blob);
                } else {
                    var url = URL.createObjectURL(blob);
                    namespace.ya.speechkit.play(url, opts.stopCallback);
                }
            }.bind(this);
        },
        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ СЃРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… РіРѕР»РѕСЃРѕРІ Рё СЌРјРѕС†РёР№.
         * @param {String} [lang] РЇР·С‹Рє, РґР»СЏ РєРѕС‚РѕСЂРѕРіРѕ СЃР»РµРґСѓРµС‚ РІРµСЂРЅСѓС‚СЊ СЃРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… СЏР·С‹РєРѕРІ
         * @returns {Promise} Promise, РєРѕС‚РѕСЂС‹Р№ РІРµСЂРЅС‘С‚ РІ resolve СЃРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… СЏР·С‹РєРѕРІ Рё СЌРјРѕС†РёР№
         */
        speakers: function (lang) {
            return new Promise(function (resolve, reject) {

                if (speakersCache) {
                    resolve(speakersCache);
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', this.options.url.replace('wss://', 'https://')
                                                    .replace('ws://', 'http://')
                                                    .replace('ttssocket.ws', 'speakers?engine=ytcp&lang=' + (lang || '')));

                    xhr.onreadystatechange = function () {
                        if (this.readyState == 4) {
                            if (this.status == 200) {
                                try {
                                    speakersCache = JSON.parse(this.responseText);
                                    resolve(speakersCache);
                                } catch (ex) {
                                    reject(ex.message);
                                }
                            } else {
                                reject('Can\'t get speakers list!');
                            }
                        }
                    };

                    xhr.send();
                }
            }.bind(this));
        },
    };

    namespace.ya.speechkit.Tts = Tts;
}(this));

(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    var WebAudioRecognition = function (options) {
        if (!(this instanceof namespace.ya.speechkit.WebAudioRecognition)) {
            return new namespace.ya.speechkit.WebAudioRecognition(options);
        }
        this.recognition = null;
        this.recorder = null;
        this.options = namespace.ya.speechkit._extend(
                                namespace.ya.speechkit._extend(
                                    namespace.ya.speechkit._defaultOptions(),
                                    options),
                                {format: namespace.ya.speechkit.FORMAT.PCM44});
    };

    WebAudioRecognition.prototype = {
        _onstart: function () {
            this.send = 0;
            this.send_bytes = 0;

            this.recognition = namespace.ya.speechkit._extend(this.recognition,
                {
                    interim_transcript: '',
                    lang: this.options.lang,
                    onend: this.stop.bind(this),
                    onresult: function (event) {
                        this.interim_transcript = '';
                        var arr = [];
                        for (var i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                arr.push({0:{
                                    transcript: event.results[i][0].transcript,
                                    confidence: event.results[i][0].confidence
                                }});
                                this.backref.options.dataCallback(event.results[i][0].transcript, true, 1);
                                this.interim_transcript = '';
                            } else {
                                this.interim_transcript += event.results[i][0].transcript;
                            }
                        }
                        if (arr.length) {
                            this.backref.recognizer._sendJson(arr);
                        }
                        this.backref.options.dataCallback(this.interim_transcript, false, 1);
                    },
                    continuous: true,
                    interimResults: true,
                    maxAlternatives: 5,
                    errorCallback: this.options.errorCallback,
                    onerror: function (e) { this.errorCallback(e.error); }
                });
            this.recognition.backref = this;

            this.recorder = new namespace.ya.speechkit.Recorder();
            this.recognizer = new namespace.ya.speechkit.Recognizer(
                namespace.ya.speechkit._extend(this.options,
                {
                    url: this.options.url.replace('asrsocket.ws', 'logsocket.ws'),
                    samplerate: this.options.format.sampleRate,
                    onInit: function (sessionId, code) {
                        this.recorder.start(function (data) {
                            if (this.options.vad && this.vad) {
                                this.vad.update();
                            }
                            this.send++;
                            this.send_bytes += data.byteLength;
                            this.options.infoCallback({
                                send_bytes: this.send_bytes,
                                format: this.options.format,
                                send_packages: this.send,
                                processed: this.proc
                            });
                            this.recognizer.addData(data);
                        }.bind(this), this.options.format);
                        this.recognition.onstart = this.options.initCallback.bind(this, sessionId, code, 'native');
                        this.recognition.start();
                    }.bind(this),
                    onResult: function () {},
                    onError: function (msg) {
                                this.recorder.stop(function () {});
                                this.recognizer.close();
                                this.recognizer = null;
                                this.options.errorCallback(msg);
                            }.bind(this),
                }));
            this.recognizer.start();
        },
        start: function () {
            if (typeof namespace.webkitSpeechRecognition !== 'undefined') {
                this.recognition = new namespace.webkitSpeechRecognition();

                if (namespace.ya.speechkit._stream !== null) {
                    this._onstart();
                } else {
                    namespace.ya.speechkit.initRecorder(
                        this._onstart.bind(this),
                        this.options.errorCallback
                    );
                }
            } else {
                this.options.errorCallback('Your browser doesn\'t implement Web Speech API');
            }
        },
        stop: function (cb) {
            if (this.recognition) {
                this.recognition.onend = function () {};
                this.recognition.stop();
            }
            if (this.recorder) {
                this.recorder.stop();
            }
            if (this.recognizer) {
                this.recognizer.close();
            }
            this.options.stopCallback();
            if (typeof cb !== 'undefined') {
                if (Object.prototype.toString.call(cb) == '[object Function]') {
                    cb();
                }
            }
        },
        pause: function () {
        },
        isPaused: function () {
            return false;
        },
        getAnalyserNode: function () {
            if (this.recorder) {
                return this.recorder.getAnalyserNode();
            }
        }
    };

    namespace.ya.speechkit.WebAudioRecognition = WebAudioRecognition;
}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    namespace.ya.speechkit.SpeakerId = function () {
        if (!(this instanceof namespace.ya.speechkit.SpeakerId)) {
            return new namespace.ya.speechkit.SpeakerId();
        }

        if (!namespace.ya.speechkit._recorderInited) {
            namespace.ya.speechkit.initRecorder(
                this.onInited.bind(this),
                function (error) {alert('Failed to init recorder: ' + error);}
            );
        }
    };

    namespace.ya.speechkit.SpeakerId.prototype = {
        onInited: function () {
            this.recorder = new namespace.ya.speechkit.Recorder();
        },

        startRecord: function () {
            console.log('Start recording...');
            this.recorder.start(
                function (data) {
                    console.log('Recorder callback, recorded data length: ' + data.byteLength);
                },
                namespace.ya.speechkit.FORMAT.PCM8);
        },

        completeRecordAndRegister: function (userid, keepPrev, text, onRegister) {
            console.log('completeRecordAndRegister');
            this.recorder.stop(function (wav) {
                console.log('Wav is ready:');
                console.log(wav);
                var fd = new FormData();
                fd.append('name', userid);
                fd.append('text', text);
                fd.append('audio', wav);
                fd.append('keepPrev', keepPrev ? 'true' : 'false');

                var xhr = new XMLHttpRequest();

                xhr.open('POST', namespace.ya.speechkit.settings.voicelabUrl + 'register_voice');

                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            console.log(this.responseText);
                            onRegister(this.responseText);
                        } else {
                            onRegister('Failed to register data, could not access ' +
                               namespace.ya.speechkit.settings.voicelabUrl +
                               ' Check out developer tools -> console for more details.');
                        }
                    }
                };

                xhr.send(fd);

            });
        },

        completeRecordAndIdentify: function (onFoundUser) {
            console.log('Indentify');
            this.recorder.stop(function (wav) {
                console.log('Wav is ready:');
                console.log(wav);
                var fd = new FormData();
                fd.append('audio', wav);

                var xhr = new XMLHttpRequest();

                xhr.open('POST', namespace.ya.speechkit.settings.voicelabUrl + 'detect_voice');

                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            console.log(this.responseText);
                            var data = {};
                            try {
                                data = JSON.parse(this.responseText);
                            } catch (e) {
                                onFoundUser(false, 'Failed to find user, internal server error: ' + e);
                                return;
                            }
                            onFoundUser(true, data);
                        } else {
                            onFoundUser(false, 'Failed to find user, could not access ' +
                                namespace.ya.speechkit.settings.voicelabUrl +
                                ' Check out developer tools -> console for more details.');
                        }
                    }
                };

                xhr.send(fd);
            }, 1);
        },

        feedback: function (requestId, feedback) {
            console.log('Post feedback');
            var fd = new FormData();
            fd.append('requestId', requestId);
            fd.append('feedback', feedback);

            var xhr = new XMLHttpRequest();

            xhr.open('POST', namespace.ya.speechkit.settings.voicelabUrl + 'postFeedback');

            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    console.log(this.responseText);
                }
            };

            xhr.send(fd);
        },
    };
}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    namespace.ya.speechkit.Equalizer = function (target, recorder) {
        this.recorder = recorder;
        this.element = document.getElementById(target);
        this.element.style.textAlign = 'center';
        this.element.innerText = '';
        this.graf = document.createElement('canvas');
        this.graf.style.width = '100%';
        this.graf.style.height = '100%';
        this.graf.width = 1000;

        this.element.appendChild(this.graf);

        if (!navigator.cancelAnimationFrame) {
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame ||
                                             navigator.mozCancelAnimationFrame;
        }
        if (!navigator.requestAnimationFrame) {
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame ||
                                              navigator.mozRequestAnimationFrame;
        }

        this.refID = null;

        this.startDrawRealtime();
    };

    namespace.ya.speechkit.Equalizer.prototype = {
        destroy: function () {
            this.stopDrawRealtime();
            this.element.removeChild(this.graf);
        },
        stopDrawRealtime: function () {
            window.cancelAnimationFrame(this.rafID);
            this.rafID = null;
        },
        startDrawRealtime: function () {
            var _this = this;
            function updateAnalysers(time) {
                if (!_this.analyserNode) {
                    if (_this.recorder) {
                        _this.analyserNode = _this.recorder.getAnalyserNode();
                        _this.context = _this.recorder.context;
                    } else {
                        return;
                    }
                }

                var canvasWidth = _this.graf.width;
                var canvasHeight = _this.graf.height;
                var analyserContext = _this.graf.getContext('2d');

                var SPACING = 2;
                var BAR_WIDTH = 1;
                var numBars = Math.round(canvasWidth / SPACING);
                var freqByteData = new Uint8Array(_this.analyserNode.frequencyBinCount);

                _this.analyserNode.getByteFrequencyData(freqByteData);

                analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
                analyserContext.fillStyle = '#F6D565';
                analyserContext.lineCap = 'round';
                var multiplier = _this.analyserNode.frequencyBinCount / numBars;

                for (var i = 0; i < numBars; ++i) {
                    var magnitude = 0;
                    var offset = Math.floor(i * multiplier);
                    for (var j = 0; j < multiplier; j++) {
                        magnitude += freqByteData[offset + j];
                    }
                    magnitude = magnitude / multiplier / 2;
                    analyserContext.fillStyle = 'hsl( ' + Math.round(i * 60 / numBars) + ', 100%, 50%)';
                    analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
                }
                _this.rafID = window.requestAnimationFrame(updateAnalysers);
            }

            this.rafID = window.requestAnimationFrame(updateAnalysers);
        }
    };
}(this));
(function (namespace) {
    'use strict';

    if (typeof namespace.ya === 'undefined') {
        namespace.ya = {};
    }
    if (typeof namespace.ya.speechkit === 'undefined') {
        namespace.ya.speechkit = {};
    }

    namespace.ya.speechkit._mic_on = '<svg version="1.1" id="Layer_1" ' +
    ' xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"' +
    ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    ' x="0px" y="0px" viewBox="0 0 112 112"' +
    ' enable-background="new 0 0 112 112" xml:space="preserve">' +
    ' <g id="tuts" sketch:type="MSPage">' +
    ' <g id="mic_ff" sketch:type="MSLayerGroup">' +
    ' <g sketch:type="MSShapeGroup">' +
    ' <circle id="path-1" fill="rgb(255, 204, 0)" cx="56" cy="56" r="56"/>' +
    ' </g>' +
    ' <g id="speechkit_vector-9" transform="translate(39.000000, 32.000000)" ' +
    ' sketch:type="MSShapeGroup" opacity="0.9">' +
    ' <path id="Shape" d="M17,4c2.8,0,5,2.3,5,5.2v15.6c0,2.9-2.2,5.2-5,5.2s-5-2.3-5-5.2V9.2C12,6.3,14.2,4,17,4 M17,0' +
    ' c-5,0-9,4.1-9,9.2v15.6c0,5.1,4,9.2,9,9.2s9-4.1,9-9.2V9.2C26,4.1,22,0,17,0L17,0z"/>' +
    ' <path id="Shape_1_" ' +
    ' d="M34,23v1.1C34,34,26.4,42,17,42S0,34,0,24.1V23h4v0.1C4,31.3,9.8,38,17,38s13-6.7,13-14.9V23H34z"/>' +
    ' <rect id="Rectangle-311" x="15" y="41" width="4" height="10"/>' +
    ' </g>' +
    ' </g>' +
    ' </g>' +
    ' </svg>';

    namespace.ya.speechkit._mic_off = '<svg version="1.1" id="Layer_1" ' +
    ' xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"' +
    ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    ' x="0px" y="0px" viewBox="0 0 112 112"' +
    ' enable-background="new 0 0 112 112" xml:space="preserve">' +
    ' <g id="tuts" sketch:type="MSPage">' +
    ' <g id="mic_ff" sketch:type="MSLayerGroup">' +
    ' <g id="speechkit_vector-9" transform="translate(39.000000, 32.000000)" ' +
    ' sketch:type="MSShapeGroup" opacity="0.9">' +
    ' <path id="Shape" d="M17,4c2.8,0,5,2.3,5,5.2v15.6c0,2.9-2.2,5.2-5,5.2s-5-2.3-5-5.2V9.2C12,6.3,14.2,4,17,4 M17,0' +
    ' c-5,0-9,4.1-9,9.2v15.6c0,5.1,4,9.2,9,9.2s9-4.1,9-9.2V9.2C26,4.1,22,0,17,0L17,0z"/>' +
    ' <path id="Shape_1_" ' +
    ' d="M34,23v1.1C34,34,26.4,42,17,42S0,34,0,24.1V23h4v0.1C4,31.3,9.8,38,17,38s13-6.7,13-14.9V23H34z"/>' +
    ' <rect id="Rectangle-311" x="15" y="41" width="4" height="10"/>' +
    ' </g>' +
    ' </g>' +
    ' </g>' +
    ' </svg>';

    /**
     * @name Textline
     * @class РљР»Р°СЃСЃ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ СЌР»РµРјРµРЅС‚Р° СѓРїСЂР°РІР»РµРЅРёСЏ "РџРѕР»Рµ РґР»СЏ РіРѕР»РѕСЃРѕРІРѕРіРѕ РІРІРѕРґР°".
     * @param {String} target РРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ div-РєРѕРЅС‚РµР№СЂРµРЅР°, РІ РєРѕС‚РѕСЂРѕРј Р±СѓРґРµС‚ СЂР°Р·РјРµС‰РµРЅ СЌР»РµРјРµРЅС‚ СѓРїСЂР°РІР»РµРЅРёСЏ.
     * @param {Object} [options] РћРїС†РёРё СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
     * @param {Object} [options.onInputFinished] Р¤СѓРЅРєС†РёСЏ, РєРѕС‚РѕСЂР°СЏ Р±СѓРґРµС‚ РІС‹Р·РІР°РЅР° РїРѕСЃР»Рµ Р·Р°РІРµСЂС€РµРЅРёСЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ. Р’ РєР°С‡РµСЃРІРµ РµРµ
     * Р°СЂРіСѓРјРµРЅС‚РѕРІ РїРµСЂРµРґР°РµС‚СЃСЏ С„РёРЅР°Р»СЊРЅС‹Р№ СЂР°СЃРїРѕР·РЅР°РЅРЅС‹Р№ С‚РµРєСЃС‚.
     * @param {String} [options.apikey] API-РєР»СЋС‡. Р•СЃР»Рё РЅРµ Р·Р°РґР°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РєР»СЋС‡, СѓРєР°Р·Р°РЅРЅС‹Р№
     * РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}.
     * @param {Boolean} [options.allowStrongLanguage=false] РЎР»РµРґСѓРµС‚ Р»Рё РѕС‚РєР»СЋС‡РёС‚СЊ С„РёР»СЊС‚СЂР°С†РёСЋ РѕР±СЃС†РµРЅРЅРѕР№ Р»РµРєСЃРёРєРё.
     * @param {String} [options.model='notes'] РЇР·С‹РєРѕРІР°СЏ РјРѕРґРµР»СЊ РґР»СЏ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂРµС‡Рё. РЎРїРёСЃРѕРє РґРѕСЃС‚СѓРїРЅС‹С… Р·РЅР°С‡РµРЅРёР№:
     * <ul>
     *     <li>'notes' (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ) вЂ” С‚РµРєСЃС‚;</li>
     *     <li>'queries' вЂ” РєРѕСЂРѕС‚РєРёРµ Р·Р°РїСЂРѕСЃС‹;</li>
     *     <li>'names' вЂ” РёРјРµРЅР°; </li>
     *     <li>'dates' вЂ” РґР°С‚С‹; </li>
     *     <li>'maps' - С‚РѕРїРѕРЅРёРјС‹;</li>
     *     <li>'notes' - С‚РµРєСЃС‚С‹;</li>
     *     <li>'numbers' вЂ” С‡РёСЃР»Р°.</li>
     * </ul>
     * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
     * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ
     * РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РјРѕРґРµР»СЊ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ - 'notes'. </p>
     * @param {String} [options.lang='ru-RU'] РЇР·С‹Рє, СЂРµС‡СЊ РЅР° РєРѕС‚РѕСЂРѕРј СЃР»РµРґСѓРµС‚ СЂР°СЃРїРѕР·РЅР°РІР°С‚СЊ. Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ: 'ru-RU', 'en-US', 'tr-TR', 'uk-UA'.
     * <p>Р•СЃР»Рё РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ
     * Р·РЅР°С‡РµРЅРёРµ, Р·Р°РґР°РЅРЅРѕРµ РІ РіР»РѕР±Р°Р»СЊРЅС‹С… РЅР°СЃС‚СЂРѕР№РєР°С… {@link settings}. Р•СЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… Р·РЅР°С‡РµРЅРёРµ РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
     * РІС‹Р±РёСЂР°РµС‚СЃСЏ СЂСѓСЃСЃРєРёР№ СЏР·С‹Рє: 'ru-RU'. </p>
     * @param {ya.speechkit.FORMAT} [options.format=ya.speechkit.FORMAT.PCM16] Р¤РѕСЂРјР°С‚ РїРµСЂРµРґР°С‡Рё Р°СѓРґРёРѕ-СЃРёРіРЅР°Р»Р°.
     */
    namespace.ya.speechkit.Textline = function (target, options) {
        if (!(this instanceof namespace.ya.speechkit.Textline)) {
            return new namespace.ya.speechkit.Textline(target, options);
        }

        var el = document.getElementById(target);
        if (el.tagName != 'INPUT') {
            this.element = el;
            this.textinput = document.createElement('input');
            this.textinput.style.height = '100%';
            this.textinput.style.width = '100%';
        } else {
            this.textinput = el;
            this.element = null;
        }
        this.textinput.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,' +
                                                namespace.ya.speechkit._mic_off + '\')';
        this.textinput.style.backgroundRepeat = 'no-repeat';
        this.textinput.style.backgroundPosition = 'right center';
        if (this.element) {
            this.element.appendChild(this.textinput);
        }

        this.dict = null;

        this.final_result = '';

        var _this = this;

        this.textinput.onmousemove = function (event) {
            var rect = _this.textinput.getBoundingClientRect();
            if (event.clientX - rect.x > rect.width - rect.height)
            {
                _this.textinput.style.cursor = 'pointer';
            } else {
                _this.textinput.style.cursor = 'text';
            }
        };

        options = options || {};

        options.dataCallback = function (text, uttr, merge) {
            _this.textinput.value = text;
            if (uttr) {
                if (options.onInputFinished) {
                    _this.final_result = text;
                    options.onInputFinished(text);
                }
                _this.dict.abort();
            }
        };

        options.initCallback = function () {
            _this.textinput.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,' + ya.speechkit._mic_on + '\')';
        };

        options.stopCallback = function () {
            _this.textinput.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,' + ya.speechkit._mic_off + '\')';
            _this.dict = null;
        };

        this.textinput.onmousedown = function (event) {
            var rect = _this.textinput.getBoundingClientRect();

            if (event.clientX <= rect.width - rect.height) {
                return;
            }

            if (!_this.dict) {
                _this.dict = new ya.speechkit.SpeechRecognition();
            }
            if (_this.dict.isPaused())
            {
                _this.dict.start(options);
            } else {
                _this.dict.stop();
            }
        };

        return {
            /**
             * РЈРґР°Р»СЏРµС‚ СЌР»РµРјРµРЅС‚ СѓРїСЂР°РІР»РµРЅРёСЏ.
             * @name Textline.destroy
             * @function
             */
            destroy: function () {
                if (_this.dict) {
                    _this.dict.stop();
                }
                _this.textinput.style.backgroundImage = '';
                _this.textinput.onmousedown = function () {};
                _this.textinput.onmousemove = function () {};

                if (_this.element) {
                    _this.element.removeChild(_this.textinput);
                }
            },
            /**
             * РџРѕР»СѓС‡Р°РµС‚ С„РёРЅР°Р»СЊРЅС‹Р№ СЂРµР·СѓР»СЊС‚Р°С‚ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ РІ СЃРёРЅС…СЂРѕРЅРЅРѕРј СЂРµР¶РёРјРµ.
             * @name Textline.value
             * @function
             * @returns {string} Р РµР·СѓР»СЊС‚Р°С‚ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ.
             *
             * @example
             * var textline = new ya.speechkit.Textline('myDiv');
             *
             * setTimeout(function () {
             *     console.log("Р РµР·СѓР»СЊС‚Р°С‚ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ: " + textline.value());
             * }, 5000);
             */
            value: function () {
                return _this.final_result;
            }
        };
    };
}(this));
