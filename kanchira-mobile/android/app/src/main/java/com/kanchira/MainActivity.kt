package com.kanchira;

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "kanchira"

  /**
   * Returns the instance of the [ReactActivityDelegate].
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      )
}
