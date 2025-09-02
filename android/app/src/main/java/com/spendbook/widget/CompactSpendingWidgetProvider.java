package com.spendbook.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.app.PendingIntent;
import com.spendbook.R;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Implementation of Compact App Widget functionality for SpendBook Payment Tracker.
 * Displays daily, weekly, and monthly spending totals in a compact layout.
 */
public class CompactSpendingWidgetProvider extends AppWidgetProvider {
    
    private static final String PREFS_NAME = "SpendBookWidgetPrefs";
    private static final String PREF_TODAY_SPENDING = "todaySpending";
    private static final String PREF_WEEK_SPENDING = "weekSpending";
    private static final String PREF_MONTH_SPENDING = "monthSpending";
    private static final String PREF_LAST_UPDATED = "lastUpdated";
    
    // Action constants
    private static final String ACTION_ADD_PAYMENT = "com.spendbook.widget.ADD_PAYMENT_COMPACT";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Update all active widgets
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (ACTION_ADD_PAYMENT.equals(action)) {
            // Open app with add payment screen
            Intent addPaymentIntent = new Intent(context, com.spendbook.MainActivity.class);
            addPaymentIntent.putExtra("screen", "AddPayment");
            addPaymentIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            context.startActivity(addPaymentIntent);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Get spending data from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        double todaySpending = prefs.getFloat(PREF_TODAY_SPENDING, 0.0f);
        double weekSpending = prefs.getFloat(PREF_WEEK_SPENDING, 0.0f);
        double monthSpending = prefs.getFloat(PREF_MONTH_SPENDING, 0.0f);

        // Format currency values (same as main widget)
        DecimalFormat currencyFormat = new DecimalFormat("#,##0.00");
        
        String todayText = "₹" + currencyFormat.format(todaySpending);
        String weekText = "₹" + currencyFormat.format(weekSpending);
        String monthText = "₹" + currencyFormat.format(monthSpending);

        // Get current date and day
        SimpleDateFormat dayFormat = new SimpleDateFormat("EEEE", Locale.getDefault());
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
        String currentDay = dayFormat.format(new Date());
        String currentDate = dateFormat.format(new Date());

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.spending_widget_small);
        
        // Update widget content
        views.setTextViewText(R.id.widget_day_small, currentDay);
        views.setTextViewText(R.id.widget_date_small, currentDate);
        views.setTextViewText(R.id.widget_today_amount_small, todayText);
        views.setTextViewText(R.id.widget_week_amount_small, weekText);
        views.setTextViewText(R.id.widget_month_amount_small, monthText);

        // Set up button click handler
        Intent addPaymentIntent = new Intent(context, CompactSpendingWidgetProvider.class);
        addPaymentIntent.setAction(ACTION_ADD_PAYMENT);
        PendingIntent addPaymentPendingIntent = PendingIntent.getBroadcast(
            context, 0, addPaymentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_add_payment_btn_small, addPaymentPendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    /**
     * Update widget data from React Native
     */
    public static void updateWidgetData(Context context, double todaySpending, double weekSpending, double monthSpending) {
        // Use the same SharedPreferences as the main widget
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putFloat(PREF_TODAY_SPENDING, (float) todaySpending);
        editor.putFloat(PREF_WEEK_SPENDING, (float) weekSpending);
        editor.putFloat(PREF_MONTH_SPENDING, (float) monthSpending);
        
        // Update timestamp
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        String currentTime = timeFormat.format(new Date());
        editor.putString(PREF_LAST_UPDATED, currentTime);
        editor.apply();

        // Update all compact widgets
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, CompactSpendingWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(component);
        
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
