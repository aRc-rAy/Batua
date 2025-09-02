package com.spendbook.widget;

import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class WidgetModule extends ReactContextBaseJavaModule {
    
    private static final String NAME = "WidgetModule";

    public WidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return NAME;
    }

    /**
     * Update widget data from React Native
     */
    @ReactMethod
    public void updateWidgetData(double todaySpending, double weekSpending, double monthSpending, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            // Update both full and compact widgets
            SpendingWidgetProvider.updateWidgetData(context, todaySpending, weekSpending, monthSpending);
            CompactSpendingWidgetProvider.updateWidgetData(context, todaySpending, weekSpending, monthSpending);
            promise.resolve("Widget updated successfully");
        } catch (Exception e) {
            promise.reject("WIDGET_UPDATE_ERROR", e.getMessage(), e);
        }
    }

    /**
     * Check if widgets are available on the home screen
     */
    @ReactMethod
    public void areWidgetsSupported(Promise promise) {
        try {
            // Most Android devices support widgets
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("WIDGET_CHECK_ERROR", e.getMessage(), e);
        }
    }
}
