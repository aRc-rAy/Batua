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
 * Implementation of App Widget functionality for SpendBook Payment Tracker.
 * Displays daily, weekly, and monthly spending totals with action buttons.
 */
public class SpendingWidgetProvider extends AppWidgetProvider {
    
    private static final String PREFS_NAME = "SpendBookWidgetPrefs";
    private static final String PREF_TODAY_SPENDING = "todaySpending";
    private static final String PREF_WEEK_SPENDING = "weekSpending";
    private static final String PREF_MONTH_SPENDING = "monthSpending";
    private static final String PREF_LAST_UPDATED = "lastUpdated";
    
    // Action constants
    private static final String ACTION_ADD_PAYMENT = "com.spendbook.widget.ADD_PAYMENT";
    private static final String ACTION_OPEN_APP = "com.spendbook.widget.OPEN_APP";

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
        } else if (ACTION_OPEN_APP.equals(action)) {
            // Open app normally
            Intent openAppIntent = new Intent(context, com.spendbook.MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            context.startActivity(openAppIntent);
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
        double weekSpending = prefs.getFloat(PREF_WEEK_SPENDING, 0.0f);
        double monthSpending = prefs.getFloat(PREF_MONTH_SPENDING, 0.0f);
        String lastUpdated = prefs.getString(PREF_LAST_UPDATED, "Never");

        // Format currency values in compact format
        String todayText = "₹" + formatAmountCompact(todaySpending);
        String weekText = "₹" + formatAmountCompact(weekSpending);
        String monthText = "₹" + formatAmountCompact(monthSpending);

        // Get current date and day
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
        SimpleDateFormat dayFormat = new SimpleDateFormat("EEEE", Locale.getDefault());
        String currentDate = dateFormat.format(new Date());
        String currentDay = dayFormat.format(new Date());

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.spending_widget);
        
        // Update widget content
        views.setTextViewText(R.id.widget_day, currentDay);
        views.setTextViewText(R.id.widget_date, currentDate);
        views.setTextViewText(R.id.widget_today_amount, todayText);
        views.setTextViewText(R.id.widget_week_amount, weekText);
        views.setTextViewText(R.id.widget_month_amount, monthText);

        // Set up button click handlers
        Intent addPaymentIntent = new Intent(context, SpendingWidgetProvider.class);
        addPaymentIntent.setAction(ACTION_ADD_PAYMENT);
        PendingIntent addPaymentPendingIntent = PendingIntent.getBroadcast(
            context, 0, addPaymentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_add_payment_btn, addPaymentPendingIntent);

        Intent openAppIntent = new Intent(context, SpendingWidgetProvider.class);
        openAppIntent.setAction(ACTION_OPEN_APP);
        PendingIntent openAppPendingIntent = PendingIntent.getBroadcast(
            context, 1, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Set the main container to open the app
        views.setOnClickPendingIntent(R.id.widget_container, openAppPendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    /**
     * Update widget data from React Native
     */
    public static void updateWidgetData(Context context, double todaySpending, double weekSpending, double monthSpending) {
        // Store data in SharedPreferences
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

        // Update all widgets
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, SpendingWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(component);
        
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
    
    /**
     * Format amount in compact form (1.5k, 2.3L, etc.)
     */
    private static String formatAmountCompact(double amount) {
        if (amount >= 10000000) { // 1 crore and above
            double crores = amount / 10000000.0;
            return String.format(Locale.getDefault(), "%.1fCr", crores);
        } else if (amount >= 100000) { // 1 lakh and above
            double lakhs = amount / 100000.0;
            return String.format(Locale.getDefault(), "%.1fL", lakhs);
        } else if (amount >= 1000) { // 1 thousand and above
            double thousands = amount / 1000.0;
            return String.format(Locale.getDefault(), "%.1fK", thousands);
        } else {
            // Less than 1000, show full amount
            return String.format(Locale.getDefault(), "%.0f", amount);
        }
    }
}
