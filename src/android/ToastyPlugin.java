// src/android/ToastyPlugin.java
// 목적: JS의 cordova.exec(..., "ToastyPlugin", "show", [message, duration]) 호출을 처리하여
//       안드로이드 Toast를 표시합니다.

package com.asher27.cordova.plugin;

import android.widget.Toast;
import android.text.TextUtils;
import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

public class ToastyPlugin extends CordovaPlugin {

    private static final String ACTION_SHOW = "show";

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        if (ACTION_SHOW.equals(action)) {
            // 파라미터: [message, duration]
            final String message  = args.optString(0, "");
            final String duration = args.optString(1, "short"); // "short" | "long"

            if (TextUtils.isEmpty(message)) {
                callbackContext.error("Message is empty.");
                return true;
            }

            // UI 스레드에서 Toast 표시
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    int toastDuration = "long".equalsIgnoreCase(duration) ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
                    Toast.makeText(cordova.getActivity().getApplicationContext(), message, toastDuration).show();
                    callbackContext.success(); // 성공 신호
                }
            });

            return true; // 처리 완료
        }

        // 지원하지 않는 action
        callbackContext.error("Unknown action: " + action);
        return false;
    }
}
