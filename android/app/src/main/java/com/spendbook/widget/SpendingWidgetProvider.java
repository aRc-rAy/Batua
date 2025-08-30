package com.spendbook.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import com.spendbook.R;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Implementation of App Widget functionality for Batua Payment Tracker.
 * Displays daily and monthly spending totals on the home screen.
 */
public class SpendingWidgetProvider extends AppWidgetProvider {
    
    private static final String PREFS_NAME = "BatuaWidgetPrefs";
    private static final String PREF_TODAY_SPENDING = "todaySpending";
    private static final String PREF_MONTH_SPENDING = "monthSpending";
    private static final String PREF_LAST_UPDATED = "lastUpdated";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Update all active widgets
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Get spending data from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        double todaySpending = prefs.getFloat(PREF_TODAY_SPENDING, 0.0f);
        double monthSpending = prefs.getFloat(PREF_MONTH_SPENDING, 0.0f);
        String lastUpdated = prefs.getString(PREF_LAST_UPDATED, "Never");

        // Format currency values
        DecimalFormat currencyFormat = new DecimalFormat("#,##0.00");
        String todayText = "₹" + currencyFormat.format(todaySpending);
        String monthText = "₹" + currencyFormat.format(monthSpending);

        // Get current date
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd", Locale.getDefault());
        String currentDate = dateFormat.format(new Date());

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.spending_widget);
        
        // Update widget content
        views.setTextViewText(R.id.widget_title, "💰 SpendBook");
        views.setTextViewText(R.id.widget_date, currentDate);
        views.setTextViewText(R.id.widget_today_label, "Today");
        views.setTextViewText(R.id.widget_today_amount, todayText);
        views.setTextViewText(R.id.widget_month_label, "This Month");
        views.setTextViewText(R.id.widget_month_amount, monthText);
        views.setTextViewText(R.id.widget_last_updated, "Updated: " + lastUpdated);

        // Create intent to open the app when widget is tapped
        Intent intent = new Intent(context, com.spendbook.MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        android.app.PendingIntent pendingIntent = android.app.PendingIntent.getActivity(
            context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    /**
     * Update widget data from React Native
     */
    public static void updateWidgetData(Context context, double todaySpending, double monthSpending) {
        // Store data in SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putFloat(PREF_TODAY_SPENDING, (float) todaySpending);
        editor.putFloat(PREF_MONTH_SPENDING, (float) monthSpending);
        
        // Update timestamp
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        String currentTime = timeFormat.format(new Date());
        editor.putString(PREF_LAST_UPDATED, currentTime);
        editor.apply();

        // Update all widgets
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, SpendingWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(component);
        
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
