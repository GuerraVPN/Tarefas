package br.com.guerravpn.crediflow;

import android.app.Activity;
import android.content.Intent;
import android.view.View;

public final class UpdateOpenListener implements View.OnClickListener {
    private final Activity activity;

    public UpdateOpenListener(Activity activity) {
        this.activity = activity;
    }

    @Override
    public void onClick(View v) {
        activity.startActivity(new Intent(activity, UpdateActivity.class));
    }
}
