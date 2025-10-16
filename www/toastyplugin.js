/* global cordova */
// www/toastyplugin.js
// 목적: Cordova의 JS 레이어에서 네이티브(자바) 코드를 호출하기 위한 브릿지.
// 사용법(원문 스타일 유지):
//   window.plugins.toastyPlugin.show("안녕하세요", "long");
// 내부적으로 cordova.exec(success, error, service, action, args)를 호출합니다.

var toastyPlugin = (function () {
    // duration 정규화: "short" | "long"
    function normalizeDuration(duration) {
        if (!duration) return 'short';
        var d = String(duration).toLowerCase();
        return d === 'long' || d === 'short' ? d : 'short';
    }

    // Cordova 준비 여부 확인 (deviceready 이전 호출 방지)
    function ensureCordovaReady() {
        if (typeof cordova === 'undefined' || !cordova.exec) {
            throw new Error(
                "[ToastyPlugin] Cordova not ready. Call after 'deviceready' (e.g., OnApplicationReady)."
            );
        }
    }

    return {
        /**
         * 네이티브 Toast 표시
         * @param {string} message  - 화면에 표시할 문자열(필수)
         * @param {"short"|"long"} [duration="short"] - 표시 시간 옵션
         * @returns {Promise<void>}
         */
        show: function (message, duration, successCallback, errorCallback) {
            ensureCordovaReady();

            if (typeof message !== 'string' || message.length === 0) {
                const err = new Error(
                    "[ToastyPlugin] 'message' must be a non-empty string."
                );
                if (typeof errorCallback === 'function')
                    errorCallback(err.message);
                return Promise.reject(err);
            }

            var dur = normalizeDuration(duration);

            return new Promise(function (resolve, reject) {
                // service: plugin.xml의 <feature name="ToastyPlugin"> 와 동일해야 함
                // action : 네이티브 execute() 내 분기 키 ("show")
                // args   : 네이티브로 전달할 파라미터 배열
                cordova.exec(
                    function (msg) {
                        // ✅ 네이티브 success 콜백
                        if (typeof successCallback === 'function') {
                            try {
                                successCallback(msg || 'done');
                            } catch (e) {
                                console.warn(
                                    '[ToastyPlugin] successCallback threw:',
                                    e
                                );
                            }
                        }
                        resolve(msg);
                    },
                    function (err) {
                        // ❌ 네이티브 error 콜백
                        const message =
                            err && err.message ? err.message : String(err);
                        if (typeof errorCallback === 'function') {
                            try {
                                errorCallback(message);
                            } catch (e) {
                                console.warn(
                                    '[ToastyPlugin] errorCallback threw:',
                                    e
                                );
                            }
                        }
                        reject(
                            new Error(
                                '[ToastyPlugin] Native call failed: ' + message
                            )
                        );
                    },
                    'ToastyPlugin',
                    'show',
                    [message + ' -> version tagging 2.0', dur]
                );
            });
        },
    };
})();

// module.exports로 노출 + plugin.xml의 <clobbers target="window.plugins.toastyPlugin" />
module.exports = toastyPlugin;
